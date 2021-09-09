import { strictEqual } from "assert";
import { PageOrientation } from "../../../../System/Documents/PageOrientation";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType";
import { StandardizedPageFormat } from "../../../../System/Documents/StandardizedPageFormat";

/**
 * Registers tests for the `StandardizedPaperFormat` class.
 */
export function StandardizedPaperFormatTests(): void
{
    suite(
        "StandardizedPaperFormat",
        () =>
        {
            let format: StandardizedFormatType;
            let orientation: PageOrientation;
            let paperFormat: StandardizedPageFormat;

            suiteSetup(
                () =>
                {
                    format = StandardizedFormatType.A3;
                    orientation = PageOrientation.Portrait;
                });

            setup(
                () =>
                {
                    paperFormat = new StandardizedPageFormat(format, orientation);
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the values are set correctly…",
                        () =>
                        {
                            let paperFormat = new StandardizedPageFormat();
                            strictEqual(paperFormat.Format, StandardizedFormatType.A4);
                            strictEqual(paperFormat.Orientation, PageOrientation.Portrait);
                            paperFormat = new StandardizedPageFormat(format);
                            strictEqual(paperFormat.Format, format);
                            strictEqual(paperFormat.Orientation, PageOrientation.Portrait);
                            paperFormat = new StandardizedPageFormat(format, orientation);
                            strictEqual(paperFormat.Format, format);
                            strictEqual(paperFormat.Orientation, orientation);
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
                            strictEqual(paperFormat.PDFOptions.format, "A3");
                            strictEqual(paperFormat.PDFOptions.landscape, false);
                        });
                });
        });
}
