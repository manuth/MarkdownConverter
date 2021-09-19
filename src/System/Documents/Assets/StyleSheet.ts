import dedent = require("dedent");
import { Asset } from "./Asset";
import { InsertionType } from "./InsertionType";

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
        return dedent(`
            <style>${await this.ReadFile()}</style>`) + "\n";
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The reference-expression of the asset.
     */
    protected async GetReferenceSource(): Promise<string>
    {
        return `<link rel="stylesheet" type="text/css" href="${this.URL}" />\n`;
    }
}
