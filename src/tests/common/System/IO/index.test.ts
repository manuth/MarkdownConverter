import { basename } from "node:path";
import { FileExceptionTests } from "./FileException.test.js";
import { FileNotFoundExceptionTests } from "./FileNotFoundException.test.js";
import { PatternResolverTests } from "./PatternResolver.test.js";

/**
 * Registers tests for IO-components.
 */
export function IOTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            FileExceptionTests();
            FileNotFoundExceptionTests();
            PatternResolverTests();
        });
}
