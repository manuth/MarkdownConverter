import { EOL } from "os";
import { TextDocument, workspace } from "vscode";
import { MarkdownConverterExtension } from "../MarkdownConverterExtension";
import { ConvertAllTask } from "./ConvertAllTask";

/**
 * Represents a task for chaining multiple documents.
 */
export class ChainTask extends ConvertAllTask
{
    /**
     * Initializes a new instance of the `ChainTask` class.
     *
     * @param extension
     * The extension the task belongs to.
     */
    public constructor(extension: MarkdownConverterExtension)
    {
        super(extension);
    }

    /**
     * @inheritdoc
     */
    protected async ExecuteTask()
    {
        let document: TextDocument;
        let documents = await this.GetDocuments();
        let contents: string[];

        documents.sort(
            (x, y) =>
            {
                return x.uri.toString().toLowerCase().localeCompare(y.uri.toString().toLowerCase());
            });

        contents = documents.map((textDocument) => textDocument.getText());

        document = await workspace.openTextDocument(
            {
                language: "markdown",
                content: contents.join(EOL + EOL)
            });

        await this.ConversionRunner.Execute(document);
    }
}