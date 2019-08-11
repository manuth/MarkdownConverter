import Path = require("path");
import { Browser, launch } from "puppeteer";
import { Converter } from "./Converter";

/**
 * Generates filenames for the website-scraper.
 */
export class ConverterPlugin
{
    /**
     * The converter this plugin belongs to.
     */
    private converter: Converter;

    /**
     * The name of the website to save.
     */
    private websiteName: string;

    /**
     * Initializes a new instance of the `FilenamePlugin` class.
     *
     * @param converter
     * The converter this plugin belongs to.
     *
     * @param websiteName
     * The name of the website to save.
     */
    public constructor(converter: Converter, websiteName?: string)
    {
        this.converter = converter;
        this.websiteName = websiteName;
    }

    /**
     * Gets the converter this plugin belongs to.
     */
    public get Converter()
    {
        return this.converter;
    }

    /**
     * Gets the name of the website to save.
     */
    public get WebsiteName()
    {
        return this.websiteName;
    }

    /**
     * Applies the plugin.
     *
     * @param registerAction
     * A component for registering actions.
     */
    public apply(registerAction: (name: string, callback: (options: any) => void) => void): void
    {
        let browser: Browser;
        let occupiedFilenames: string[];
        let subdirectories: { [extension: string]: string };
        let defaultFilename: string;

        registerAction("beforeStart",
            async ({ options }) =>
            {
                browser = await launch();
                occupiedFilenames = [];
                subdirectories = options.subdirectories;
                defaultFilename = this.WebsiteName || options.defaultFilename;
            });

        registerAction("afterResponse",
            async ({ response }) =>
            {
                if (response.request.href === this.Converter.URL)
                {
                    return this.Converter.Document.Render();
                }
                else
                {
                    const contentType = response.headers["content-type"];
                    const isHtml = contentType && contentType.split(";")[0] === "text/html";

                    if (isHtml)
                    {
                        const url = response.request.href;

                        const page = await browser.newPage();
                        await page.goto(url);
                        const content = await page.content();
                        await page.close();
                        return content;
                    }
                    else
                    {
                        return response.body;
                    }
                }
            });
        registerAction("generateFilename", ({ resource }) =>
        {
            let result: string;
            let filename: string = require("website-scraper/lib/filename-generator/by-type")(resource, { subdirectories, defaultFilename }, occupiedFilenames);

            if (filename === "index.html")
            {
                result = filename = this.WebsiteName;
            }
            else
            {
                result = Path.join(Path.parse(defaultFilename).name, filename);
            }

            occupiedFilenames.push(filename);
            return { filename: result };
        });
    }
}