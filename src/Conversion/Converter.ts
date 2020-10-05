import FileSystem = require("fs-extra");
import PortFinder = require("get-port");
import Glob = require("glob");
import http = require("http");
import Path = require("path");
import Puppeteer = require("puppeteer-core");
import handler = require("serve-handler");
import { TempDirectory } from "temp-filesystem";
import URL = require("url");
import { isNullOrUndefined, promisify } from "util";
import { Progress } from "vscode";
import Scrape = require("website-scraper");
import { Resources } from "../Properties/Resources";
import { Document } from "../System/Documents/Document";
import { FileException } from "../System/IO/FileException";
import { IProgressState } from "../System/Tasks/IProgressState";
import { ConversionType } from "./ConversionType";
import { ConverterPlugin } from "./ConverterPlugin";

/**
 * Provides a markdown-converter.
 */
export class Converter
{
    /**
     * The root-directory of the workspace of the document.
     */
    private workspaceRoot: string;

    /**
     * The document which is to be converted.
     */
    private document: Document;

    /**
     * The web-server of the converter.
     */
    private webServer: http.Server;

    /**
     * The port-number the web-server runs on.
     */
    private portNumber: number;

    /**
     * The browser which is used to perform the conversion.
     */
    private browser: Puppeteer.Browser;

    /**
     * A value indicating whether the converter has been initialized.
     */
    private initialized = false;

    /**
     * A value indicating whether the converter has been disposed.
     */
    private disposed = false;

    /**
     * Initializes a new instance of the Constructor class with a filepath.
     *
     * @param workspaceRoot
     * The root of the workspace of the document.
     *
     * @param document
     * The document which is to be converted.
     */
    constructor(workspaceRoot: string, document: Document)
    {
        this.workspaceRoot = workspaceRoot;
        this.document = document;
    }

    /**
     * Gets or sets the root-directory of the workspace of the document.
     */
    public get WorkspaceRoot(): string
    {
        return this.workspaceRoot;
    }

    /**
     * Gets the document which is converted by this `Converter`.
     */
    public get Document(): Document
    {
        return this.document;
    }

    /**
     * Gets a value indicating whether the converter has been initialized.
     */
    public get Initialized(): boolean
    {
        return this.initialized;
    }

    /**
     * Gets a value indicating whether the converter has been disposed.
     */
    public get Disposed(): boolean
    {
        return this.disposed;
    }

    /**
     * Gets the link to the document to convert.
     */
    public get URL(): string
    {
        return this.Initialized ? (URL.resolve(
            `http://localhost:${this.PortNumber}/`,
            ((!isNullOrUndefined(this.Document.FileName) && !isNullOrUndefined(this.WorkspaceRoot)) ?
                Path.relative(this.WorkspaceRoot, this.Document.FileName) : "index") + ".html")) : null;
    }

    /**
     * Gets or sets the port-number the web-server runs on.
     */
    public get PortNumber(): number
    {
        return this.Initialized ? this.portNumber : null;
    }

    /**
     * Gets or sets the web-server of the converter.
     */
    protected get WebServer(): http.Server
    {
        return this.Initialized ? this.webServer : null;
    }

    /**
     * Gets the browser which is used to perform the conversion.
     */
    protected get Browser()
    {
        return this.Initialized ? this.browser : null;
    }

    /**
     * Initializes the converter.
     */
    public async Initialize(progressReporter?: Progress<IProgressState>)
    {
        progressReporter = progressReporter || { report() { } };

        if (this.Initialized || this.Disposed)
        {
            throw new Error("The converter cannot be re-initialized.");
        }
        else
        {
            progressReporter.report(
                {
                    message: Resources.Resources.Get("Progress.LaunchWebserver")
                });

            this.portNumber = await PortFinder();
            this.webServer = http.createServer(
                (request, response) =>
                {
                    handler(
                        request,
                        response,
                        {
                            public: this.WorkspaceRoot,
                            headers: [
                                {
                                    source: "**/*.*",
                                    headers: [
                                        {
                                            key: "Access-Control-Allow-Origin",
                                            value: "*"
                                        },
                                        {
                                            key: "Access-Control-Allow-Headers",
                                            value: "Origin, X-Requested-With, Content-Type, Accept, Range"
                                        }
                                    ]
                                }
                            ],
                            cleanUrls: false
                        });
                });

            this.webServer.listen(this.portNumber, "localhost");

            let browserArguments = ["--disable-web-security"];

            progressReporter.report(
                {
                    message: Resources.Resources.Get("Progress.LaunchChromium")
                });

            try
            {
                this.browser = await Puppeteer.launch({
                    args: browserArguments
                });
            }
            catch
            {
                this.browser = await Puppeteer.launch({
                    args: browserArguments.concat(["--no-sandbox"])
                });
            }

            this.initialized = true;
        }
    }

    /**
     * Disposes the converter.
     */
    public async Dispose()
    {
        if (this.Initialized)
        {
            await this.browser.close();
            await new Promise(
                (resolve) =>
                {
                    this.WebServer.close(() => resolve());
                });

        }

        this.initialized = false;
        this.disposed = true;
    }

    /**
     * Starts the conversion.
     *
     * @param conversionType
     * The type to convert the document to.
     *
     * @param path
     * The path to save the converted file to.
     */
    public async Start(conversionType: ConversionType, path: string, progressReporter?: Progress<IProgressState>): Promise<void>
    {
        progressReporter = progressReporter || { report() { } };

        if (!this.Initialized)
        {
            throw new Error("The converter must be initialized in order to use it.");
        }
        else
        {
            switch (conversionType)
            {
                case ConversionType.HTML:
                    progressReporter.report(
                        {
                            message: Resources.Resources.Get("Progress.WriteHTML")
                        });

                    await FileSystem.writeFile(path, await this.Document.Render());
                    break;
                case ConversionType.SelfContainedHTML:
                    let tempDir = new TempDirectory();
                    await FileSystem.remove(tempDir.FullName);

                    progressReporter.report(
                        {
                            message: Resources.Resources.Get("Progress.Scrape")
                        });

                    await Scrape(
                        {
                            urls: [this.URL],
                            directory: tempDir.FullName,
                            plugins: [
                                new ConverterPlugin(
                                    this,
                                    Path.basename(path))
                            ]
                        } as any);

                    progressReporter.report(
                        {
                            message: Resources.Resources.Get("Progress.ScrapeFolder")
                        });

                    for (let filename of await promisify(Glob)("**/*", { cwd: tempDir.FullName }))
                    {
                        if (await FileSystem.pathExists(tempDir.MakePath(filename)))
                        {
                            await FileSystem.move(tempDir.MakePath(filename), Path.join(Path.dirname(path), filename), { overwrite: true });
                        }
                    }

                    tempDir.Dispose();
                    break;
                default:
                    try
                    {
                        let body = await this.Document.Render();
                        let page = await this.Browser.newPage();

                        progressReporter.report(
                            {
                                message: Resources.Resources.Get("Progress.ChromiumPage")
                            });

                        page.on(
                            "request",
                            async (request) =>
                            {
                                if (request.url() === this.URL)
                                {
                                    await request.respond(
                                        {
                                            body
                                        });
                                }
                                else
                                {
                                    await request.continue();
                                }
                            });

                        await page.setRequestInterception(true);
                        await page.goto(this.URL, { waitUntil: "networkidle0", timeout: 0 });

                        switch (conversionType)
                        {
                            case ConversionType.PDF:
                                let styles = `
                                <style>
                                    :root
                                    {
                                        font-size: 11px;
                                    }
                                </style>`;
                                let pdfOptions: Puppeteer.PDFOptions = {
                                    margin: {
                                        top: this.Document.Paper.Margin.Top,
                                        right: this.Document.Paper.Margin.Right,
                                        bottom: this.Document.Paper.Margin.Bottom,
                                        left: this.Document.Paper.Margin.Left
                                    },
                                    printBackground: true,
                                    path
                                };

                                Object.assign(pdfOptions, this.Document.Paper.Format.PDFOptions);

                                if (this.Document.HeaderFooterEnabled)
                                {
                                    pdfOptions.displayHeaderFooter = true;
                                    pdfOptions.headerTemplate = styles + await this.Document.Header.Render();
                                    pdfOptions.footerTemplate = styles + await this.Document.Footer.Render();
                                }

                                progressReporter.report(
                                    {
                                        message: Resources.Resources.Get("Progress.PDF")
                                    });

                                await page.pdf(pdfOptions);
                                break;
                            default:
                                let screenshotOptions: Puppeteer.ScreenshotOptions = {
                                    fullPage: true,
                                    path
                                };

                                if (conversionType !== ConversionType.PNG)
                                {
                                    screenshotOptions.quality = this.Document.Quality;
                                }

                                progressReporter.report(
                                    {
                                        message: Resources.Resources.Get("Progress.Screenshot")
                                    });

                                await page.screenshot(screenshotOptions);
                                break;
                        }
                    }
                    catch (exception)
                    {
                        if ("path" in exception)
                        {
                            throw new FileException(null, exception["path"]);
                        }
                        else
                        {
                            throw exception;
                        }
                    }
                    break;
            }
        }
    }
}