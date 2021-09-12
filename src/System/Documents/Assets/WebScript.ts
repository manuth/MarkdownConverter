import dedent = require("dedent");
import { readFileSync } from "fs-extra";
import { Asset } from "./Asset";
import { InsertionType } from "./InsertionType";

/**
 * Represents a web-script.
 */
export class WebScript extends Asset
{
    /**
     * Initializes a new instance of the `WebScript` class.
     *
     * @param path
     * The path to the asset.
     *
     * @param insertionType
     * The type of the insertion of the script.
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
    protected GetSource(): string
    {
        return dedent(`
            <script>${readFileSync(this.Path).toString()}</script>`) + "\n";
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The reference-expression of the asset.
     */
    protected GetReferenceSource(): string
    {
        return `<script async="" src="${this.URL}" charset="UTF-8"></script>\n`;
    }
}
