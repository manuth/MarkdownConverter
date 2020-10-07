import { FileExceptionTests } from "./FileException.test";

/**
 * Registers tests for IO-components.
 */
export function IOTests(): void
{
    suite(
        "IO",
        () =>
        {
            FileExceptionTests();
        });
}
