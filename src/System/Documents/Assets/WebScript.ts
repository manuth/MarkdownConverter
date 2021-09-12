import dedent = require("dedent");
import { readFileSync } from "fs-extra";
import { Asset } from "./Asset";

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
     */
    public constructor(path: string)
    {
        super(path);
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
        return `<script async="" src="${this.Path}" charset="UTF-8"></script>\n`;
    }
}
