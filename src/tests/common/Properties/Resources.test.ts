import { strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Resources } from "../../../Properties/Resources";

/**
 * Registers tests for the {@link Resources `Resources`} class.
 */
export function ResourceTests(): void
{
    suite(
        nameof(Resources),
        () =>
        {
            suite(
                nameof(Resources.Culture),
                () =>
                {
                    let originalLocale: CultureInfo;

                    suiteSetup(
                        () =>
                        {
                            originalLocale = Resources.Culture;
                        });

                    teardown(
                        () =>
                        {
                            Resources.Culture = originalLocale;
                        });

                    suiteTeardown(
                        () =>
                        {
                            Resources.Culture = originalLocale;
                        });

                    test(
                        `Checking whether setting the \`${nameof(Resources.Culture)}\` affects all resources…`,
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
