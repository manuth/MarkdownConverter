import { strictEqual } from "assert";
import { CultureInfo } from "culture-info";
import { Resources } from "../../../Properties/Resources";

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
