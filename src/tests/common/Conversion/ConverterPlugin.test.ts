import { doesNotReject, doesNotThrow, ok } from "assert";
import { createRequire } from "module";
import { TempDirectory } from "@manuth/temp-files";
import dedent from "dedent";
import fs from "fs-extra";
import MarkdownIt from "markdown-it";
import path from "upath";
import vscode from "vscode";
import websiteScraper from "website-scraper";
import { Converter } from "../../../Conversion/Converter.js";
import { ConverterPlugin } from "../../../Conversion/ConverterPlugin.js";
import { Document } from "../../../System/Documents/Document.js";

const { pathExists, remove, writeFile } = fs;
const { basename, parse } = path;
const { workspace } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link ConverterPlugin `ConverterPlugin`} class.
 */
export function ConverterPluginTests(): void
{
    suite(
        nameof(ConverterPlugin),
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
                            parser,
                            await workspace.openTextDocument(mdFile)
                        ));

                    await converter.Initialize();
                    websiteName = "TestWebsite.html";
                });

            suiteTeardown(
                async function()
                {
                    this.timeout(30 * 1000);
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
                nameof(ConverterPlugin.constructor),
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
                nameof<ConverterPlugin>((plugin) => plugin.apply),
                () =>
                {
                    test(
                        "Checking whether the plugin can be applied to the website-scraper…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            await doesNotReject(async () => ScrapeWebsite());
                        });

                    test(
                        "Checking whether the expected files are generated…",
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
