import { basename } from "path";
import { DateTimeFormatterTests } from "./DateTimeFormatter.test.js";

/**
 * Registers tests for globalization.
 */
export function GlobalizationTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            DateTimeFormatterTests();
        });
}
