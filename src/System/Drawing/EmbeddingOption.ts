/**
 * Represents a way to embed stylesheets.
 */
export enum EmbeddingOption
{
    /**
     * Embedding all stylesheets.
     */
    All,
    /**
     * Embedding local stylesheets.
     */
    Local,
    /**
     * Embedding non-local stylesheets.
     */
    Web,
    /**
     * Embedding no stylesheets.
     */
    None
}