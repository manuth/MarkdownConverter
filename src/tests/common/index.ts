import { ConversionTests } from "./Conversion";
import { PropertyTests } from "./Properties";
import { SystemTests } from "./System";

/**
 * Regisrers common tests.
 */
export function CommonTests(): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            PropertyTests();
            SystemTests();
            ConversionTests();
        });
}
