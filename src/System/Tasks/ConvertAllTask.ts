import format = require("string-template");
import { CancellationToken, extensions, Progress, TextDocument, workspace } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { MarkdownFileNotFoundException } from "../../MarkdownFileNotFoundException";
import { Resources } from "../../Properties/Resources";
import { NoWorkspaceFolderException } from "../NoWorkspaceFolderException";
import { ConversionTask } from "./ConversionTask";
import { IProgressState } from "./IProgressState";

/**
 * Represents a task for converting all documents in the workspace.
 */
export class ConvertAllTask extends ConversionTask
{
    /**
     * Initializes a new instance of the `ConvertAllTask` class.
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
        return Resources.Resources.Get<string>("TaskTitle.ConvertAll");
    }

    /**
     * @inheritdoc
     */
    public get Cancellable(): boolean
    {
        return true;
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
    public async Execute(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        if ((await this.GetDocuments()).length === 0)
        {
            throw new MarkdownFileNotFoundException();
        }
        else
        {
            return super.Execute(progressReporter, cancellationToken, fileReporter);
        }
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
        let documents: TextDocument[];
        let totalCount: number;
        let progress = 0;

        progressReporter?.report(
            {
                message: Resources.Resources.Get("Progress.SearchDocuments")
            });

        documents = await this.GetDocuments();
        totalCount = documents.length;

        progressReporter?.report(
            {
                message: format(Resources.Resources.Get("Progress.DocumentsFound"), totalCount)
            });

        for (let i = 0; i < documents.length && !(cancellationToken.isCancellationRequested ?? false); i++)
        {
            let document = documents[i];
            let progressState: IProgressState = {};
            let newProgress = ((i + 1) / totalCount) * 100;

            progressState = {
                message: format(Resources.Resources.Get("Progress.CollectionStep"), i + 1, totalCount)
            };

            if (newProgress > progress)
            {
                progressState.increment = newProgress - progress;
                progress = newProgress;
            }

            await this.ConversionRunner.Execute(document, null, cancellationToken, fileReporter);
            progressReporter?.report(progressState);
        }
    }

    /**
     * Gets all markdown-documents of the workspace.
     *
     * @returns
     * All markdown-documents of the workspace.
     */
    protected async GetDocuments(): Promise<TextDocument[]>
    {
        let documents: TextDocument[] = [];
        let filePatterns: string[] = [];

        if ((workspace.workspaceFolders || []).length > 0)
        {
            for (let extension of extensions.all)
            {
                if (extension.packageJSON.contributes?.languages)
                {
                    for (let language of extension.packageJSON.contributes.languages)
                    {
                        if (language.id === "markdown")
                        {
                            for (let fileExtension of language.extensions)
                            {
                                filePatterns.push(`**/*${fileExtension}`);
                            }
                        }
                    }
                }
            }

            {
                let fileAssociations = workspace.getConfiguration().get<{ [key: string]: string }>("files.associations");

                for (let fileAssociation in fileAssociations)
                {
                    if (fileAssociations[fileAssociation] === "markdown")
                    {
                        filePatterns.push(`**/${fileAssociation}`);
                    }
                }
            }

            for (let filePattern of filePatterns)
            {
                for (let file of await workspace.findFiles(filePattern))
                {
                    let document = await workspace.openTextDocument(file);

                    if (document.languageId === "markdown")
                    {
                        documents.push(document);
                    }
                }
            }

            return documents;
        }
        else
        {
            throw new NoWorkspaceFolderException();
        }
    }
}
