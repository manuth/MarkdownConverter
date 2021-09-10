import { doesNotReject, doesNotThrow, ok } from "assert";
import { TempDirectory } from "@manuth/temp-files";
import dedent = require("dedent");
import { pathExists, remove, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import { basename, parse } from "upath";
import { workspace } from "vscode";
import websiteScraper = require("website-scraper");
import { Converter } from "../../../Conversion/Converter";
import { ConverterPlugin } from "../../../Conversion/ConverterPlugin";
import { Document } from "../../../System/Documents/Document";

/**
 * Registers tests for the `ConverterPlugin` class.
 */
export function ConverterPluginTests(): void
{
    suite(
        "ConverterPlugin",
        () =>
        {
            let plugin: ConverterPlugin;
            let tempDirectory: TempDirectory;
            let destinationDirectory: TempDirectory;
            let converter: Converter;
            let websiteName: string;
            let mdFile: string;
            let cssFile: string;

            suiteSetup(
                async function()
                {
                    this.timeout(10 * 1000);

                    let parser = new MarkdownIt(
                        {
                            html: true
                        });

                    parser.validateLink = () => true;
                    tempDirectory = new TempDirectory();
                    destinationDirectory = new TempDirectory();
                    await remove(destinationDirectory.FullName);
                    cssFile = tempDirectory.MakePath("styles.css");
                    mdFile = tempDirectory.MakePath("Test.md");

                    await writeFile(
                        cssFile,
                        dedent(
                            `
                            :root {
                                color: red !important;
                            }`));

                    await writeFile(
                        mdFile,
                        dedent(
                            `
                            <link rel="stylesheet" type="text/css" href="./${basename(cssFile)}">
                            <b>test</b>
    
                            # Hello World`));

                    converter = new Converter(
                        tempDirectory.FullName,
                        new Document(
                            await workspace.openTextDocument(mdFile),
                            parser
                        ));

                    await converter.Initialize();
                    websiteName = "TestWebsite.html";
                });

            suiteTeardown(
                async () =>
                {
                    tempDirectory.Dispose();
                    destinationDirectory.Dispose();
                    await converter.Dispose();
                });

            setup(
                async () =>
                {
                    plugin = new ConverterPlugin(converter, websiteName);
                });

            teardown(
                async () =>
                {
                    if (await pathExists(destinationDirectory.FullName))
                    {
                        await remove(destinationDirectory.FullName);
                    }
                });

            /**
             * Scrapes the website.
             */
            async function ScrapeWebsite(): Promise<void>
            {
                await websiteScraper(
                    {
                        urls: [converter.URL],
                        directory: destinationDirectory.FullName,
                        plugins: [
                            plugin
                        ]
                    });
            }

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether new plugins can be initialized…",
                        () =>
                        {
                            doesNotThrow(
                                () =>
                                {
                                    new ConverterPlugin(converter, websiteName);
                                });
                        });
                });

            suite(
                "apply",
                () =>
                {
                    test(
                        "Checking whether the plugin can be applied to the website…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            await doesNotReject(async () => ScrapeWebsite());
                        });

                    test(
                        "Checking whether the expected files have been generated…",
                        async function()
                        {
                            this.slow(3 * 1000);
                            this.timeout(6 * 1000);
                            await ScrapeWebsite();
                            ok(await pathExists(destinationDirectory.MakePath(websiteName)));
                            ok(await pathExists(destinationDirectory.MakePath(parse(websiteName).name, "css", basename(cssFile))));
                        });
                });
        });
}
