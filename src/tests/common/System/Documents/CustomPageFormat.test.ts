import { strictEqual } from "assert";
import { CustomPageFormat } from "../../../../System/Documents/CustomPageFormat.js";

/**
 * Registers tests for the {@link CustomPageFormat `CustomPageFormat`} class.
 */
export function CustomPaperFormatTests(): void
{
    suite(
        nameof(CustomPageFormat),
        () =>
        {
            let width: string;
            let height: string;
            let format: CustomPageFormat;

            suiteSetup(
                () =>
                {
                    width = "187cm";
                    height = "190cm";
                });

            setup(
                () =>
                {
                    format = new CustomPageFormat(width, height);
                });

            suite(
                nameof(CustomPageFormat.constructor),
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
                nameof<CustomPageFormat>((format) => format.PDFOptions),
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
