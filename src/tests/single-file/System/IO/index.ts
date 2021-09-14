import { PatternResolverTests } from "./PatternResolver.test";

/**
 * Registers tests for the IO-components.
 */
export function IOTests(): void
{
    suite(
        "IO",
        () =>
        {
            PatternResolverTests();
        });
}
