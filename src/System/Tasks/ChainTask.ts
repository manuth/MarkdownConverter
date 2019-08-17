import { EOL } from "os";
import Format = require("string-template");
import { Progress, TextDocument, workspace } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { Resources } from "../../Properties/Resources";
import { ConvertAllTask } from "./ConvertAllTask";
import { IProgressState } from "./IProgressState";

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
    public get Title()
    {
        return Resources.Resources.Get<string>("TaskTitle.Chain");
    }

    /**
     * @inheritdoc
     */
    protected async ExecuteTask(progressReporter: Progress<IProgressState>, fileReporter?: Progress<IConvertedFile>)
    {
        let document: TextDocument;
        let documents: TextDocument[] = [];
        let contents: string[];

        progressReporter.report(
            {
                message: Resources.Resources.Get("Progress.SearchDocuments")
            });

        documents = await this.GetDocuments();

        progressReporter.report(
            {
                message: Format(Resources.Resources.Get("Progress.DocumentsFound"), documents.length)
            });

        progressReporter.report(
            {
                message: Resources.Resources.Get("Progress.ChainDocuments")
            });

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

        await this.ConversionRunner.Execute(document, progressReporter, fileReporter);
    }
}