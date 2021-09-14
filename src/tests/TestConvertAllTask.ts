import { TextDocument } from "vscode";
import { ConvertAllTask } from "../System/Tasks/ConvertAllTask";

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
     */
    public override async ExecuteTask(): Promise<void>
    {
        return super.ExecuteTask();
    }
}
