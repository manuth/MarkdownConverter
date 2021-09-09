import { PDFFormat, PDFOptions } from "puppeteer-core";
import { PageFormat } from "./PageFormat";
import { PageOrientation } from "./PageOrientation";
import { StandardizedFormatType } from "./StandardizedFormatType";

/**
 * Represents a standardized format of a page.
 */
export class StandardizedPageFormat extends PageFormat
{
    /**
     * The format of the page.
     */
    private format: StandardizedFormatType;

    /**
     * The orientation of the paper.
     */
    private orientation: PageOrientation;

    /**
     * Initializes a new instance of the `StandardizedPageFormat` class.
     *
     * @param format
     * The orientation of the page.
     *
     * @param orientation
     * The orientation of the page.
     */
    public constructor(format: StandardizedFormatType = StandardizedFormatType.A4, orientation: PageOrientation = PageOrientation.Portrait)
    {
        super();
        this.format = format;
        this.orientation = orientation;
    }

    /**
     * Gets or sets the format of the page.
     */
    public get Format(): StandardizedFormatType
    {
        return this.format;
    }

    /**
     * @inheritdoc
     */
    public set Format(value: StandardizedFormatType)
    {
        this.format = value;
    }

    /**
     * Gets or sets the orientation of the page.
     */
    public get Orientation(): PageOrientation
    {
        return this.orientation;
    }

    /**
     * @inheritdoc
     */
    public set Orientation(value: PageOrientation)
    {
        this.orientation = value;
    }

    /**
     * @inheritdoc
     */
    public get PDFOptions(): Partial<PDFOptions>
    {
        return {
            format: StandardizedFormatType[this.Format] as PDFFormat,
            landscape: this.Orientation === PageOrientation.Landscape
        };
    }
}
