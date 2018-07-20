import Margin from "./Margin";
import PaperFormat from "./PaperFormat";
import StandardizedPaperFormat from "./StandardizedPaperFormat";
import StandardizedFormatType from "./StandardizedFormatType";

/**
 * Represents a document-layout.
 */
export default class Paper
{
    /**
     * The margin.
     */
    private margin: Margin = new Margin("1cm");

    /**
     * The format of the paper.
     */
    private format: PaperFormat = new StandardizedPaperFormat();

    /**
     * Initializes a new instance of the Layout class.
     */
    constructor(format?: PaperFormat, margin?: Margin)
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
     * Gets or sets the margin.
     */
    public get Margin(): Margin
    {
        return this.margin;
    }
    public set Margin(value: Margin)
    {
        this.margin = value;
    }

    /**
     * Gets or sets the format of the paper.
     */
    public get Format(): PaperFormat
    {
        return this.format;
    }

    public set Format(value: PaperFormat)
    {
        this.format = value;
    }
}