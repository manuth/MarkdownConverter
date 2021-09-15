import { Document } from "./Document";
import { DocumentFragment } from "./DocumentFragment";

/**
 * Represents a header or a footer of a document.
 */
export class RunningBlock extends DocumentFragment
{
    /**
     * The left part of the running block.
     */
    private left = new DocumentFragment(this.Document);

    /**
     * The right part of the running block.
     */
    private right = new DocumentFragment(this.Document);

    /**
     * The center part of the running block.
     */
    private center = new DocumentFragment(this.Document);

    /**
     * Initializes a new instance of the {@link RunningBlock `RunningBlock`} class.
     *
     * @param document
     * The document this fragment belongs to.
     */
    public constructor(document: Document)
    {
        super(document);
    }

    /**
     * Gets or sets the content of the left part of the running block.
     */
    public get Left(): string
    {
        return this.LeftSection.Content;
    }

    /**
     * @inheritdoc
     */
    public set Left(value: string)
    {
        this.LeftSection.Content = value;
    }

    /**
     * Gets or sets the content of the right part of the running block.
     */
    public get Right(): string
    {
        return this.RightSection.Content;
    }

    /**
     * @inheritdoc
     */
    public set Right(value: string)
    {
        this.RightSection.Content = value;
    }

    /**
     * Gets or sets the content of the center part of the running block.
     */
    public get Center(): string
    {
        return this.center.Content;
    }

    /**
     * @inheritdoc
     */
    public set Center(value: string)
    {
        this.center.Content = value;
    }

    /**
     * Gets the content of the left part of the running block.
     */
    protected get LeftSection(): DocumentFragment
    {
        return this.left;
    }

    /**
     * Gets the content of the right part of the running block.
     */
    protected get RightSection(): DocumentFragment
    {
        return this.right;
    }

    /**
     * Gets the center part of the running block.
     */
    protected get CenterSection(): DocumentFragment
    {
        return this.center;
    }

    /**
     * @inheritdoc
     *
     * @param content
     * The content to render.
     *
     * @param view
     * The attributes to use for rendering the {@link content `content`}.
     *
     * @returns
     * The rendered representation of the specified {@link content `content`}.
     */
    protected override async RenderTemplate(content: string, view: Record<string, unknown>): Promise<string>
    {
        return super.RenderTemplate(
            content,
            {
                ...view,
                Left: await this.LeftSection.Render(),
                Right: await this.RightSection.Render(),
                Center: await this.CenterSection.Render()
            });
    }
}
