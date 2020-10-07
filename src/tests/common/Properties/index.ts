import { ResourceTests } from "./Resources.test";
import { SettingTests } from "./Settings.test";

/**
 * Registers tests for properties.
 */
export function PropertyTests(): void
{
    suite(
        "Properties",
        () =>
        {
            SettingTests();
            ResourceTests();
        });
}
