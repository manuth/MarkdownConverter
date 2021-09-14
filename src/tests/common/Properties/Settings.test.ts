import { deepStrictEqual, ok, strictEqual } from "assert";
import { env } from "vscode";
import { ConversionType } from "../../../Conversion/ConversionType";
import { ISettings } from "../../../Properties/ISettings";
import { Settings } from "../../../Properties/Settings";
import { CustomPageFormat } from "../../../System/Documents/CustomPageFormat";
import { EmojiType } from "../../../System/Documents/EmojiType";
import { ListType } from "../../../System/Documents/ListType";
import { Margin } from "../../../System/Documents/Margin";
import { PageOrientation } from "../../../System/Documents/PageOrientation";
import { StandardizedFormatType } from "../../../System/Documents/StandardizedFormatType";
import { StandardizedPageFormat } from "../../../System/Documents/StandardizedPageFormat";
import { ITestContext } from "../../ITestContext";

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
            let settings: Settings;

            suiteSetup(
                () =>
                {
                    settings = Settings.Default;
                });

            suite(
                nameof<Settings>((settings) => settings.ConversionType),
                () =>
                {
                    test(
                        "Checking whether the default conversion-type is set correctly…",
                        function()
                        {
                            this.slow(1 * 1000);
                            this.timeout(2 * 1000);
                            context.Clear();
                            deepStrictEqual(settings.ConversionType, [ConversionType.PDF]);
                        });

                    test(
                        "Checking whether the conversion-types are resolved correctly…",
                        function()
                        {
                            this.slow(1 * 1000);
                            this.timeout(2 * 1000);
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
                        function()
                        {
                            this.slow(1 * 1000);
                            this.timeout(2 * 1000);
                            context.Settings.Locale = "de";
                            strictEqual(settings.Locale, "de");
                        });

                    test(
                        "Checking whether the locale defaults to the locale of vscode…",
                        function()
                        {
                            this.slow(1 * 1000);
                            this.timeout(2 * 1000);
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

                            context.Settings["Document.Paper.Margin"] = newMargin;

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

                            context.Settings["Document.Paper.PaperFormat"] = customFormat;
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
                            context.Settings["Document.Paper.PaperFormat"] = {
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
                });

            suite(
                nameof<Settings>((settings) => settings.TocSettings),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<Settings>((s) => s.TocSettings)}\` equal to \`null\` if the toc is disabled…`,
                        () =>
                        {
                            context.Settings["Parser.Toc.Enabled"] = false;
                            strictEqual(settings.TocSettings, null);
                        });

                    test(
                        `Checking whether the \`${nameof(ListType)}\`-option is parsed correctly…`,
                        () =>
                        {
                            context.Settings["Parser.Toc.Enabled"] = true;
                            context.Settings["Parser.Toc.ListType"] = "ul";
                            strictEqual(settings.TocSettings.ListType, ListType.Unordered);
                            context.Settings["Parser.Toc.ListType"] = "ol";
                            strictEqual(settings.TocSettings.ListType, ListType.Ordered);
                        });
                });
        });
}
