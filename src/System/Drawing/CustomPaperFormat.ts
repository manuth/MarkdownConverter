import { PDFOptions } from "puppeteer";
import { PaperFormat } from "./PaperFormat";

/**
 * Represents a custom paper-format.
 */
export class CustomPaperFormat extends PaperFormat
{
    /**
     * The width.
     */
    private width: string;

    /**
     * The height.
     */
    private height: string;

    /**
     * Initializes a new instance of the `CustomPaperFormat` class.
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
     * Gets or sets the width.
     */
    public get Width(): string
    {
        return this.width;
    }

    public set Width(value: string)
    {
        this.width = value;
    }

    /**
     * Gets or sets the height.
     */
    public get Height(): string
    {
        return this.height;
    }

    public set Height(value: string)
    {
        this.height = value;
    }

    public get PDFOptions(): Partial<PDFOptions>
    {
        return {
            width: this.Width,
            height: this.Height
        };
    }
}