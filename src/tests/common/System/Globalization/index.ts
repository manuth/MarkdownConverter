import { DateTimeFormatterTests } from "./DateTimeFormatter.test";

/**
 * Registers tests for globalization.
 */
export function GlobalizationTests(): void
{
    suite(
        "Globalization",
        () =>
        {
            DateTimeFormatterTests();
        });
}
