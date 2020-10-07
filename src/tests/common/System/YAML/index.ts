import { YAMLExceptionTests } from "./YAMLException.test";

/**
 * Registers tests for yaml-components.
 */
export function YAMLTests(): void
{
    suite(
        "YAML",
        () =>
        {
            YAMLExceptionTests();
        });
}
