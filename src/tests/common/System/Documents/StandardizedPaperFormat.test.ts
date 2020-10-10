import { strictEqual } from "assert";
import { PaperOrientation } from "../../../../System/Documents/PaperOrientation";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType";
import { StandardizedPaperFormat } from "../../../../System/Documents/StandardizedPaperFormat";

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
            let orientation: PaperOrientation;
            let paperFormat: StandardizedPaperFormat;

            suiteSetup(
                () =>
                {
                    format = StandardizedFormatType.A3;
                    orientation = PaperOrientation.Portrait;
                });

            setup(
                () =>
                {
                    paperFormat = new StandardizedPaperFormat(format, orientation);
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the values are set correctly…",
                        () =>
                        {
                            let paperFormat = new StandardizedPaperFormat();
                            strictEqual(paperFormat.Format, StandardizedFormatType.A4);
                            strictEqual(paperFormat.Orientation, PaperOrientation.Portrait);
                            paperFormat = new StandardizedPaperFormat(format);
                            strictEqual(paperFormat.Format, format);
                            strictEqual(paperFormat.Orientation, PaperOrientation.Portrait);
                            paperFormat = new StandardizedPaperFormat(format, orientation);
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
