import { basename } from "path";
import { DateTimeFormatterTests } from "./DateTimeFormatter.test";

/**
 * Registers tests for globalization.
 */
export function GlobalizationTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            DateTimeFormatterTests();
        });
}
