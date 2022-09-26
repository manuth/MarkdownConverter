import { basename } from "path";
import { ISettings } from "../../../Properties/ISettings.js";
import { ITestContext } from "../../ITestContext.js";
import { DocumentTests } from "./Documents/index.js";
import { ExceptionTests } from "./Exception.test.js";
import { ExtensibilityTests } from "./Extensibility/index.js";
import { GlobalizationTests } from "./Globalization/index.js";
import { IOTests } from "./IO/index.js";
import { TaskTests } from "./Tasks/index.js";
import { YAMLTests } from "./YAML/index.js";

/**
 * Registers tests for system-components.
 *
 * @param context
 * The test-context.
 */
export function SystemTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(new URL(".", new URL(import.meta.url)).pathname),
        () =>
        {
            ExceptionTests();
            IOTests();
            YAMLTests();
            GlobalizationTests();
            ExtensibilityTests();
            TaskTests(context);
            DocumentTests();
        });
}
