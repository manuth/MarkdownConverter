import { basename } from "path";
import { YAMLExceptionTests } from "./YAMLException.test.js";

/**
 * Registers tests for yaml-components.
 */
export function YAMLTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            YAMLExceptionTests();
        });
}
