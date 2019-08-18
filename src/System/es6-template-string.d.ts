declare module "es6-template-string" {
    /**
     * Provides the functionality to process es6 template-strings.
     */
    interface ES6Template
    {
        /**
         * Renders an es6 template-string.
         *
         * @param template
         * The template to render.
         *
         * @param context
         * The variables to use.
         */
        (template: string, context?: object): string;
    
        /**
         * Renders an es6 template-string.
         *
         * @param template
         * The template to render.
         *
         * @param context
         * The variables to use.
         */
        render(template: string, context?: object): string;
    
        /**
         * Compiles a template.
         *
         * @param template
         * The template to render.
         */
        compile(template: string): CompiledRenderer;
    }
    
    /**
     * Represents a compiled renderer.
     */
    interface CompiledRenderer
    {
        /**
         * Renders the compiled template.
         *
         * @param context
         * The variables to use.
         */
        (context: object): string;
    }
    
    /**
     * Provides the functionality to render es6 string-templates.
     */
    var template: ES6Template;
    export = template;
}