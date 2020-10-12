import { ConfigInterceptorTests } from "./ConfigInterceptor.test";
import { SystemTests } from "./System";

/**
 * Registers tests for configuration-components.
 */
export function EssentialTests(): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            ConfigInterceptorTests();
            SystemTests();
        });
}
