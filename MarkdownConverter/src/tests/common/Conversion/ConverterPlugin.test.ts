import Assert = require("assert");
import Dedent = require("dedent");
import FileSystem = require("fs-extra");
import MarkdownIt = require("markdown-it");
import Path = require("path");
import { TempDirectory } from "temp-filesystem";
import { workspace } from "vscode";
import Scrape = require("website-scraper");
import { Converter } from "../../../Conversion/Converter";
import { ConverterPlugin } from "../../../Conversion/ConverterPlugin";
import { Document } from "../../../System/Documents/Document";

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
                this.enableTimeouts(false);
                let parser = new MarkdownIt(
                    {
                        html: true
                    });

                parser.validateLink = () => true;
                tempDirectory = new TempDirectory();
                destinationDirectory = new TempDirectory();
                await FileSystem.remove(destinationDirectory.FullName);
                cssFile = tempDirectory.MakePath("styles.css");
                mdFile = tempDirectory.MakePath("Test.md");
                await FileSystem.writeFile(
                    cssFile,
                    Dedent(
                        `
                        :root {
                            color: red !important;
                        }`));

                await FileSystem.writeFile(
                    mdFile,
                    Dedent(
                        `
                        <link rel="stylesheet" type="text/css" href="./${Path.basename(cssFile)}">
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

        suite(
            "constructor(Converter converter, string websiteName)",
            () =>
            {
                test(
                    "Checking whether the plugin can be initialized…",
                    () =>
                    {
                        Assert.doesNotThrow(
                            () =>
                            {
                                plugin = new ConverterPlugin(converter, websiteName);
                            });
                    });
            });

        suite(
            "apply(Function registerAction)",
            () =>
            {
                test(
                    "Checking whether the plugin can be applied to the website…",
                    async () =>
                    {
                        await Assert.doesNotReject(
                            async () =>
                            {
                                await Scrape(
                                    {
                                        urls: [converter.URL],
                                        directory: destinationDirectory.FullName,
                                        plugins: [
                                            plugin
                                        ]
                                    } as any);
                            });
                    });

                test(
                    "Checking whether the expected files have been generated…",
                    async () =>
                    {
                        Assert(await FileSystem.pathExists(destinationDirectory.MakePath(websiteName)));
                        Assert(await FileSystem.pathExists(destinationDirectory.MakePath(Path.parse(websiteName).name, "css", Path.basename(cssFile))));
                    });
            });
    });