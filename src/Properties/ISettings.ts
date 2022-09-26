import { ConversionType } from "../Conversion/ConversionType.js";
import { AssetURLType } from "../System/Documents/Assets/AssetURLType.js";
import { InsertionType } from "../System/Documents/Assets/InsertionType.js";
import { EmojiType } from "../System/Documents/EmojiType.js";
import { Margin } from "../System/Documents/Margin.js";
import { IRunningBlockContent } from "./IRunningBlockContent.js";

/**
 * Represents the raw vscode-settings.
 */
export interface ISettings
{
    /**
     * The path to the chromium-installation to use.
     */
    ChromiumExecutablePath?: string;

    /**
     * The arguments to pass to chromium.
     */
    ChromiumArgs?: string[];

    /**
     * The pattern for creating the destination-path.
     */
    DestinationPattern?: string;

    /**
     * A value indicating whether the programming-language of files should be ignored.
     */
    IgnoreLanguageMode?: boolean;

    /**
     * The quality to use for creating `.jpg`-files.
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
    ["Parser.Toc.ListType"]?: "ol" | "ul";

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
    ["Document.Paper.Margin"]?: Partial<Record<keyof Margin, string>>;

    /**
     * A value indicating whether headers and footers are enabled.
     */
    ["Document.HeaderFooterEnabled"]?: boolean;

    /**
     * The content of the different sections of the header.
     */
    ["Document.HeaderContent"]?: IRunningBlockContent;

    /**
     * The template of the header.
     */
    ["Document.HeaderTemplate"]?: string;

    /**
     * The content of the different sections of the footer.
     */
    ["Document.FooterContent"]?: IRunningBlockContent;

    /**
     * The template of the footer.
     */
    ["Document.FooterTemplate"]?: string;

    /**
     * The template of the metadata-section.
     */
    ["Document.MetaTemplate"]?: string;

    /**
     * The template of the document.
     */
    ["Document.Template"]?: string;

    /**
     * A value indicating whether the default styles should be included.
     */
    ["Document.DefaultStyles"]?: boolean;

    /**
     * The `highlight.js`-style to apply.
     */
    ["Document.HighlightStyle"]?: string;

    /**
     * The insertion-types to use for stylesheets based on their path.
     */
    ["Assets.StyleSheetInsertion"]?: Partial<Record<keyof typeof AssetURLType, keyof typeof InsertionType>>;

    /**
     * The stylesheets to add to the document.
     */
    ["Assets.StyleSheets"]?: Record<string, keyof typeof InsertionType>;

    /**
     * The insertion-types to use for scripts based on their path.
     */
    ["Assets.ScriptInsertion"]?: Partial<Record<keyof typeof AssetURLType, keyof typeof InsertionType>>;

    /**
     * The javascript files to add to the document.
     */
    ["Assets.Scripts"]?: Record<string, keyof typeof InsertionType>;

    /**
     * The insertion-types to use for pictures based on their path.
     */
    ["Assets.PictureInsertion"]?: Partial<Record<keyof typeof AssetURLType, keyof typeof InsertionType>>;
}
