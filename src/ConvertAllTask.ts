import { extensions, TextDocument, workspace } from "vscode";
import { ConversionTask } from "./ConversionTask";
import { Extension } from "./extension";

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
    public constructor(extension: Extension)
    {
        super(extension);
    }

    /**
     * @inheritdoc
     */
    protected async ExecuteTask()
    {
        for (let document of await this.GetDocuments())
        {
            await this.Convert(document);
        }
    }

    /**
     * Gets all markdown-documents of the workspace.
     */
    protected async GetDocuments(): Promise<TextDocument[]>
    {
        let documents: TextDocument[] = [];
        let filePatterns: string[] = [];

        for (let extension of extensions.all)
        {
            if (
                extension.packageJSON.contributes &&
                extension.packageJSON.contributes.languages)
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
}