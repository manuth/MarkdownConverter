import { strictEqual } from "assert";
import MultiRange from "multi-integer-range";
import { ListType } from "../../../../System/Documents/ListType";
import { TocSettings } from "../../../../System/Documents/TocSettings";

/**
 * Registers tests for the `TocSettings` class.
 */
export function TocSettingTests(): void
{
    suite(
        "TocSettings",
        () =>
        {
            suite(
                "constructor(string $class, MultiRange levels?, RegExp indicator?, ListType listType?)",
                () =>
                {
                    test(
                        "Checking whether the properties are initialized correctly…",
                        () =>
                        {
                            let $class = "toc";
                            let levels = new MultiRange("1-6");
                            let indicator = /insert-my-toc-here-plz/g;
                            let listType = ListType.Ordered;
                            let tocSettings = new TocSettings($class);
                            strictEqual(tocSettings.Class, $class);
                            strictEqual(tocSettings.Levels.toArray().length, 0);
                            strictEqual(tocSettings.Indicator.source, /\[\[\s*toc\s*\]\]/g.source);
                            strictEqual(tocSettings.ListType, ListType.Unordered);
                            tocSettings = new TocSettings($class, levels, indicator, listType);
                            strictEqual(tocSettings.Levels, levels);
                            strictEqual(tocSettings.Indicator, indicator);
                            strictEqual(tocSettings.ListType, listType);
                        });
                });
        });
}
