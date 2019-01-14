declare module "twemoji"
{
    /**
     * Represents options for generating `img`-tags.
     */
    interface IOptions
    {
        /**
         * Gets or sets the file-base to load the emojis from.
         */
        base?: string;

        /**
         * Gets or sets the size of the emoji.
         */
        size?: string;

        /**
         * Gets or sets the extension of the emoji-file.
         */
        ext?: string;
    }

    /**
     * Represents options for processing `HTMLElement`s.
     */
    interface IDOMOptions
    {
        /**
         * Generates the location of the icon.
         */
        callback?: (icon: string, options: IOptions) => string;

        /**
         * Generates the attributes of the `img`-tag.
         */
        attributes?: (icon: string, variant: string) => { [attribute: string]: string };

        /**
         * Gets or sets the base-uri to get the icons from.
         */
        base?: string;

        /**
         * Gets or sets the extensions of the icon-files.
         */
        ext?: string;

        /**
         * The class-name to set.
         */
        className?: string;

        /**
         * Gets or sets the size of the icons.
         */
        size?: string | number;

        /**
         * Gets or sets the directory to load the icon from.
         */
        folder?: string;
    }

    type SourceCallback = (icon: string, options: IOptions, variant: string) => string;

    class Utilities
    {
        /**
         * Converts a hex-value to UTF-16.
         *
         * @param text
         * The text to convert.
         *
         * @returns
         * The converted text.
         */
        public fromCodePoint(text: string): string;

        /**
         * Converts an UTF-16 text to hex-codepoints.
         * @param text
         * The text to convert.
         *
         * @returns
         * The converted code-points.
         */
        public toCodePoint(text: string): string;
    }

    class TwEmoji
    {
        /**
         * Provides some utilities.
         */
        public readonly convert: {
        }

        /**
         * Replaces all emojis of the `text` with `<img>`-tags.
         *
         * @param text
         * The text to process.
         *
         * @returns
         * The html-representation of the `text`.
         */
        public parse(text: string): string;
    
        /**
         * Replaces all emojis of the `text` with `<img>`-tags.
         *
         * @param text
         * The text to process.
         *
         * @param callback
         * Receives the emoji-options and returns the icon-location.
         *
         * @returns
         * The html-representation of the `text`.
         */
        public parse(text: string, callback: SourceCallback): string;
    
        /**
         * Replaces all emojis of the `text` with `<img>`-tags.
         *
         * @param text
         * The text to process.
         *
         * @param options
         * Override-options and a callback for generating the icon-location.
         *
         * @returns
         * The html-representation of the `text`.
         */
        public parse(text: string, options: IOptions & { callback: SourceCallback }): string;
    
        /**
         * Replaces all emojis in the `element` with `<img>`-elements.
         *
         * @param element
         * The element to process.
         *
         * @param options
         * The options for the process.
         */
        public parse(element: HTMLElement, options?: IDOMOptions): void;
    }

    let twemoji: TwEmoji;

    export = twemoji;
}