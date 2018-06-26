/**
 * Represents a way to embed stylesheets.
 */
enum EmbeddingOption
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

export default EmbeddingOption;