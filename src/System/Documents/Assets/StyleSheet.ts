import { load } from "cheerio";
import { Asset } from "./Asset.js";
import { InsertionType } from "./InsertionType.js";

const styleTagName = "style";
const linkTagName = "link";

/**
 * Represents a stylesheet.
 */
export class StyleSheet extends Asset
{
    /**
     * Initializes a new instance of the {@link StyleSheet `StyleSheet`} class.
     *
     * @param path
     * The path to the asset.
     *
     * @param insertionType
     * The type of the insertion of the stylesheet.
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
        let document = load(
            load(`<${styleTagName}></${styleTagName}>`)(styleTagName).toArray()[0]);

        let styleTag = document(styleTagName);
        styleTag.text((await this.ReadFile()).toString());
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
        let document = load(
            load(`<${linkTagName} />`)(linkTagName).toArray()[0]);

        let linkTag = document(linkTagName);
        linkTag.attr("rel", "stylesheet");
        linkTag.attr("type", "text/css");
        linkTag.attr("href", this.URL);
        return `${document.html()}\n`;
    }
}
