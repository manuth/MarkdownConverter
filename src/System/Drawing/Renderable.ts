/**
 * Represents a renderable component.
 */
export abstract class Renderable
{
    /**
     * The content of the component.
     */
    private content: string;

    /**
     * Initializes a new instance of the `Renderable` class.
     */
    public constructor(content: string = "")
    {
        this.content = content;
    }

    /**
     * Gets or sets the content of the component.
     */
    public get Content(): string
    {
        return this.content;
    }

    public set Content(value: string)
    {
        this.content = value;
    }

    /**
     * Renders a text using a custom renderer.
     * 
     * @param renderer
     * The renderer to render the text.
     * 
     * @param text
     * The text to render.
     */
    protected async RenderTextBy(renderer: Renderable, text: string): Promise<string>
    {
        return await renderer.RenderText(text);
    }

    /**
     * Renders a text.
     * 
     * @param text
     * The text to render.
     */
    protected abstract async RenderText(text: string): Promise<string>;

    /**
     * Renders the component.
     */
    public async Render(): Promise<string>
    {
        return await this.RenderText(this.Content);
    }
}