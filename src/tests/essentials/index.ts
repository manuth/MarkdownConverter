import { ConfigInterceptorTests } from "./ConfigInterceptor.test";

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
        });
}
