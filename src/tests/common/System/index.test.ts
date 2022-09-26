import { basename } from "node:path";
import { ISettings } from "../../../Properties/ISettings.js";
import { ITestContext } from "../../ITestContext.js";
import { DocumentTests } from "./Documents/index.test.js";
import { ExceptionTests } from "./Exception.test.js";
import { ExtensibilityTests } from "./Extensibility/index.test.js";
import { GlobalizationTests } from "./Globalization/index.test.js";
import { IOTests } from "./IO/index.test.js";
import { TaskTests } from "./Tasks/index.test.js";
import { YAMLTests } from "./YAML/index.test.js";

/**
 * Registers tests for system-components.
 *
 * @param context
 * The test-context.
 */
export function SystemTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
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
