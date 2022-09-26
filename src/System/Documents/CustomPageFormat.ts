import { PDFOptions } from "puppeteer-core";
import { PageFormat } from "./PageFormat.js";

/**
 * Represents a custom page-format.
 */
export class CustomPageFormat extends PageFormat
{
    /**
     * The width of the page.
     */
    private width: string;

    /**
     * The height of the page.
     */
    private height: string;

    /**
     * Initializes a new instance of the {@link CustomPageFormat `CustomPageFormat`} class.
     *
     * @param width
     * The width.
     *
     * @param height
     * The height.
     */
    public constructor(width: string, height: string)
    {
        super();
        this.width = width;
        this.height = height;
    }

    /**
     * Gets or sets the width of the page.
     */
    public get Width(): string
    {
        return this.width;
    }

    /**
     * @inheritdoc
     */
    public set Width(value: string)
    {
        this.width = value;
    }

    /**
     * Gets or sets the height of the page.
     */
    public get Height(): string
    {
        return this.height;
    }

    /**
     * @inheritdoc
     */
    public set Height(value: string)
    {
        this.height = value;
    }

    /**
     * @inheritdoc
     */
    public get PDFOptions(): Partial<PDFOptions>
    {
        return {
            width: this.Width,
            height: this.Height
        };
    }
}
