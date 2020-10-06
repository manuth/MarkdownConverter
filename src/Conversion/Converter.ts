import { createServer, Server } from "http";
import { resolve } from "url";
import { promisify } from "util";
import { TempDirectory } from "@manuth/temp-files";
import { move, pathExists, remove, writeFile } from "fs-extra";
import getPort = require("get-port");
import { glob } from "glob";
import { Browser, launch, PDFOptions, ScreenshotOptions } from "puppeteer-core";
import serveHandler = require("serve-handler");
import { basename, dirname, join, relative } from "upath";
import { Progress } from "vscode";
import websiteScraper = require("website-scraper");
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
    private webServer: Server;

    /**
     * The port-number the web-server runs on.
     */
    private portNumber: number;

    /**
     * The browser which is used to perform the conversion.
     */
    private browser: Browser;

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
    public constructor(workspaceRoot: string, document: Document)
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
        return this.Initialized ?
            (resolve(
                `http://localhost:${this.PortNumber}/`,
                ((this.Document.FileName && this.WorkspaceRoot) ?
                    relative(this.WorkspaceRoot, this.Document.FileName) :
                    "index") + ".html")) :
            null;
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
    protected get WebServer(): Server
    {
        return this.Initialized ? this.webServer : null;
    }

    /**
     * Gets the browser which is used to perform the conversion.
     */
    protected get Browser(): Browser
    {
        return this.Initialized ? this.browser : null;
    }

    /**
     * Initializes the converter.
     *
     * @param progressReporter
     * A component for reporting progress.
     */
    public async Initialize(progressReporter?: Progress<IProgressState>): Promise<void>
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

            this.portNumber = await getPort();

            this.webServer = createServer(
                (request, response) =>
                {
                    serveHandler(
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
                this.browser = await launch(
                    {
                        args: browserArguments
                    });
            }
            catch
            {
                this.browser = await launch(
                    {
                        args: browserArguments.concat(["--no-sandbox"])
                    });
            }

            this.initialized = true;
        }
    }

    /**
     * Disposes the converter.
     */
    public async Dispose(): Promise<void>
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
     *
     * @param progressReporter
     * A component for reporting progress.
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

                    await writeFile(path, await this.Document.Render());
                    break;
                case ConversionType.SelfContainedHTML:
                    let tempDir = new TempDirectory();
                    await remove(tempDir.FullName);

                    progressReporter.report(
                        {
                            message: Resources.Resources.Get("Progress.Scrape")
                        });

                    await websiteScraper(
                        {
                            urls: [this.URL],
                            directory: tempDir.FullName,
                            plugins: [
                                new ConverterPlugin(
                                    this,
                                    basename(path))
                            ]
                        } as any);

                    progressReporter.report(
                        {
                            message: Resources.Resources.Get("Progress.ScrapeFolder")
                        });

                    for (let filename of await promisify(glob)("**/*", { cwd: tempDir.FullName }))
                    {
                        if (await pathExists(tempDir.MakePath(filename)))
                        {
                            await move(tempDir.MakePath(filename), join(dirname(path), filename), { overwrite: true });
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

                                let pdfOptions: PDFOptions = {
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
                                let screenshotOptions: ScreenshotOptions = {
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
