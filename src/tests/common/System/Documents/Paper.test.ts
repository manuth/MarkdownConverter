import { deepStrictEqual, ok, strictEqual } from "assert";
import { Margin } from "../../../../System/Documents/Margin.js";
import { PageOrientation } from "../../../../System/Documents/PageOrientation.js";
import { Paper } from "../../../../System/Documents/Paper.js";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType.js";
import { StandardizedPageFormat } from "../../../../System/Documents/StandardizedPageFormat.js";

/**
 * Registers tests for the {@link Paper `Paper`} class.
 */
export function PaperTests(): void
{
    suite(
        nameof(Paper),
        () =>
        {
            suite(
                nameof(Paper.constructor),
                () =>
                {
                    test(
                        "Checking whether the values are set correctly…",
                        () =>
                        {
                            let margin = new Margin("10cm");
                            let paperFormat = new StandardizedPageFormat(StandardizedFormatType.A5);
                            let defaultPaper = new Paper();
                            strictEqual(defaultPaper.Margin.Top, "1cm");
                            strictEqual(defaultPaper.Margin.Right, defaultPaper.Margin.Top);
                            strictEqual(defaultPaper.Margin.Bottom, defaultPaper.Margin.Right);
                            strictEqual(defaultPaper.Margin.Left, defaultPaper.Margin.Bottom);
                            ok(defaultPaper.Format instanceof StandardizedPageFormat);

                            if (defaultPaper.Format instanceof StandardizedPageFormat)
                            {
                                strictEqual(defaultPaper.Format.Format, StandardizedFormatType.A4);
                                strictEqual(defaultPaper.Format.Orientation, PageOrientation.Portrait);
                            }

                            let marginPaper = new Paper(null, margin);
                            deepStrictEqual(marginPaper.Format, defaultPaper.Format);
                            strictEqual(marginPaper.Margin, margin);

                            let formatPaper = new Paper(paperFormat);
                            deepStrictEqual(formatPaper.Margin, defaultPaper.Margin);
                            strictEqual(formatPaper.Format, paperFormat);
                        });
                });
        });
}
