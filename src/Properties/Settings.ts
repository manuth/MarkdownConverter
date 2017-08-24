'use strict';
import * as VSCode from 'vscode';
import { ConversionType } from "../ConversionType";
import { EmbeddingOption } from "../System/Drawing/EmbeddingOption";
import { Footer, Header, Section } from "../System/Drawing/Section";
import { KeyNotFoundException } from "../System/KeyNotFoundException";
import { Layout } from "../System/Drawing/Layout";
import { ListType } from "../System/Drawing/ListType";
import { Margin } from "../System/Drawing/Margin";
import { TOCSettings } from "../System/Drawing/TOCSettings";

export class Settings
{
    /**
     * Gets the key of the configuration of the extension.
     */
    private static readonly configKey: string = 'markdownConverter';

    private static defaultInstance: Settings = new Settings();

    public static get Default(): Settings
    {
        return Settings.defaultInstance;
    }

    /**
     * Gets the path to save the output-files to.
     */
    public get OutputDirectory(): string
    {
        return this.getConfigEntry<string>('outDir', '');
    }

    /**
     * Gets a value indicating whether to ignore the language while determining the file to convert.
     */
    public get IgnoreLanguage(): boolean
    {
        return this.getConfigEntry<boolean>('ignoreLanguage', false);
    }

    /**
     * Gets a value indicating whether to autosave files before converting them.
     */
    public get AutoSave(): boolean
    {
        return this.getConfigEntry<boolean>('autoSave', true);
    }

    /**
     * Gets the quality of the pictures produced by MarkdownConverter.
     */
    public get Quality(): number
    {
        return this.getConfigEntry<number>('document.quality', 90);
    }

    /**
     * Gets the types of conversion to apply.
     */
    public get ConversionTypes(): ConversionType[]
    {
        try
        {
            let types: ConversionType[] = [];
            let value = this.getConfigEntry('conversionType');

            if (typeof value == 'string')
            {
                value = [value];
            }

            for (let key in value)
            {
                types.push(ConversionType[value[key] as string]);
            }

            return types;
        }
        catch (exception)
        {
            return [ConversionType.PDF];
        }
    }

    /**
     * Gets the emojis to render into the document.
     */
    public get Emoji(): boolean | string
    {
        return this.getConfigEntry('document.emoji', 'github');
    }

    /**
     * Gets the attributes to use for the documents.
     */
    public get Attributes(): { [Key: string]: any }
    {
        return this.getConfigEntry<{ [Key: string]: any }>('document.attributes', {});
    }

    /**
     * Gets the language to localize the document.
     */
    public get Locale(): string
    {
        return this.getConfigEntry<string>('document.localization.locale', VSCode.env.language);
    }

    /**
     * Gets the format to localize dates inside the document.
     */
    public get DateFormat(): string
    {
        return this.getConfigEntry<string>('document.localization.dateFormat', 'default');
    }

    /**
     * Gets the layout of the document.
     */
    public get Layout(): Layout
    {
        let layout = new Layout();
        layout.Margin = new Margin(
            this.getConfigEntry<string>('document.layout.margin.top', '1cm'),
            this.getConfigEntry<string>('document.layout.margin.right', '1cm'),
            this.getConfigEntry<string>('document.layout.margin.bottom', '1cm'),
            this.getConfigEntry<string>('document.layout.margin.left', '1cm'));

        try
        {
            let width = this.getConfigEntry<string>('document.layout.width');
            let height = this.getConfigEntry<string>('document.layout.height');
            layout.Width = width;
            layout.Height = height;
        }
        catch (exception)
        {
            layout.Format = this.getConfigEntry<string>('document.layout.format', 'A4');
            layout.Orientation = this.getConfigEntry<string>('document.layout.orientation', 'portrait');
        }

        return layout;
    }

    /**
     * Gets the header of the document.
     */
    public get Header(): Header
    {
        return this.getHeader('document.header');
    }

    /**
     * Gets the special headers of the document.
     */
    public get SpecialHeaders(): { [Key: number]: Header }
    {
        let configKey = 'document.specialHeaders';
        let result: { [Key: number]: Header } = {};
        let specialHeaders = this.getConfigEntry<{ pageNumber: number, header: Header }[]>(configKey, []);

        for (let key in specialHeaders)
        {
            let specialHeader = specialHeaders[key];
            result[specialHeader.pageNumber] = this.getHeader(configKey + '.' + key + '.header');
        }
        return result;
    }

    /**
     * Gets the header for even pages of the document.
     */
    public get EvenHeader(): Header
    {
        return this.getHeader('document.evenHeader', null);
    }

    /**
     * Gets the header for odd pages of the document.
     */
    public get OddHeader(): Header
    {
        return this.getHeader('document.oddHeader', null);
    }

    /**
     * Gets the header for the last page of the document.
     */
    public get LastHeader(): Header
    {
        return this.getHeader('document.lastHeader', null);
    }

    /**
     * Gets the footer of the document.
     */
    public get Footer(): Footer
    {
        return this.getFooter('document.footer');
    }

    /**
     * Gets the special footers of the document.
     */
    public get SpecialFooters(): { [Key: number]: Footer }
    {
        let configKey = 'document.specialFooters';
        let result: { [Key: number]: Footer } = {};
        let specialFooters = this.getConfigEntry<{ pageNumber: number, footer: Footer }[]>(configKey, []);

        for (let key in specialFooters)
        {
            let specialFooter = specialFooters[key];
            result[specialFooter.pageNumber] = this.getFooter(configKey + '.' + key + '.footer');
        }
        return result;
    }

    /**
     * Gets the footer for even pages of the document.
     */
    public get EvenFooter(): Footer
    {
        return this.getFooter('document.evenFooter', null);
    }

    /**
     * Gets the footer for odd pages of the document.
     */
    public get OddFooter(): Footer
    {
        return this.getFooter('document.oddFooter', null);
    }

    /**
     * Gets the footer for the last page of the document.
     */
    public get LastFooter(): Footer
    {
        return this.getFooter('document.lastFooter', null);
    }

    /**
     * Gets the settings for the table of contents of the document.
     */
    public get TOCSettings(): TOCSettings
    {
        let tocSettings = new TOCSettings();
        tocSettings.Class = this.getConfigEntry<string>('document.toc.class', 'toc');
        tocSettings.LevelRange = this.getConfigEntry<string>('document.toc.levels', '4-6');
        tocSettings.Indicator = this.getConfigEntry<RegExp>('document.toc.indicator', /^\[\[\s*toc\s*\]\]/im);
        tocSettings.ListType = ListType[this.getConfigEntry<string>('document.toc.listType', ListType[ListType.ul])];
        return tocSettings;
    }

    /**
     * Gets the template of the document.
     */
    public get Template(): string
    {
        return this.getConfigEntry<string>('document.style.template', null);
    }

    /**
     * Gets the wrapper of the document.
     */
    public get Wrapper(): string
    {
        return this.getConfigEntry<string>('document.style.wrapper', null);
    }

    /**
     * Gets the highlight-style of the document
     */
    public get HighlightStyle(): boolean | string
    {
        return this.getConfigEntry('document.style.highlightStyle', true);
    }

    /**
     * Gets the embedding-style of the document.
     */
    public get EmbeddingStyle(): boolean | string
    {
        return this.getConfigEntry('document.style.embeddingStyle', EmbeddingOption[EmbeddingOption.All]);
    }

    /**
     * Gets a value indicating whether to use system-provided styles.
     */
    public get SystemStyles(): boolean
    {
        return this.getConfigEntry<boolean>('document.style.systemStyles', true);
    }

    /**
     * Gets the css code-snippet of the document.
     */
    public get Styles(): string
    {
        return this.getConfigEntry<string>('document.style.styles', null);
    }

    /**
     * Gets the stylesheets of the document.
     */
    public get StyleSheets(): string[]
    {
        return this.getConfigEntry<string[]>('document.style.styleSheets', []);
    }

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

    /**
     * Determines the value of the document-fragment of a configuration entry.
     *
     * @param key
     * The key of the entry.
     * 
     * @param defaultValue
     * The default value to return.
     */
    private getSection<T extends Section>(prototype: T, key: string, defaultValue: T): T
    {
        if (this.config.has(key))
        {
            let fragment = prototype;
            fragment.Content = this.getConfigEntry<string>(key + '.content', defaultValue.Content);
            fragment.Height = this.getConfigEntry<string>(key + '.height', defaultValue.Height);
            return fragment;
        }
        else
        {
            if (arguments.length > 2)
            {
                return defaultValue;
            }
            else
            {
                throw new KeyNotFoundException();
            }
        }
    }

    /**
     * Determines the value of the header of a configuration entry.
     *
     * @param key
     * The key of the entry.
     * 
     * @param defaultValue
     * The default value to return.
     */
    private getHeader(key: string, defaultValue?: Header): Header
    {
        if (arguments.length <= 1)
        {
            defaultValue = new Header(
                '15mm',
                '<table style=\"width: 100%; table-layout: fixed; \">' +
                '<td style=\"text-align: left; \">{{ Author }}</td>' +
                '<td style=\"text-align: center\">{{ PageNumber }}/{{ PageCount }}</td>' +
                '<td style=\"text-align: right\">{{ Company.Name }}</td></table>');
        }

        return this.getSection(new Header(), key, defaultValue);
    }

    /**
     * Determines the value of the footer of a configuration entry.
     *
     * @param key
     * The key of the entry.
     * 
     * @param defaultValue
     * The default value to return.
     */
    private getFooter(key: string, defaultValue?: Footer): Footer
    {
        if (arguments.length <= 1)
        {
            defaultValue = new Footer(
                '1cm',
                '<table style=\"width: 100%; table-layout: fixed; \">' +
                '<td style=\"text-align: left; \"></td>' +
                '<td style=\"text-align: center\">{{ CreationDate }}</td>' +
                '<td style=\"text-align: right\"></td></table>');
        }

        return this.getSection(new Footer(), key, defaultValue);
    }
}