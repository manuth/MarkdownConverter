import { ConversionType } from "../Conversion/ConversionType";
import { EmojiType } from "../System/Documents/EmojiType";

/**
 * Represents the raw vscode-settings.
 */
export interface ISettings
{
    /**
     * The pattern for creating the destination-path.
     */
    DestinationPattern?: string;

    /**
     * A value indicating whether the programming-language of files should be ignored.
     */
    IgnoreLanguageMode?: boolean;

    /**
     * The quality to use for creating `.png`-files.
     */
    ConversionQuality?: number;

    /**
     * The type of the conversion to execute.
     */
    ConversionType?: Array<keyof typeof ConversionType>;

    /**
     * The locale of the messages to show.
     */
    Locale?: string;

    /**
     * The date-format to apply inside the document.
     */
    DefaultDateFormat?: string;

    /**
     * A set of custom date-formats.
     */
    DateFormats?: Record<string, string>;

    /**
     * The arguments to pass to chromium.
     */
    ChromiumArgs?: string[];

    /**
     * A value indicating whether the parser of `vscode` should be used.
     */
    ["Parser.SystemParserEnabled"]?: boolean;

    /**
     * The type of emoji to use.
     */
    ["Parser.EmojiType"]?: keyof typeof EmojiType;

    /**
     * A value indicating whether tocs should be created.
     */
    ["Parser.Toc.Enabled"]?: boolean;

    /**
     * The class of the table of contents.
     */
    ["Parser.Toc.Class"]?: string;

    /**
     * The levels to include in the toc.
     */
    ["Parser.Toc.Levels"]?: string;

    /**
     * The indicator of the toc.
     */
    ["Parser.Toc.Indicator"]?: string;

    /**
     * The list-type of the toc.
     */
    ["Parser.Toc.ListType"]?: string;

    /**
     * The attributes of the document.
     */
    ["Document.Attributes"]?: Record<string, unknown>;

    /**
     * The format of the paper.
     */
    ["Document.Paper.PaperFormat"]?: Record<string, string | number>;

    /**
     * The margin of the paper.
     */
    ["Document.Paper.Margin"]?: Record<string, string>;

    /**
     * A value indicating whether headers and footers are enabled.
     */
    ["Document.HeaderFooterEnabled"]?: boolean;

    /**
     * The template of the header.
     */
    ["Document.HeaderTemplate"]?: string;

    /**
     * The template of the footer.
     */
    ["Document.FooterTemplate"]?: string;

    /**
     * The template of the document.
     */
    ["Document.Design.Template"]?: string;

    /**
     * A value indicating whether the default styles should be included.
     */
    ["Document.Design.DefaultStyles"]?: string;

    /**
     * The `highlight.js`-style to apply.
     */
    ["Document.Design.HighlightStyle"]?: string;

    /**
     * The stylesheets to add to the document.
     */
    ["Document.Design.StyleSheets"]?: string[];

    /**
     * The javascript files to add to the document.
     */
    ["Document.Design.Scripts"]?: string[];
}
