import { strictEqual } from "node:assert";
import { PageOrientation } from "../../../../System/Documents/PageOrientation.js";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType.js";
import { StandardizedPageFormat } from "../../../../System/Documents/StandardizedPageFormat.js";

/**
 * Registers tests for the {@link StandardizedPageFormat `StandardizedPageFormat`} class.
 */
export function StandardizedPageFormatTests(): void
{
    suite(
        nameof(StandardizedPageFormat),
        () =>
        {
            let format: StandardizedFormatType;
            let orientation: PageOrientation;
            let paperFormat: StandardizedPageFormat;

            suiteSetup(
                () =>
                {
                    format = StandardizedFormatType.A3;
                    orientation = PageOrientation.Landscape;
                });

            setup(
                () =>
                {
                    paperFormat = new StandardizedPageFormat(format, orientation);
                });

            suite(
                nameof(StandardizedPageFormat.constructor),
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
                nameof<StandardizedPageFormat>((format) => format.PDFOptions),
                () =>
                {
                    test(
                        "Checking whether the puppeteer-options are generated correctly…",
                        () =>
                        {
                            strictEqual(paperFormat.PDFOptions.format, format);
                            strictEqual(paperFormat.PDFOptions.landscape, orientation === PageOrientation.Landscape);
                        });
                });
        });
}
