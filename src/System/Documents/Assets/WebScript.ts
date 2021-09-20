import { load } from "cheerio";
import { Asset } from "./Asset";
import { InsertionType } from "./InsertionType";

const scriptTagName = "script";

/**
 * Represents a web-script.
 */
export class WebScript extends Asset
{
    /**
     * Initializes a new instance of the {@link WebScript `WebScript`} class.
     *
     * @param path
     * The path to the asset.
     *
     * @param insertionType
     * The type of the insertion of the script.
     *
     * @param docRoot
     * The path to the root of the document of this asset.
     */
    public constructor(path: string, insertionType?: InsertionType, docRoot?: string)
    {
        super(path, insertionType, docRoot);
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The inline-source of the asset.
     */
    protected async GetSource(): Promise<string>
    {
        let document = load(`<${scriptTagName}></${scriptTagName}>`);
        document(scriptTagName).text(await this.ReadFile());
        return `${document.html()}\n`;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The reference-expression of the asset.
     */
    protected async GetReferenceSource(): Promise<string>
    {
        return `<script async src="${this.URL}" charset="UTF-8"></script>\n`;
    }
}
