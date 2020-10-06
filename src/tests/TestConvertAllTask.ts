import { TextDocument } from "vscode";
import { ConvertAllTask } from "../System/Tasks/ConvertAllTask";

/**
 * Provides an implementation of the `ConvertAllTask` for testing.
 */
export class TestConvertAllTask extends ConvertAllTask
{
    /**
     * @inheritdoc
     *
     * @returns
     * All markdown-documents of the workspace.
     */
    public async GetDocuments(): Promise<TextDocument[]>
    {
        return super.GetDocuments();
    }
}
