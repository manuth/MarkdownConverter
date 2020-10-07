import { strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Resources } from "../../../Properties/Resources";

/**
 * Registers tests for the `Resources` class.
 */
export function ResourceTests(): void
{
    suite(
        "Resources",
        () =>
        {
            suite(
                "Culture",
                () =>
                {
                    let originalLocale: CultureInfo;

                    suiteSetup(
                        () =>
                        {
                            originalLocale = Resources.Culture;
                        });

                    suiteTeardown(
                        () =>
                        {
                            Resources.Culture = originalLocale;
                        });

                    test(
                        "Checking whether setting the `Culture` affects all resources…",
                        () =>
                        {
                            let culture = new CultureInfo("zh-Hans-CN");
                            Resources.Culture = culture;
                            strictEqual(Resources.Resources.Locale, culture);
                            strictEqual(Resources.Files.Locale, culture);
                        });
                });
        });
}
