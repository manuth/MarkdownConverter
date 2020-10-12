declare module "es6-template-string"
{
    /**
     * Provides the functionality to process es6 template-strings.
     */
    interface IES6Template
    {
        /**
         * Renders an es6 template-string.
         *
         * @param template
         * The template to render.
         *
         * @param context
         * The variables to use.
         *
         * @returns
         * The rendered text.
         */
        render(template: string, context?: any): string;

        /**
         * Compiles a template.
         *
         * @param template
         * The template to render.
         *
         * @returns
         * The rendered text.
         */
        compile(template: string): ICompiledRenderer;

        /**
         * Renders an es6 template-string.
         *
         * @param template
         * The template to render.
         *
         * @param context
         * The variables to use.
         *
         * @returns
         * The rendered text.
         */
        (template: string, context?: any): string;
    }

    /**
     * Represents a compiled renderer.
     */
    type ICompiledRenderer =
        /**
         * Renders the compiled template.
         *
         * @param context
         * The variables to use.
         *
         * @returns
         * The rendered text.
         */
        (context: any) => string;

    /**
     * Provides the functionality to render es6 string-templates.
     */
    const template: IES6Template;
    export = template;
}
