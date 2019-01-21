import { PDFFormat, PDFOptions } from "puppeteer";
import { PaperFormat } from "./PaperFormat";
import { PaperOrientation } from "./PaperOrientation";
import { StandardizedFormatType } from "./StandardizedFormatType";

/**
 * Represents a standardized format of a paper.
 */
export class StandardizedPaperFormat extends PaperFormat
{
    /**
     * The format of the paper.
     */
    private format: StandardizedFormatType;

    /**
     * The orientation of the paper.
     */
    private orientation: PaperOrientation;

    /**
     * Initializes a new instance of the `StandardizedPaperFormat` class.
     *
     * @param format
     * The orientation of the paper.
     *
     * @param orientation
     * The orientation of the paper.
     */
    public constructor(format: StandardizedFormatType = StandardizedFormatType.A4, orientation: PaperOrientation = PaperOrientation.Portrait)
    {
        super();
        this.format = format;
        this.orientation = orientation;
    }

    /**
     * Gets or sets the format of the paper.
     */
    public get Format(): StandardizedFormatType
    {
        return this.format;
    }

    public set Format(value: StandardizedFormatType)
    {
        this.format = value;
    }

    /**
     * Gets or sets the orientation of the paper.
     */
    public get Orientation(): PaperOrientation
    {
        return this.orientation;
    }

    public set Orientation(value: PaperOrientation)
    {
        this.orientation = value;
    }

    public get PDFOptions(): Partial<PDFOptions>
    {
        return {
            format: StandardizedFormatType[this.Format] as PDFFormat,
            landscape: this.Orientation === PaperOrientation.Landscape
        };
    }
}