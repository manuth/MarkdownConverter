import Assert = require("assert");
import { CustomPaperFormat } from "../../../../System/Documents/CustomPaperFormat";

suite(
    "CustomPaperFormat",
    () =>
    {
        let width: string;
        let height: string;

        suiteSetup(
            () =>
            {
                width = "187cm";
                height = "190cm";
            });

        suite(
            "constructor(string width, string height)",
            () =>
            {
                test(
                    "Checking whether the values are assigned correctly…",
                    () =>
                    {
                        let format = new CustomPaperFormat(width, height);
                        Assert.strictEqual(format.Width, width);
                        Assert.strictEqual(format.Height, height);
                    });
            });

        suite(
            "PDFOptions",
            () =>
            {
                test(
                    "Checking whether the puppeteer-options are generated correctly…",
                    () =>
                    {
                        let format = new CustomPaperFormat(width, height);
                        Assert.strictEqual(format.PDFOptions.width, width);
                        Assert.strictEqual(format.PDFOptions.height, height);
                    });
            });
    });