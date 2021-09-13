import dedent = require("dedent");
import { readFileSync } from "fs-extra";
import { Asset } from "./Asset";
import { InsertionType } from "./InsertionType";

/**
 * Represents a stylesheet.
 */
export class StyleSheet extends Asset
{
    /**
     * Initializes a new instance of the `StyleSheet` class.
     *
     * @param path
     * The path to the asset.
     *
     * @param insertionType
     * The type of the insertion of the stylesheet.
     */
    public constructor(path: string, insertionType?: InsertionType)
    {
        super(path, insertionType);
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
            <style>${readFileSync(this.Path).toString()}</style>`) + "\n";
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
