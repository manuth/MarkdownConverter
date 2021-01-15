import { createServer, Server } from "http";
import { resolve } from "url";
import { promisify } from "util";
import { TempDirectory } from "@manuth/temp-files";
import { ensureDir, move, pathExists, remove, writeFile } from "fs-extra";
import getPort = require("get-port");
import { glob } from "glob";
import { Browser, launch, PDFOptions, ScreenshotOptions } from "puppeteer-core";
import serveHandler = require("serve-handler");
import { basename, dirname, join, normalize, relative } from "upath";
import { CancellationToken, Progress } from "vscode";
import websiteScraper = require("website-scraper");
import { Resources } from "../Properties/Resources";
import { Settings } from "../Properties/Settings";
import { Document } from "../System/Documents/Document";
import { FileException } from "../System/IO/FileException";
import { OperationCancelledException } from "../System/OperationCancelledException";
import { IProgressState } from "../System/Tasks/IProgressState";
import { ConversionType } from "./ConversionType";
import { ConverterPlugin } from "./ConverterPlugin";

/**
 * Provides a markdown-converter.
 */
export class Converter
{
    /**
     * The root of the document-context.
     */
    private documentRoot: string;

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
     * @param documentRoot
     * The root of the document-context.
     *
     * @param document
     * The document which is to be converted.
     */
    public constructor(documentRoot: string, document: Document)
    {
        this.documentRoot = documentRoot;
        this.document = document;
    }

    /**
     * Gets the root of the document-context.
     */
    public get DocumentRoot(): string
    {
        return this.documentRoot;
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
            (resolve(`http://localhost:${this.PortNumber}/`, this.WebDocumentName)) :
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
     * Gets the name of the website containing the document.
     */
    protected get WebDocumentName(): string
    {
        return (
            (this.Document.FileName && this.DocumentRoot) ?
                relative(this.DocumentRoot, this.Document.FileName) :
                "index") + ".html";
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
        if (this.Initialized || this.Disposed)
        {
            throw new Error("The converter cannot be re-initialized.");
        }
        else
        {
            progressReporter?.report(
                {
                    message: Resources.Resources.Get("Progress.LaunchWebserver")
                });

            this.portNumber = await getPort();

            this.webServer = createServer(
                async (request, response) =>
                {
                    if (normalize(join(this.DocumentRoot, request.url)) === normalize(join(this.DocumentRoot, this.WebDocumentName)))
                    {
                        let content = await this.Document.Render();
                        response.writeHead(200);
                        response.write(content);
                        response.end();
                    }
                    else
                    {
                        serveHandler(
                            request,
                            response,
                            {
                                public: this.DocumentRoot,
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
                    }
                });

            this.webServer.listen(this.portNumber, "localhost");

            let browserArguments = ["--disable-web-security"];

            progressReporter?.report(
                {
                    message: Resources.Resources.Get("Progress.LaunchChromium")
                });

            try
            {
                this.browser = await launch(
                    {
                        args: [
                            ...browserArguments,
                            ...Settings.Default.ChromiumArgs
                        ]
                    });
            }
            catch
            {
                this.browser = await launch(
                    {
                        args: [
                            ...browserArguments,
                            ...Settings.Default.ChromiumArgs,
                            "--no-sandbox"
                        ]
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

            await new Promise<void>(
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
     *
     * @param cancellationToken
     * A component for handling cancellations.
     */
    public async Start(conversionType: ConversionType, path: string, progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken): Promise<void>
    {
        if (!this.Initialized)
        {
            throw new Error("The converter must be initialized in order to use it.");
        }
        else
        {
            await ensureDir(dirname(path));

            switch (conversionType)
            {
                case ConversionType.HTML:
                    progressReporter?.report(
                        {
                            message: Resources.Resources.Get("Progress.WriteHTML")
                        });

                    await writeFile(path, await this.Document.Render());
                    break;
                case ConversionType.SelfContainedHTML:
                    let tempDir = new TempDirectory();
                    await remove(tempDir.FullName);

                    progressReporter?.report(
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

                    progressReporter?.report(
                        {
                            message: Resources.Resources.Get("Progress.ScrapeFolder")
                        });

                    for (let filename of await promisify(glob)("**/*", { cwd: tempDir.FullName }))
                    {
                        if (!(cancellationToken?.isCancellationRequested ?? false))
                        {
                            if (await pathExists(tempDir.MakePath(filename)))
                            {
                                await move(tempDir.MakePath(filename), join(dirname(path), filename), { overwrite: true });
                            }
                        }
                        else
                        {
                            throw new OperationCancelledException();
                        }
                    }

                    tempDir.Dispose();
                    break;
                default:
                    try
                    {
                        let page = await this.Browser.newPage();

                        progressReporter?.report(
                            {
                                message: Resources.Resources.Get("Progress.ChromiumPage")
                            });

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

                                progressReporter?.report(
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

                                switch (conversionType)
                                {
                                    case ConversionType.JPEG:
                                        screenshotOptions.type = "jpeg";
                                        screenshotOptions.quality = this.Document.Quality;
                                        break;
                                    case ConversionType.PNG:
                                        screenshotOptions.type = "png";
                                        break;
                                }

                                progressReporter?.report(
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
                            throw new FileException(null, exception.path);
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
