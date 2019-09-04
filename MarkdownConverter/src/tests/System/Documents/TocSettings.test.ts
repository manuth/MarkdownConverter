import Assert = require("assert");
import MultiRange from "multi-integer-range";
import { ListType } from "../../../System/Documents/ListType";
import { TocSettings } from "../../../System/Documents/TocSettings";

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
                        Assert.strictEqual(tocSettings.Class, $class);
                        Assert.strictEqual(tocSettings.Levels.toArray().length, 0);
                        Assert.strictEqual(tocSettings.Indicator.source, /\[\[\s*toc\s*\]\]/g.source);
                        Assert.strictEqual(tocSettings.ListType, ListType.Unordered);
                        tocSettings = new TocSettings($class, levels, indicator, listType);
                        Assert.strictEqual(tocSettings.Levels, levels);
                        Assert.strictEqual(tocSettings.Indicator, indicator);
                        Assert.strictEqual(tocSettings.ListType, listType);
                    });
            });
    });