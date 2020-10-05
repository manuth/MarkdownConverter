import Assert = require("assert");
import { PaperOrientation } from "../../../../System/Documents/PaperOrientation";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType";
import { StandardizedPaperFormat } from "../../../../System/Documents/StandardizedPaperFormat";

suite(
    "StandardizedPaperFormat",
    () =>
    {
        let format: StandardizedFormatType;
        let orientation: PaperOrientation;

        suiteSetup(
            () =>
            {
                format = StandardizedFormatType.A3;
                orientation = PaperOrientation.Portrait;
            });

        suite(
            "constructor(StandardizedFormatType format?, PaperOrientation orientation?)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let paperFormat = new StandardizedPaperFormat();
                        Assert.strictEqual(paperFormat.Format, StandardizedFormatType.A4);
                        Assert.strictEqual(paperFormat.Orientation, PaperOrientation.Portrait);
                        paperFormat = new StandardizedPaperFormat(format);
                        Assert.strictEqual(paperFormat.Format, format);
                        Assert.strictEqual(paperFormat.Orientation, PaperOrientation.Portrait);
                        paperFormat = new StandardizedPaperFormat(format, orientation);
                        Assert.strictEqual(paperFormat.Format, format);
                        Assert.strictEqual(paperFormat.Orientation, orientation);
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
                        let paperFormat = new StandardizedPaperFormat(format, orientation);
                        Assert.strictEqual(paperFormat.PDFOptions.format, "A3");
                        Assert.strictEqual(paperFormat.PDFOptions.landscape, false);
                    });
            });
    });
