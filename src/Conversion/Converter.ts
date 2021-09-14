import { createServer, Server } from "http";
import { resolve } from "path";
import { URL } from "url";
import { promisify } from "util";
import { TempDirectory } from "@manuth/temp-files";
import dedent = require("dedent");
import { ensureDir, move, pathExists, readFile, remove, writeFile } from "fs-extra";
import getPort = require("get-port");
import { glob } from "glob";
import MarkdownIt = require("markdown-it");
import puppeteer = require("puppeteer-core");
import serveHandler = require("serve-handler");
import { transliterate } from "transliteration";
import { basename, dirname, join, normalize, relative } from "upath";
import { CancellationToken, Progress } from "vscode";
import websiteScraper = require("website-scraper");
import { Resources } from "../Properties/Resources";
import { Settings } from "../Properties/Settings";
import { StyleSheet } from "../System/Documents/Assets/StyleSheet";
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
     * The path to the chromium-browser to use for the conversion.
     */
    private chromiumExecutablePath: string = null;

    /**
     * The browser which is used to perform the conversion.
     */
    private browser: puppeteer.Browser;

    /**
     * A value indicating whether the converter has been initialized.
     */
    private initialized = false;

    /**
     * A value indicating whether the converter has been disposed.
     */
    private disposed = false;

    /**
     * Initializes a new instance of the {@link Converter `Converter`} class.
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
     * Gets the document which is converted by this {@link Converter `Converter`}.
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
            (new URL(this.WebDocumentName, `http://localhost:${this.PortNumber}/`).href) :
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
                transliterate(relative(this.DocumentRoot, this.Document.FileName)) :
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
     * Gets or sets the path to the chromium-browser to use for the conversion.
     */
    public get ChromiumExecutablePath(): string
    {
        return this.chromiumExecutablePath;
    }

    /**
     * @inheritdoc
     */
    public set ChromiumExecutablePath(value: string)
    {
        this.chromiumExecutablePath = value;
    }

    /**
     * Gets the options for launching the browser.
     */
    public get BrowserOptions(): puppeteer.LaunchOptions
    {
        return {
            ...(
                this.ChromiumExecutablePath ?
                    {
                        executablePath: this.ChromiumExecutablePath
                    } :
                    {})
        };
    }

    /**
     * Gets the browser which is used to perform the conversion.
     */
    protected get Browser(): puppeteer.Browser
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
            let browserArguments: string[] = [
                ...Settings.Default.ChromiumArgs
            ];

            progressReporter?.report(
                {
                    message: Resources.Resources.Get("Progress.LaunchWebserver")
                });

            this.portNumber = await getPort();

            this.webServer = createServer(
                async (request, response) =>
                {
                    let headers: Array<[string, string]> = [
                        [
                            "Access-Control-Allow-Origin",
                            "*"
                        ],
                        [
                            "Access-Control-Allow-Headers",
                            "Origin, X-Requested-With, Content-Type, Accept, Range"
                        ]
                    ];

                    if (normalize(join(this.DocumentRoot, request.url)) === normalize(join(this.DocumentRoot, this.WebDocumentName)))
                    {
                        try
                        {
                            let content = await this.Document.Render();

                            for (let header of headers)
                            {
                                response.setHeader(header[0], header[1]);
                            }

                            response.writeHead(200);
                            response.write(content);
                        }
                        catch (exception)
                        {
                            let errorDocument = new Document(new MarkdownIt());
                            errorDocument.StyleSheets.push(new StyleSheet(Resources.Files.Get("SystemStyle")));

                            errorDocument.Content = dedent(
                                `
                                    # An Error Occurred While Converting the Document
                                    ~~~
                                    ${exception}
                                    ~~~`);

                            response.writeHead(500);
                            response.write(await errorDocument.Render());
                        }
                        finally
                        {
                            response.end();
                        }
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
                                        headers: headers.map(
                                            (header) =>
                                            {
                                                return {
                                                    key: header[0],
                                                    value: header[1]
                                                };
                                            })
                                    }
                                ],
                                cleanUrls: false
                            });
                    }
                });

            this.webServer.listen(this.portNumber, "localhost");

            progressReporter?.report(
                {
                    message: Resources.Resources.Get("Progress.LaunchChromium")
                });

            try
            {
                this.browser = await puppeteer.launch(
                    {
                        ...this.BrowserOptions,
                        args: [
                            ...browserArguments
                        ]
                    });
            }
            catch
            {
                this.browser = await puppeteer.launch(
                    {
                        ...this.BrowserOptions,
                        args: [
                            ...browserArguments,
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

                                let pdfOptions: puppeteer.PDFOptions = {
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
                                let screenshotOptions: puppeteer.ScreenshotOptions = {
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

    /**
     * Loads the content of a fragment.
     *
     * @param source
     * Either the path to a file to load the source from or the source of the fragment.
     *
     * @returns
     * The content of the fragment.
     */
    public async LoadFragment(source: string): Promise<string>
    {
        let fileName: string;

        if (
            source &&
            await pathExists(
                (fileName = resolve(this.DocumentRoot, source))))
        {
            return (await readFile(fileName)).toString();
        }
        else
        {
            return source;
        }
    }
}
