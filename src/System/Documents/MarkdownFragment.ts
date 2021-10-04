import { Document } from "./Document";
import { DocumentFragment } from "./DocumentFragment";

/**
 * Represents a fragment of a document with markdown-support.
 */
export class MarkdownFragment extends DocumentFragment
{
    /**
     * Initializes a new instance of the {@link MarkdownFragment `MarkdownFragment`} class.
     *
     * @param document
     * The document this fragment belongs to.
     */
    public constructor(document: Document)
    {
        super(document);
    }

    /**
     * Renders the component.
     *
     * @returns
     * The rendered text.
     */
    protected override async RenderContent(): Promise<string>
    {
        return this.Document.Parser.render(await super.RenderContent());
    }
}
