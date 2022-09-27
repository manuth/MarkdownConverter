import { createRequire } from "node:module";
import { EOL } from "node:os";
import fm from "front-matter";
import fs from "fs-extra";
import format from "string-template";
import path from "upath";
import vscode, { CancellationToken, Progress, TextDocument } from "vscode";
import { Constants } from "../../Constants.js";
import { IConvertedFile } from "../../Conversion/IConvertedFile.js";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension.js";
import { Resources } from "../../Properties/Resources.js";
import { ConvertAllTask } from "./ConvertAllTask.js";
import { IProgressState } from "./IProgressState.js";

const { renameSync } = fs;
const { join, parse } = path;
const { commands, window, workspace } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Represents a task for chaining multiple documents.
 */
export class ChainTask extends ConvertAllTask
{
    /**
     * Initializes a new instance of the {@link ChainTask `ChainTask`} class.
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
    public override get Title(): string
    {
        return Resources.Resources.Get<string>("TaskTitle.Chain");
    }

    /**
     * @inheritdoc
     */
    public override get Cancellable(): boolean
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
    protected override async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        let document: TextDocument;
        let documentName: string = null;
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
                content: contents.join(`${EOL}${EOL}<div style="page-break-after: always"></div>${EOL}${EOL}`)
            });

        await this.ConversionRunner.Execute(
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
                    fileReporter?.report(file);
                }
            });

        await window.showTextDocument(document);
        await commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
    }
}
