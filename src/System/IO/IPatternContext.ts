/**
 * Represents a context for resolving patterns.
 */
export interface IPatternContext
{
    /**
     * The name of the document-file.
     */
    filename: string;

    /**
     * The name of the document-file without extension.
     */
    basename: string;

    /**
     * The name of the destination-type.
     */
    extension: string;

    /**
     * The name of the directory of the document.
     */
    dirname: string;

    /**
     * The path to the workspace-folder containing the document or the directory containing the document.
     */
    workspaceFolder?: string;
}
