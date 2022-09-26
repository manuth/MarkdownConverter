import { basename } from "path";
import { TaskTests } from "./Tasks/index.js";

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
