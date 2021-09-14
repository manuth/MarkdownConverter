import { strictEqual } from "assert";
import MultiRange from "multi-integer-range";
import { ListType } from "../../../../System/Documents/ListType";
import { TocSettings } from "../../../../System/Documents/TocSettings";

/**
 * Registers tests for the {@link TocSettings `TocSettings`} class.
 */
export function TocSettingTests(): void
{
    suite(
        nameof(TocSettings),
        () =>
        {
            let className: string;
            let levels: MultiRange;
            let indicator: RegExp;
            let listType: ListType;
            let tocSettings: TocSettings;

            suiteSetup(
                () =>
                {
                    className = "toc";
                    levels = new MultiRange("1-6");
                    indicator = /insert-my-toc-here-plz/g;
                    listType = ListType.Ordered;
                });

            setup(
                () =>
                {
                    tocSettings = new TocSettings(className, levels, indicator, listType);
                });

            suite(
                nameof(TocSettings.constructor),
                () =>
                {
                    test(
                        "Checking whether the properties are initialized correctly…",
                        () =>
                        {
                            let defaultToc = new TocSettings(className);
                            strictEqual(defaultToc.Class, className);
                            strictEqual(defaultToc.Levels.toArray().length, 0);
                            strictEqual(defaultToc.Indicator.source, /\[\[\s*toc\s*\]\]/g.source);
                            strictEqual(defaultToc.ListType, ListType.Unordered);

                            strictEqual(tocSettings.Class, className);
                            strictEqual(tocSettings.Levels, levels);
                            strictEqual(tocSettings.Indicator, indicator);
                            strictEqual(tocSettings.ListType, listType);
                        });
                });
        });
}
