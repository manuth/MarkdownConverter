import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { createRequire } from "node:module";
import { Random } from "random-js";
import { createSandbox, SinonSandbox } from "sinon";
import vscode from "vscode";
import { ConversionType } from "../../../Conversion/ConversionType.js";
import { ISettings } from "../../../Properties/ISettings.js";
import { Settings } from "../../../Properties/Settings.js";
import { AssetURLType } from "../../../System/Documents/Assets/AssetURLType.js";
import { InsertionType } from "../../../System/Documents/Assets/InsertionType.js";
import { CustomPageFormat } from "../../../System/Documents/CustomPageFormat.js";
import { EmojiType } from "../../../System/Documents/EmojiType.js";
import { ListType } from "../../../System/Documents/ListType.js";
import { Margin } from "../../../System/Documents/Margin.js";
import { PageOrientation } from "../../../System/Documents/PageOrientation.js";
import { StandardizedFormatType } from "../../../System/Documents/StandardizedFormatType.js";
import { StandardizedPageFormat } from "../../../System/Documents/StandardizedPageFormat.js";
import { ITestContext } from "../../ITestContext.js";

const { env } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link Settings `Settings`} class.
 *
 * @param context
 * The test-context.
 */
export function SettingTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(Settings),
        () =>
        {
            let random: Random;
            let sandbox: SinonSandbox;
            let settings: Settings;
            let marginSetting = "Document.Paper.Margin" as const;
            let paperFormatSetting = "Document.Paper.PaperFormat" as const;
            let tocSetting = "Parser.Toc.Enabled" as const;
            let tocTypeSetting = "Parser.Toc.ListType" as const;

            suiteSetup(
                () =>
                {
                    random = new Random();
                    settings = new Settings();
                });

            setup(
                () =>
                {
                    sandbox = createSandbox();
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            /**
             * Checks whether the settings resolved by the {@link settingResolver `settingResolver`} work correctly.
             *
             * @param settingName
             * The name of the setting to check.
             *
             * @param settingResolver
             * Resolves the settings to check.
             */
            function CheckInsertionTypes(settingName: keyof ISettings, settingResolver: () => Partial<Record<AssetURLType, InsertionType>>): void
            {
                let urlTypes = [
                    AssetURLType.Link,
                    AssetURLType.RelativePath,
                    AssetURLType.AbsolutePath
                ];

                let insertionTypes = [
                    InsertionType.Default,
                    InsertionType.Link,
                    InsertionType.Include
                ];

                let insertionTypeSettings: Map<AssetURLType, InsertionType> = new Map();
                let configuredSettings: Partial<Record<keyof typeof AssetURLType, keyof typeof InsertionType>> = {};
                context.Settings[settingName] = configuredSettings as never;

                for (let urlType of urlTypes)
                {
                    if (random.bool())
                    {
                        let urlTypeName = AssetURLType[urlType] as keyof typeof AssetURLType;
                        let insertionType = random.pick(insertionTypes);
                        let insertionTypeName = InsertionType[insertionType] as keyof typeof InsertionType;
                        insertionTypeSettings.set(urlType, insertionType);
                        configuredSettings[urlTypeName] = insertionTypeName;
                    }
                }

                for (let urlType of urlTypes)
                {
                    strictEqual(
                        urlType in settingResolver(),
                        insertionTypeSettings.has(urlType));

                    if (insertionTypeSettings.has(urlType))
                    {
                        strictEqual(
                            settingResolver()[urlType],
                            insertionTypeSettings.get(urlType));
                    }
                }
            }

            /**
             * Checks whether the settings resolved by the {@link settingResolver `settingResolver`} work correctly.
             *
             * @param settingName
             * The name of the setting to check.
             *
             * @param settingResolver
             * Resolves the settings to check.
             */
            function CheckAssets(settingName: keyof ISettings, settingResolver: () => Record<string, InsertionType>): void
            {
                let insertionTypes = [
                    InsertionType.Default,
                    InsertionType.Link,
                    InsertionType.Include
                ];

                let assets: Map<string, InsertionType> = new Map();
                let configuredSettings: Record<string, keyof typeof InsertionType> = {};
                context.Settings[settingName] = configuredSettings as never;

                for (let i = random.integer(1, 10); i > 0; i--)
                {
                    let fileName = random.string(i + 1);
                    let insertionType = random.pick(insertionTypes);
                    let insertionTypeName = InsertionType[insertionType] as keyof typeof InsertionType;
                    assets.set(fileName, insertionType);
                    configuredSettings[fileName] = insertionTypeName;
                }

                strictEqual(Object.keys(settingResolver()).length, assets.size);

                for (let fileName of assets.keys())
                {
                    ok(fileName in settingResolver());
                    strictEqual(
                        settingResolver()[fileName],
                        assets.get(fileName));
                }
            }

            suite(
                nameof<Settings>((settings) => settings.ConversionType),
                () =>
                {
                    test(
                        "Checking whether the default conversion-type is set correctly…",
                        () =>
                        {
                            context.Clear();
                            deepStrictEqual(settings.ConversionType, [ConversionType.PDF]);
                        });

                    test(
                        "Checking whether the conversion-types are resolved correctly…",
                        () =>
                        {
                            context.Settings.ConversionType = [nameof(ConversionType.HTML)] as Array<keyof typeof ConversionType>;
                            strictEqual(settings.ConversionType.length, 1);
                            strictEqual(settings.ConversionType[0], ConversionType.HTML);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.Locale),
                () =>
                {
                    test(
                        "Checking whether the locale-setting is loaded correctly…",
                        () =>
                        {
                            context.Settings.Locale = "de";
                            strictEqual(settings.Locale, "de");
                        });

                    test(
                        "Checking whether the locale defaults to the locale of vscode…",
                        () =>
                        {
                            context.Clear();
                            strictEqual(settings.Locale, env.language);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.EmojiType),
                () =>
                {
                    test(
                        "Checking whether the emoji-type is resolved correctly…",
                        () =>
                        {
                            context.Settings["Parser.EmojiType"] = nameof(EmojiType.Native) as keyof typeof EmojiType;
                            strictEqual(settings.EmojiType, EmojiType.Native);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.PaperFormat),
                () =>
                {
                    let checkMargin: (margin: Margin) => void;

                    setup(
                        () =>
                        {
                            let newMargin = {
                                Top: "12cm",
                                Left: "78cm",
                                Bottom: "10cm",
                                Right: "20cm"
                            };

                            context.Settings[marginSetting] = newMargin;

                            checkMargin = (margin: Margin) =>
                            {
                                strictEqual(margin.Top, newMargin.Top);
                                strictEqual(margin.Left, newMargin.Left);
                                strictEqual(margin.Bottom, newMargin.Bottom);
                                strictEqual(margin.Right, newMargin.Right);
                            };
                        });

                    test(
                        "Checking whether a correct custom paper-format is loaded if width and height is specified…",
                        () =>
                        {
                            let customFormat = {
                                Width: "28cm",
                                Height: "29cm",
                                Format: undefined as string,
                                Orientation: undefined as string
                            };

                            context.Settings[paperFormatSetting] = customFormat;
                            let paperFormat = settings.PaperFormat.Format as CustomPageFormat;
                            ok(settings.PaperFormat.Format instanceof CustomPageFormat);
                            strictEqual(paperFormat.Width, customFormat.Width);
                            strictEqual(paperFormat.Height, customFormat.Height);
                            checkMargin(settings.PaperFormat.Margin);
                        });

                    test(
                        "Checking whether a correct standardized paper-format is loaded if neither width or height is specified…",
                        () =>
                        {
                            context.Settings[paperFormatSetting] = {
                                Width: undefined as string,
                                Height: undefined as string,
                                Format: nameof(StandardizedFormatType.A5) as keyof typeof StandardizedFormatType,
                                Orientation: nameof(PageOrientation.Landscape) as keyof typeof PageOrientation
                            };

                            let paperFormat = settings.PaperFormat.Format as StandardizedPageFormat;
                            ok(settings.PaperFormat.Format instanceof StandardizedPageFormat);
                            strictEqual(paperFormat.Format, StandardizedFormatType.A5);
                            strictEqual(paperFormat.Orientation, PageOrientation.Landscape);
                            checkMargin(settings.PaperFormat.Margin);
                        });

                    test(
                        "Checking whether the default paper-format is correct…",
                        () =>
                        {
                            context.Clear();
                            let paperFormat = settings.PaperFormat.Format as StandardizedPageFormat;
                            ok(settings.PaperFormat.Format instanceof StandardizedPageFormat);
                            strictEqual(paperFormat.Format, StandardizedFormatType.A4);
                            strictEqual(paperFormat.Orientation, PageOrientation.Portrait);
                            checkMargin(settings.PaperFormat.Margin);
                        });

                    test(
                        "Checking whether the default margin is left untouched if no value is set…",
                        () =>
                        {
                            let setterCount = 0;
                            let margin: Partial<Record<keyof Margin, string>> = {};

                            let marginKeys = [
                                nameof<Margin>((m) => m.Top),
                                nameof<Margin>((m) => m.Left),
                                nameof<Margin>((m) => m.Bottom),
                                nameof<Margin>((m) => m.Right)
                            ] as Array<keyof Margin>;

                            context.Settings[marginSetting] = margin;

                            for (let key of marginKeys)
                            {
                                sandbox.replaceSetter(
                                    Margin.prototype,
                                    key,
                                    () =>
                                    {
                                        setterCount++;
                                    });
                            }

                            (() => settings.PaperFormat)();
                            strictEqual(setterCount, 0);

                            for (let key of marginKeys)
                            {
                                if (random.bool())
                                {
                                    margin[key] = "1cm";
                                }
                            }

                            (() => settings.PaperFormat)();
                            strictEqual(setterCount, Object.keys(margin).length);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.TocSettings),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<Settings>((s) => s.TocSettings)}\` are equal to \`${null}\` if the toc-setting is disabled…`,
                        () =>
                        {
                            context.Settings[tocSetting] = false;
                            strictEqual(settings.TocSettings, null);
                        });

                    test(
                        `Checking whether the \`${nameof(ListType)}\`-option is parsed correctly…`,
                        () =>
                        {
                            context.Settings[tocSetting] = true;
                            context.Settings[tocTypeSetting] = "ul";
                            strictEqual(settings.TocSettings.ListType, ListType.Unordered);
                            context.Settings[tocTypeSetting] = "ol";
                            strictEqual(settings.TocSettings.ListType, ListType.Ordered);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.StyleSheetInsertion),
                () =>
                {
                    test(
                        "Checking whether the style-insertion settings are interpreted correctly…",
                        () =>
                        {
                            CheckInsertionTypes(
                                "Assets.StyleSheetInsertion",
                                () => settings.StyleSheetInsertion);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.StyleSheets),
                () =>
                {
                    test(
                        "Checking whether the stylesheets are interpreted correctly…",
                        () =>
                        {
                            CheckAssets(
                                "Assets.StyleSheets",
                                () => settings.StyleSheets);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.ScriptInsertion),
                () =>
                {
                    test(
                        "Checking whether the script-insertion settings are interpreted correctly…",
                        () =>
                        {
                            CheckInsertionTypes(
                                "Assets.ScriptInsertion",
                                () => settings.ScriptInsertion);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.Scripts),
                () =>
                {
                    test(
                        "Checking whether the scripts are interpreted correctly…",
                        () =>
                        {
                            CheckAssets(
                                "Assets.Scripts",
                                () => settings.Scripts);
                        });
                });

            suite(
                nameof<Settings>((settings) => settings.PictureInsertion),
                () =>
                {
                    test(
                        "Checking whether the picture-insertion settings are interpreted correctly…",
                        () =>
                        {
                            CheckInsertionTypes(
                                "Assets.PictureInsertion",
                                () => settings.PictureInsertion);
                        });
                });
        });
}
