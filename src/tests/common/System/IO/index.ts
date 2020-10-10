import { FileExceptionTests } from "./FileException.test";
import { PatternResolverTests } from "./PatternResolver.test";

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
            PatternResolverTests();
        });
}
