import { strictEqual } from "assert";
import { CustomPaperFormat } from "../../../../System/Documents/CustomPaperFormat";

/**
 * Registers tests for the `CustomPaperFormat` class.
 */
export function CustomPaperFormatTests(): void
{
    suite(
        "CustomPaperFormat",
        () =>
        {
            let width: string;
            let height: string;
            let format: CustomPaperFormat;

            suiteSetup(
                () =>
                {
                    width = "187cm";
                    height = "190cm";
                });

            setup(
                () =>
                {
                    format = new CustomPaperFormat(width, height);
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            strictEqual(format.Width, width);
                            strictEqual(format.Height, height);
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
                            strictEqual(format.PDFOptions.width, width);
                            strictEqual(format.PDFOptions.height, height);
                        });
                });
        });
}
