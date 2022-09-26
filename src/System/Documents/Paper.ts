import { Margin } from "./Margin.js";
import { PageFormat } from "./PageFormat.js";
import { StandardizedPageFormat } from "./StandardizedPageFormat.js";

/**
 * Represents a document-layout.
 */
export class Paper
{
    /**
     * The margin of the paper.
     */
    private margin: Margin = new Margin("1cm");

    /**
     * The format of the paper.
     */
    private format: PageFormat = new StandardizedPageFormat();

    /**
     * Initializes a new instance of the {@link Paper `Paper`} class.
     *
     * @param format
     * Either the format of the paper or `null` to use the default format.
     *
     * @param margin
     * Either the margin of the paper or `null` to use a default margin.
     */
    public constructor(format?: PageFormat, margin?: Margin)
    {
        if (format)
        {
            this.format = format;
        }

        if (margin)
        {
            this.margin = margin;
        }
    }

    /**
     * Gets or sets the margin of the paper.
     */
    public get Margin(): Margin
    {
        return this.margin;
    }

    /**
     * @inheritdoc
     */
    public set Margin(value: Margin)
    {
        this.margin = value;
    }

    /**
     * Gets or sets the format of the paper.
     */
    public get Format(): PageFormat
    {
        return this.format;
    }

    /**
     * @inheritdoc
     */
    public set Format(value: PageFormat)
    {
        this.format = value;
    }
}
