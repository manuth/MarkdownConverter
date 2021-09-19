import { CancellationToken, Progress, TextDocument } from "vscode";
import { IConvertedFile } from "../Conversion/IConvertedFile";
import { ConvertAllTask } from "../System/Tasks/ConvertAllTask";
import { IProgressState } from "../System/Tasks/IProgressState";

/**
 * Provides an implementation of the {@link ConvertAllTask `ConvertAllTask`} for testing.
 */
export class TestConvertAllTask extends ConvertAllTask
{
    /**
     * @inheritdoc
     *
     * @returns
     * All markdown-documents of the workspace.
     */
    public override async GetDocuments(): Promise<TextDocument[]>
    {
        return super.GetDocuments();
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
    public override async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        return super.ExecuteTask(progressReporter, cancellationToken, fileReporter);
    }
}
