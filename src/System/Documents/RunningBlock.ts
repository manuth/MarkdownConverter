import { Document } from "./Document";
import { DocumentFragment } from "./DocumentFragment";

/**
 * Represents a header or a footer of a document.
 */
export class RunningBlock extends DocumentFragment
{
    /**
     * The content of the left part of the running block.
     */
    private left = new DocumentFragment(this.Document);

    /**
     * The content of the right part of the running block.
     */
    private right = new DocumentFragment(this.Document);

    /**
     * The content of the center part of the running block.
     */
    private center = new DocumentFragment(this.Document);

    /**
     * Initializes a new instance of the `RunningBlock` class.
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
        return this.left.Content;
    }

    /**
     * @inheritdoc
     */
    public set Left(value: string)
    {
        this.left.Content = value;
    }

    /**
     * Gets or sets the content of the right part of the running block.
     */
    public get Right(): string
    {
        return this.right.Content;
    }

    /**
     * @inheritdoc
     */
    public set Right(value: string)
    {
        this.right.Content = value;
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
     * @inheritdoc
     *
     * @param content
     * The content to render.
     *
     * @param view
     * The attributes to use for rendering.
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
                Left: await this.left.Render(),
                Right: await this.right.Render(),
                Center: await this.center.Render()
            });
    }
}
