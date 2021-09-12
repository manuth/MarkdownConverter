import { MultiRange } from "multi-integer-range";
import { env, workspace, WorkspaceConfiguration } from "vscode";
import { ConversionType } from "../Conversion/ConversionType";
import { CustomPageFormat } from "../System/Documents/CustomPageFormat";
import { EmojiType } from "../System/Documents/EmojiType";
import { ListType } from "../System/Documents/ListType";
import { Margin } from "../System/Documents/Margin";
import { PageOrientation } from "../System/Documents/PageOrientation";
import { Paper } from "../System/Documents/Paper";
import { StandardizedFormatType } from "../System/Documents/StandardizedFormatType";
import { StandardizedPageFormat } from "../System/Documents/StandardizedPageFormat";
import { TocSettings } from "../System/Documents/TocSettings";

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
     * A default instance of the `Settings` class.
     */
    private static defaultInstance: Settings = new Settings();

    /**
     * Gets a default instance of the `Settings` class.
     */
    public static get Default(): Settings
    {
        return Settings.defaultInstance;
    }

    /**
     * Gets the path to the chromium-installation to use.
     */
    public get ChromiumExecutablePath(): string[]
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
     * Gets the path to save the destination-files to.
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
     * Gets the quality of the pictures produced by MarkdownConverter.
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
        let conversionTypes = this.GetConfigEntry<Array<keyof typeof ConversionType>>("ConversionType", [ConversionType[ConversionType.PDF] as any]);

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
        return this.GetConfigEntry("Locale") || env.language;
    }

    /**
     * Gets the format to localize dates inside the document.
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
        return EmojiType[this.GetConfigEntry<keyof typeof EmojiType>("Parser.EmojiType")];
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
        let paperKey = "Document.Paper";
        let formatKey = `${paperKey}.PaperFormat`;
        let widthKey = `${formatKey}.Width`;
        let heightKey = `${formatKey}.Height`;

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

        for (let side of (["Top", "Left", "Bottom", "Right"] as Array<keyof Margin>))
        {
            let configKey = `${paperKey}.Margin.` + side;

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
     * Gets the header of the document.
     */
    public get HeaderTemplate(): string
    {
        return this.GetConfigEntry("Document.HeaderTemplate");
    }

    /**
     * Gets the footer of the document.
     */
    public get FooterTemplate(): string
    {
        return this.GetConfigEntry("Document.FooterTemplate");
    }

    /**
     * Gets the metadata-section of the document.
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
        return this.GetConfigEntry("Document.Design.DefaultStyles");
    }

    /**
     * Gets the settings for the table of contents of the document.
     */
    public get TocSettings(): TocSettings
    {
        if (this.GetConfigEntry<boolean>("Parser.Toc.Enabled"))
        {
            let $class = this.GetConfigEntry<string>("Parser.Toc.Class");
            let levels = this.GetConfigEntry<string>("Parser.Toc.Levels");
            let indicator = new RegExp(this.GetConfigEntry("Parser.Toc.Indicator"), "im");
            let listType = this.GetConfigEntry<string>("Parser.Toc.ListType") === "ol" ? ListType.Ordered : ListType.Unordered;

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
        return this.GetConfigEntry<string>("Document.Design.Template");
    }

    /**
     * Gets the highlight-style of the document
     */
    public get HighlightStyle(): string
    {
        return this.GetConfigEntry("Document.Design.HighlightStyle");
    }

    /**
     * Gets a value indicating whether to use system-provided styles.
     */
    public get SystemParserEnabled(): boolean
    {
        return this.GetConfigEntry<boolean>("Parser.SystemParserEnabled");
    }

    /**
     * Gets the stylesheets of the document.
     */
    public get StyleSheets(): string[]
    {
        return this.GetConfigEntry("Document.Design.StyleSheets");
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
     * @param key
     * The key of the entry.
     *
     * @param defaultValue
     * The default value to return.
     *
     * @returns
     * The value of the configuration with the specified `key`.
     */
    protected GetConfigEntry<T>(key: string, defaultValue?: T): T
    {
        return this.config.get<T>(key, defaultValue);
    }
}
