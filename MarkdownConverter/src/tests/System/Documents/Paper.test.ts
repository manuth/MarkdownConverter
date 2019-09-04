import Assert = require("assert");
import { Margin } from "../../../System/Documents/Margin";
import { Paper } from "../../../System/Documents/Paper";
import { PaperOrientation } from "../../../System/Documents/PaperOrientation";
import { StandardizedFormatType } from "../../../System/Documents/StandardizedFormatType";
import { StandardizedPaperFormat } from "../../../System/Documents/StandardizedPaperFormat";

suite(
    "Paper",
    () =>
    {
        suite(
            "constructor(PaperFormat format?, Margin margin?)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let defaultPaper = new Paper();
                        let margin = new Margin("10cm");
                        let paperFormat = new StandardizedPaperFormat(StandardizedFormatType.A5);
                        Assert.strictEqual(defaultPaper.Margin.Top, "1cm");
                        Assert.strictEqual(defaultPaper.Margin.Right, defaultPaper.Margin.Top);
                        Assert.strictEqual(defaultPaper.Margin.Bottom, defaultPaper.Margin.Right);
                        Assert.strictEqual(defaultPaper.Margin.Left, defaultPaper.Margin.Bottom);
                        Assert.strictEqual(defaultPaper.Format instanceof StandardizedPaperFormat, true);

                        if (defaultPaper.Format instanceof StandardizedPaperFormat)
                        {
                            Assert.strictEqual(defaultPaper.Format.Format, StandardizedFormatType.A4);
                            Assert.strictEqual(defaultPaper.Format.Orientation, PaperOrientation.Portrait);
                        }

                        let marginPaper = new Paper(null, margin);
                        Assert.deepEqual(marginPaper.Format, defaultPaper.Format);
                        Assert.strictEqual(marginPaper.Margin, margin);

                        let formatPaper = new Paper(paperFormat);
                        Assert.deepEqual(formatPaper.Margin, defaultPaper.Margin);
                    });
            });
    });