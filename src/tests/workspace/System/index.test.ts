import { basename } from "node:path";
import { TaskTests } from "./Tasks/index.test.js";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            TaskTests();
        });
}
