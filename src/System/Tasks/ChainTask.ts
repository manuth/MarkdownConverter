import { EOL } from "os";
import fm = require("front-matter");
import { renameSync } from "fs-extra";
import format = require("string-template");
import { join, parse } from "upath";
import { CancellationToken, Progress, TextDocument, window, workspace } from "vscode";
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
    public get Title(): string
    {
        return Resources.Resources.Get<string>("TaskTitle.Chain");
    }

    /**
     * @inheritdoc
     */
    public get Cancellable(): boolean
    {
        return false;
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
    protected async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        let document: TextDocument;
        let documentName: string;
        let documents: TextDocument[] = [];
        let contents: string[];

        progressReporter?.report(
            {
                message: Resources.Resources.Get("Progress.SearchDocuments")
            });

        documents = await this.GetDocuments();

        progressReporter?.report(
            {
                message: format(Resources.Resources.Get("Progress.DocumentsFound"), documents.length)
            });

        while (!documentName)
        {
            documentName = await window.showInputBox(
                {
                    ignoreFocusOut: true,
                    prompt: Resources.Resources.Get("DocumentName"),
                    placeHolder: Resources.Resources.Get("DocumentNameExample")
                });
        }

        progressReporter?.report(
            {
                message: Resources.Resources.Get("Progress.ChainDocuments")
            });

        documents.sort(
            (x, y) =>
            {
                return x.uri.toString().toLowerCase().localeCompare(y.uri.toString().toLowerCase());
            });

        contents = documents.map((textDocument) => (fm as any)(textDocument.getText()).body);

        document = await workspace.openTextDocument(
            {
                language: "markdown",
                content: contents.join(EOL + EOL)
            });

        return this.ConversionRunner.Execute(
            document,
            progressReporter,
            cancellationToken,
            {
                report(file)
                {
                    let parsedPath = parse(file.FileName);
                    let newFileName = join(parsedPath.dir, `${documentName}${parsedPath.ext}`);
                    renameSync(file.FileName, newFileName);
                    file.FileName = newFileName;
                    fileReporter.report(file);
                }
            });
    }
}
