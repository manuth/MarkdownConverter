import { Extension } from "../extension";
import { ConversionRunner } from "./ConversionRunner";
import { PuppeteerTask } from "./PuppeteerTask";

/**
 * Represents a task which is able to convert markdown-files.
 */
export abstract class ConversionTask extends PuppeteerTask
{
    /**
     * A component for running a conversion.
     */
    private conversionRunner: ConversionRunner;

    /**
     * Initializes a new instance of the `ConversionTask` class.
     *
     * @param extension
     * The extension the task belongs to.
     */
    public constructor(extension: Extension)
    {
        super(extension);
        this.conversionRunner = new ConversionRunner(this.Extension);
    }

    /**
     * Gets a component for running a conversion.
     */
    public get ConversionRunner()
    {
        return this.conversionRunner;
    }
}