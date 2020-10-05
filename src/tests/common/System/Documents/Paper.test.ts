import { deepStrictEqual, ok, strictEqual } from "assert";
import { Margin } from "../../../../System/Documents/Margin";
import { Paper } from "../../../../System/Documents/Paper";
import { PaperOrientation } from "../../../../System/Documents/PaperOrientation";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType";
import { StandardizedPaperFormat } from "../../../../System/Documents/StandardizedPaperFormat";

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
                        strictEqual(defaultPaper.Margin.Top, "1cm");
                        strictEqual(defaultPaper.Margin.Right, defaultPaper.Margin.Top);
                        strictEqual(defaultPaper.Margin.Bottom, defaultPaper.Margin.Right);
                        strictEqual(defaultPaper.Margin.Left, defaultPaper.Margin.Bottom);
                        ok(defaultPaper.Format instanceof StandardizedPaperFormat);

                        if (defaultPaper.Format instanceof StandardizedPaperFormat)
                        {
                            strictEqual(defaultPaper.Format.Format, StandardizedFormatType.A4);
                            strictEqual(defaultPaper.Format.Orientation, PaperOrientation.Portrait);
                        }

                        let marginPaper = new Paper(null, margin);
                        deepStrictEqual(marginPaper.Format, defaultPaper.Format);
                        strictEqual(marginPaper.Margin, margin);

                        let formatPaper = new Paper(paperFormat);
                        deepStrictEqual(formatPaper.Margin, defaultPaper.Margin);
                    });
            });
    });
