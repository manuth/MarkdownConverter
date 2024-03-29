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
     * Initializes a new instance of the {@link Renderable `Renderable`} class.
     *
     * @param content
     * The content of the renderable component.
     */
    public constructor(content = "")
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

    /**
     * @inheritdoc
     */
    public set Content(value: string)
    {
        this.content = value;
    }

    /**
     * Renders the component.
     *
     * @returns
     * The rendered text.
     */
    public Render(): Promise<string>
    {
        return this.RenderContent();
    }

    /**
     * Renders the component.
     *
     * @returns
     * The rendered text.
     */
    protected abstract RenderContent(): Promise<string>;
}
