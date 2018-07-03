import * as VSCode from "vscode";
import ConversionType from "../ConversionType";
import KeyNotFoundException from "../System/KeyNotFoundException";
import Paper from "../System/Drawing/Paper";
import ListType from "../System/Drawing/ListType";
import Margin from "../System/Drawing/Margin";
import TocSettings from "../System/Drawing/TocSettings";
import EmojiType from "../System/Drawing/EmojiType";
import CustomPaperFormat from "../System/Drawing/CustomPaperFormat";
import StandardizedPaperFormat from "../System/Drawing/StandardizedPaperFormat";
import StandardizedFormatType from "../System/Drawing/StandardizedFormatType";
import PaperOrientation from "../System/Drawing/PaperOrientation";

/**
 * Provides access to settings.
 */
export default class Settings
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
     * Gets the path to save the output-files to.
     */
    public get OutputDirectory(): string
    {
        return this.getConfigEntry("OutDir");
    }

    /**
     * Gets a value indicating whether to ignore the language-mode while determining the file to convert.
     */
    public get IgnoreLanguageMode(): boolean
    {
        return this.getConfigEntry("IgnoreLanguageMode");
    }

    /**
     * Gets the quality of the pictures produced by MarkdownConverter.
     */
    public get ConversionQuality(): number
    {
        return this.getConfigEntry("ConversionQuality");
    }

    /**
     * Gets the types of conversion to apply.
     */
    public get ConversionType(): ConversionType[]
    {
        let types: ConversionType[] = [];
        let conversionTypes: string[] = this.getConfigEntry("ConversionType", [ConversionType[ConversionType.PDF]]);

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
        return this.getConfigEntry("Locale", null) || VSCode.env.language;
    }

    /**
     * Gets the format to localize dates inside the document.
     */
    public get DateFormat(): string
    {
        return this.getConfigEntry("DateFormat", "Default");
    }

    /**
     * Gets the emojis to render into the document.
     */
    public get EmojiType(): EmojiType
    {
        return this.EmojiType[this.getConfigEntry<string>("Document.EmojiType", "GitHub")];
    }

    /**
     * Gets the attributes to use for the documents.
     */
    public get Attributes(): { [Key: string]: any }
    {
        return this.getConfigEntry("Document.Attributes", {});
    }

    /**
     * Gets the layout of the document.
     */
    public get PaperFormat(): Paper
    {
        let paper = new Paper();

        try
        {
            let width: string = this.getConfigEntry("Document.Paper.PaperFormat.Width");
            let height: string = this.getConfigEntry("Document.Paper.PaperFormat.Height");
            
            let format = new CustomPaperFormat();
            format.Width = width;
            format.Height = height;
            paper.Format = format;
        }
        catch (exception)
        {
            let format = new StandardizedPaperFormat();
            format.Format = StandardizedFormatType[this.getConfigEntry("Document.Paper.PaperFormat.Format", StandardizedFormatType[StandardizedFormatType.A4])];
            format.Orientation = PaperOrientation[this.getConfigEntry("Document.Paper.PaperFormat.Orientation", PaperOrientation[PaperOrientation.Portrait])];
            paper.Format = format;
        }
        
        paper.Margin = new Margin(
            this.getConfigEntry("Document.Paper.Margin.Top", "1cm"),
            this.getConfigEntry("Document.Paper.Margin.Right", "1cm"),
            this.getConfigEntry("Document.Paper.Margin.Bottom", "1cm"),
            this.getConfigEntry("Document.Paper.Margin.Left", "1cm"));

        return paper;
    }

    /**
     * Gets a value indicating whether headers and footers are enabled.
     */
    public get HeaderFooterEnabled(): boolean
    {
        return this.getConfigEntry("Document.HeaderFooterEnabled", true);
    }

    /**
     * Gets the header of the document.
     */
    public get HeaderTemplate(): string
    {
        return this.getConfigEntry("Document.HeaderTemplate", "<table style=\"width: 100%; table-layout: fixed; \"><td style=\"text-align: left; \"></td><td style=\"text-align: center\">{{ Author }}</td><td style=\"text-align: right\"><span class=\"pageNumber\"></span>/<span class=\"totalPages\"></span></td></table>");
    }

    /**
     * Gets the footer of the document.
     */
    public get FooterTemplate(): string
    {
        return this.getConfigEntry("Document.FooterTemplate", "<table style=\"width: 100%; table-layout: fixed; \"><td style=\"text-align: left; \"></td><td style=\"text-align: center\">{{ CreationDate }}</td><td style=\"text-align: right\"></td></table>");
    }

    /**
     * Gets the settings for the table of contents of the document.
     */
    public get TocSettings(): TocSettings
    {
        let tocSettings = new TocSettings();
        tocSettings.Enabled = this.getConfigEntry("Document.Toc.Enabled", true);
        tocSettings.Class = this.getConfigEntry("Document.Toc.Class", "markdown-converter-toc");
        tocSettings.LevelRange = this.getConfigEntry("Document.Toc.Levels", "1-6");
        tocSettings.Indicator = new RegExp(this.getConfigEntry("Document.Toc.Indicator", /^\[\[\s*toc\s*\]\]/im));
        tocSettings.ListType = ListType[this.getConfigEntry<string>("Document.Toc.ListType", ListType[ListType.ul])];
        return tocSettings;
    }

    /**
     * Gets the template of the document.
     */
    public get Template(): string
    {
        return this.getConfigEntry<string>("Document.Design.Template", null);
    }

    /**
     * Gets the highlight-style of the document
     */
    public get HighlightStyle(): string
    {
        return this.getConfigEntry("Document.Design.HighlightStyle", "Default");
    }

    /**
     * Gets a value indicating whether to use system-provided styles.
     */
    public get SystemStylesEnabled(): boolean
    {
        return this.getConfigEntry<boolean>("Document.Design.SystemStylesEnabled", true);
    }

    /**
     * Gets the stylesheets of the document.
     */
    public get StyleSheets(): string[]
    {
        return this.getConfigEntry("Document.Design.StyleSheets", []);
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
     */
    private getConfigEntry<T>(key: string, defaultValue?: T): T
    {
        if (this.config.has(key))
        {
            return this.config.get<T>(key);
        }
        else
        {
            if (arguments.length > 1)
            {
                return defaultValue;
            }
            else
            {
                throw new KeyNotFoundException();
            }
        }
    }
}