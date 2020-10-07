import { ConfigInterceptorTests } from "./ConfigInterceptor.test";

/**
 * Registers tests for configuration-components.
 */
export function ConfigTests(): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            ConfigInterceptorTests();
        });
}
