import dedent = require("dedent");
import { readFileSync } from "fs-extra";
import { Asset } from "./Asset";

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
            <style>${readFileSync(this.Path).toString()}</style>`) + "\n";
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The reference-expression of the asset.
     */
    protected GetReferenceSource(): string
    {
        return `<link rel="stylesheet" type="text/css" href="${this.Path}" />\n`;
    }
}
