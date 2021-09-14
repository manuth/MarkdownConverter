import { basename } from "path";
import { ISettings } from "../../../Properties/ISettings";
import { ITestContext } from "../../ITestContext";
import { DocumentTests } from "./Documents";
import { ExceptionTests } from "./Exception.test";
import { ExtensibilityTests } from "./Extensibility";
import { GlobalizationTests } from "./Globalization";
import { IOTests } from "./IO";
import { TaskTests } from "./Tasks";
import { YAMLTests } from "./YAML";

/**
 * Registers tests for system-components.
 *
 * @param context
 * The test-context.
 */
export function SystemTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(__dirname),
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
