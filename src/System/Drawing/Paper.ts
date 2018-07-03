import Margin from "./Margin";
import PaperFormat from "./PaperFormat";

/**
 * Represents a document-layout.
 */
export default class Paper
{
    /**
     * The margin.
     */
    private margin: Margin = new Margin();

    /**
     * The format of the paper.
     */
    private format: PaperFormat;

    /**
     * Initializes a new instance of the Layout class.
     */
    constructor()
    {
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

    /**
     * Returns an object which represents the 
     */
    public toJSON(): object
    {
        let pdfOptions = this.format.PDFOptions;

        return {
            Margin: this.Margin.toJSON(),
            Width: pdfOptions.width,
            Height: pdfOptions.height,
            Format: pdfOptions.format,
            Orientation: pdfOptions.landscape ? "Landspace" : "Portrait"
        };
    }
}