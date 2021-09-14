import { basename } from "path";
import { FileExceptionTests } from "./FileException.test";
import { PatternResolverTests } from "./PatternResolver.test";

/**
 * Registers tests for IO-components.
 */
export function IOTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            FileExceptionTests();
            PatternResolverTests();
        });
}
