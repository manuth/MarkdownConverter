/**
 * Represents a location to save files to.
 */
export enum DestinationOrigin
{
    /**
     * Indicates either the workspace-root if a workspace is opened; otherwise the name of the directory of the document will be used.
     */
    WorkspaceRoot,

    /**
     * Indicates the directory of the document-file.
     */
    DocumentFile
}