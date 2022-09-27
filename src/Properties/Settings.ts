import { createRequire } from "node:module";
import { MultiRange } from "multi-integer-range";
import vscode, { WorkspaceConfiguration } from "vscode";
import { Constants } from "../Constants.js";
import { ConversionType } from "../Conversion/ConversionType.js";
import { AssetURLType } from "../System/Documents/Assets/AssetURLType.js";
import { InsertionType } from "../System/Documents/Assets/InsertionType.js";
import { CustomPageFormat } from "../System/Documents/CustomPageFormat.js";
import { EmojiType } from "../System/Documents/EmojiType.js";
import { ListType } from "../System/Documents/ListType.js";
import { Margin } from "../System/Documents/Margin.js";
import { PageOrientation } from "../System/Documents/PageOrientation.js";
import { Paper } from "../System/Documents/Paper.js";
import { StandardizedFormatType } from "../System/Documents/StandardizedFormatType.js";
import { StandardizedPageFormat } from "../System/Documents/StandardizedPageFormat.js";
import { TocSettings } from "../System/Documents/TocSettings.js";
import { IRunningBlockContent } from "./IRunningBlockContent.js";
import { ISettings } from "./ISettings.js";

const { env, workspace } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Provides access to settings.
 */
export class Settings
{
    /**
     * Gets the key of the configuration of the extension.
     */
    public static readonly ConfigKey = "markdownConverter";

    /**
     * A default instance of the {@link Settings `Settings`} class.
     */
    private static defaultInstance: Settings = null;

    /**
     * Initializes a new instance of the {@link Settings `Settings`} class.
     */
    public constructor()
    { }

    /**
     * Gets a default instance of the {@link Settings `Settings`} class.
     */
    public static get Default(): Settings
    {
        if (!this.defaultInstance)
        {
            this.defaultInstance = new Settings();
        }

        return Settings.defaultInstance;
    }

    /**
     * Gets the path to the chromium-installation to use.
     */
    public get ChromiumExecutablePath(): string
    {
        return this.GetConfigEntry("ChromiumExecutablePath");
    }

    /**
     * Gets the arguments to pass to chromium.
     */
    public get ChromiumArgs(): string[]
    {
        return this.GetConfigEntry("ChromiumArgs");
    }

    /**
     * Gets a pattern for determining the path to save the destination-files to.
     */
    public get DestinationPattern(): string
    {
        return this.GetConfigEntry("DestinationPattern");
    }

    /**
     * Gets a value indicating whether to ignore the language-mode while determining the file to convert.
     */
    public get IgnoreLanguageMode(): boolean
    {
        return this.GetConfigEntry("IgnoreLanguageMode");
    }

    /**
     * Gets the quality of the `.jpg`-pictures produced by MarkdownConverter.
     */
    public get ConversionQuality(): number
    {
        return this.GetConfigEntry("ConversionQuality");
    }

    /**
     * Gets the types of conversion to apply.
     */
    public get ConversionType(): ConversionType[]
    {
        let types: ConversionType[] = [];
        let conversionTypes = this.GetConfigEntry("ConversionType", [ConversionType[ConversionType.PDF]] as Array<keyof typeof ConversionType>);

        for (let conversionType of conversionTypes)
        {
            types.push(ConversionType[conversionType]);
        }

        return types;
    }

    /**
     * Gets the language to localize the document.
     */
    public get Locale(): string
    {
        return this.GetConfigEntry("Locale") ?? env.language;
    }

    /**
     * Gets the default date-format for the document.
     */
    public get DefaultDateFormat(): string
    {
        return this.GetConfigEntry("DefaultDateFormat");
    }

    /**
     * Gets a set of custom date-formats.
     */
    public get DateFormats(): Record<string, string>
    {
        return this.GetConfigEntry("DateFormats");
    }

    /**
     * Gets the emojis to render into the document.
     */
    public get EmojiType(): EmojiType
    {
        return EmojiType[this.GetConfigEntry("Parser.EmojiType")];
    }

    /**
     * Gets the attributes to use for the documents.
     */
    public get Attributes(): { [Key: string]: any }
    {
        return this.GetConfigEntry("Document.Attributes");
    }

    /**
     * Gets the layout of the document.
     */
    public get PaperFormat(): Paper
    {
        let paper = new Paper();
        let referenceChecker = new Object();
        let paperKey = "Document.Paper" as const;
        let formatKey = `${paperKey}.PaperFormat` as const;
        let widthKey = `${formatKey}.Width` as const;
        let heightKey = `${formatKey}.Height` as const;

        if (
            this.config.has(widthKey) &&
            this.config.has(heightKey))
        {
            paper.Format = new CustomPageFormat(this.GetConfigEntry(widthKey), this.GetConfigEntry(heightKey));
        }
        else
        {
            let format = new StandardizedPageFormat();
            format.Format = StandardizedFormatType[this.GetConfigEntry<keyof typeof StandardizedFormatType>(`${formatKey}.Format`, nameof(StandardizedFormatType.A4) as keyof typeof StandardizedFormatType)];
            format.Orientation = PageOrientation[this.GetConfigEntry<keyof typeof PageOrientation>(`${formatKey}.Orientation`, PageOrientation[PageOrientation.Portrait] as keyof typeof PageOrientation)];
            paper.Format = format;
        }

        for (let side of (
            [
                nameof<Margin>((m) => m.Top),
                nameof<Margin>((m) => m.Left),
                nameof<Margin>((m) => m.Bottom),
                nameof<Margin>((m) => m.Right)
            ] as Array<keyof Margin>))
        {
            let configKey = `${paperKey}.Margin.${side}` as const;

            if (this.GetConfigEntry(configKey, referenceChecker) !== referenceChecker)
            {
                paper.Margin[side] = this.GetConfigEntry(configKey);
            }
        }

        return paper;
    }

    /**
     * Gets a value indicating whether headers and footers are enabled.
     */
    public get HeaderFooterEnabled(): boolean
    {
        return this.GetConfigEntry("Document.HeaderFooterEnabled");
    }

    /**
     * Gets the content of the different sections of the header.
     */
    public get HeaderContent(): IRunningBlockContent
    {
        return this.GetConfigEntry("Document.HeaderContent");
    }

    /**
     * Gets the template of the header of the document.
     */
    public get HeaderTemplate(): string
    {
        return this.GetConfigEntry("Document.HeaderTemplate");
    }

    /**
     * Gets the content of the different sections of the footer.
     */
    public get FooterContent(): IRunningBlockContent
    {
        return this.GetConfigEntry("Document.FooterContent");
    }

    /**
     * Gets the template of the footer of the document.
     */
    public get FooterTemplate(): string
    {
        return this.GetConfigEntry("Document.FooterTemplate");
    }

    /**
     * Gets the template of the metadata-section of the document.
     */
    public get MetaTemplate(): string
    {
        return this.GetConfigEntry("Document.MetaTemplate");
    }

    /**
     * Gets a value indicating whether default styles should be included.
     */
    public get DefaultStylesEnabled(): boolean
    {
        return this.GetConfigEntry("Document.DefaultStyles");
    }

    /**
     * Gets the settings for the table of contents of the document.
     */
    public get TocSettings(): TocSettings
    {
        if (this.GetConfigEntry("Parser.Toc.Enabled"))
        {
            let $class = this.GetConfigEntry("Parser.Toc.Class");
            let levels = this.GetConfigEntry("Parser.Toc.Levels");
            let indicator = new RegExp(this.GetConfigEntry("Parser.Toc.Indicator"), "im");
            let listType = this.GetConfigEntry("Parser.Toc.ListType") === "ol" ? ListType.Ordered : ListType.Unordered;
            return new TocSettings($class, new MultiRange(levels), indicator, listType);
        }
        else
        {
            return null;
        }
    }

    /**
     * Gets the template of the document.
     */
    public get Template(): string
    {
        return this.GetConfigEntry("Document.Template");
    }

    /**
     * Gets the highlight-style of the document
     */
    public get HighlightStyle(): string
    {
        return this.GetConfigEntry("Document.HighlightStyle");
    }

    /**
     * Gets a value indicating whether to use system-provided styles.
     */
    public get SystemParserEnabled(): boolean
    {
        return this.GetConfigEntry("Parser.SystemParserEnabled");
    }

    /**
     * Gets the insertion-types to use for stylesheets based on their path.
     */
    public get StyleSheetInsertion(): Partial<Record<AssetURLType, InsertionType>>
    {
        return this.LoadInsertionTypes("Assets.StyleSheetInsertion");
    }

    /**
     * Gets the stylesheets to add to the document.
     */
    public get StyleSheets(): Record<string, InsertionType>
    {
        return this.LoadAssets("Assets.StyleSheets");
    }

    /**
     * Gets the insertion-types to use for scripts based on their path.
     */
    public get ScriptInsertion(): Partial<Record<AssetURLType, InsertionType>>
    {
        return this.LoadInsertionTypes("Assets.ScriptInsertion");
    }

    /**
     * Gets the scripts to add to the document.
     */
    public get Scripts(): Record<string, InsertionType>
    {
        return this.LoadAssets("Assets.Scripts");
    }

    /**
     * Gets the insertion-types to use for pictures based on their path.
     */
    public get PictureInsertion(): Partial<Record<AssetURLType, InsertionType>>
    {
        return this.LoadInsertionTypes("Assets.PictureInsertion");
    }

    /**
     * Gets the configuration.
     */
    private get config(): WorkspaceConfiguration
    {
        return workspace.getConfiguration(Settings.ConfigKey);
    }

    /**
     * Determines the value of a configuration entry.
     *
     * @template T
     * The type of the entry to get.
     *
     * @param key
     * The key of the entry.
     *
     * @param defaultValue
     * The default value to return.
     *
     * @returns
     * The value of the configuration with the specified {@link key `key`}.
     */
    protected GetConfigEntry<TKey extends keyof ISettings>(key: TKey, defaultValue?: ISettings[TKey]): ISettings[TKey];

    /**
     * Determines the value of a configuration entry.
     *
     * @template T
     * The type of the entry to get.
     *
     * @param key
     * The key of the entry.
     *
     * @param defaultValue
     * The default value to return.
     *
     * @returns
     * The value of the configuration with the specified {@link key `key`}.
     */
    protected GetConfigEntry<T>(key: string, defaultValue?: T): T;

    /**
     * Determines the value of a configuration entry.
     *
     * @template T
     * The type of the entry to get.
     *
     * @param key
     * The key of the entry.
     *
     * @param defaultValue
     * The default value to return.
     *
     * @returns
     * The value of the configuration with the specified {@link key `key`}.
     */
    protected GetConfigEntry<T>(key: string, defaultValue?: T): T
    {
        return this.config.get<T>(key, defaultValue);
    }

    /**
     * Loads insertion-types from the configuration with the specified {@link key `key`}.
     *
     * @param key
     * The key of the entry to load the insertion-types from.
     *
     * @returns
     * The insertion-types loaded from the configuration with the specified {@link key `key`}.
     */
    protected LoadInsertionTypes(key: keyof ISettings): Partial<Record<AssetURLType, InsertionType>>
    {
        let result = {} as Record<AssetURLType, InsertionType>;

        for (let entry of Object.entries(this.GetConfigEntry(key)))
        {
            result[AssetURLType[entry[0] as keyof typeof AssetURLType]] = InsertionType[entry[1] as keyof typeof InsertionType];
        }

        return result;
    }

    /**
     * Loads assets from the configuration with the specified {@link key `key`}.
     *
     * @param key
     * The key of the entry to load the assets from.
     *
     * @returns
     * The assets loaded from the configuration with the specified {@link key `key`}.
     */
    protected LoadAssets(key: keyof ISettings): Record<string, InsertionType>
    {
        return Object.fromEntries(
            Object.entries(this.GetConfigEntry(key)).map(
                (entry) =>
                {
                    return [entry[0], InsertionType[entry[1] as keyof typeof InsertionType]];
                }));
    }
}
