import { CancellationToken, Progress } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { Settings } from "../../Properties/Settings";
import { ConversionRunner } from "./ConversionRunner";
import { IProgressState } from "./IProgressState";
import { NoConversionTypeException } from "./NoConversionTypeException";
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
     * Initializes a new instance of the {@link ConversionTask `ConversionTask`} class.
     *
     * @param extension
     * The extension the task belongs to.
     */
    public constructor(extension: MarkdownConverterExtension)
    {
        super(extension);
        this.conversionRunner = new ConversionRunner(this.Extension);
    }

    /**
     * Gets a component for running a conversion.
     */
    public get ConversionRunner(): ConversionRunner
    {
        return this.conversionRunner;
    }

    /**
     * @inheritdoc
     *
     * @param progressReporter
     * A component for reporting progress.
     *
     * @param cancellationToken
     * A component for handling cancellation-requests.
     *
     * @param fileReporter
     * A component for reporting converted files.
     */
    public override async Execute(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        if (Settings.Default.ConversionType.length === 0)
        {
            throw new NoConversionTypeException();
        }
        else
        {
            return super.Execute(progressReporter, cancellationToken, fileReporter);
        }
    }
}
