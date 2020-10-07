import { DocumentTests } from "./Documents";
import { ExceptionTests } from "./Exception.test";
import { ExtensibilityTests } from "./Extensibility";
import { GlobalizationTests } from "./Globalization";
import { IOTests } from "./IO";
import { TaskTests } from "./Tasks";
import { YAMLTests } from "./YAML";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        "System",
        () =>
        {
            ExceptionTests();
            IOTests();
            YAMLTests();
            GlobalizationTests();
            ExtensibilityTests();
            TaskTests();
            DocumentTests();
        });
}
