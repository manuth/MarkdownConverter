import Assert = require("assert");
import { CultureInfo } from "culture-info";
import { Resources } from "../../Properties/Resources";

suite(
    "Resources",
    () =>
    {
        suite(
            "Culture",
            () =>
            {
                test(
                    "Checking whether setting the `Culture` affects all resources…",
                    () =>
                    {
                        let culture = new CultureInfo("zh-Hans-CN");
                        Resources.Culture = culture;
                        Assert.strictEqual(Resources.Resources.Locale, culture);
                        Assert.strictEqual(Resources.Files.Locale, culture);
                    });
            });
    });