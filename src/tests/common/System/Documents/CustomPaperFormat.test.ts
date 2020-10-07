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
                            let format = new CustomPaperFormat(width, height);
                            strictEqual(format.PDFOptions.width, width);
                            strictEqual(format.PDFOptions.height, height);
                        });
                });
        });
}
