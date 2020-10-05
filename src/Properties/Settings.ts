import { MultiRange } from "multi-integer-range";
import VSCode = require("vscode");
import { ConversionType } from "../Conversion/ConversionType";
import { CustomPaperFormat } from "../System/Documents/CustomPaperFormat";
import { EmojiType } from "../System/Documents/EmojiType";
import { ListType } from "../System/Documents/ListType";
import { Margin } from "../System/Documents/Margin";
import { Paper } from "../System/Documents/Paper";
import { PaperOrientation } from "../System/Documents/PaperOrientation";
import { StandardizedFormatType } from "../System/Documents/StandardizedFormatType";
import { StandardizedPaperFormat } from "../System/Documents/StandardizedPaperFormat";
import { TocSettings } from "../System/Documents/TocSettings";

/**
 * Provides access to settings.
 */
export class Settings
{
    /**
     * Gets the key of the configuration of the extension.
     */
    private static readonly configKey: string = "markdownConverter";

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
        return this.GetConfigEntry("Locale") || VSCode.env.language;
    }

    /**
     * Gets the format to localize dates inside the document.
     */
    public get DateFormat(): string
    {
        return this.GetConfigEntry("DateFormat");
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

        try
        {
            let width: string = this.GetConfigEntry(`${formatKey}.Width`);
            let height: string = this.GetConfigEntry(`${formatKey}.Height`);

            let format = new CustomPaperFormat(width, height);
            paper.Format = format;
        }
        catch (exception)
        {
            let format = new StandardizedPaperFormat();
            format.Format = StandardizedFormatType[this.GetConfigEntry<keyof typeof StandardizedFormatType>(`${formatKey}.Format`)];
            format.Orientation = PaperOrientation[this.GetConfigEntry<keyof typeof PaperOrientation>(`${formatKey}.Orientation`, PaperOrientation[PaperOrientation.Portrait] as any)];
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
    private get config(): VSCode.WorkspaceConfiguration
    {
        return VSCode.workspace.getConfiguration(Settings.configKey);
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
        if (this.config.has(key))
        {
            return this.config.get<T>(key);
        }
        else if (arguments.length > 1)
        {
            return defaultValue;
        }
        else
        {
            throw new RangeError();
        }
    }
}
