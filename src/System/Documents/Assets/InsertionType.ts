/**
 * Represents the type of an asset-insertion.
 */
export enum InsertionType
{
    /**
     * Indicates the default behavior.
     */
    Default,

    /**
     * Indicates the insertion of a link referring to the asset.
     */
    Link,

    /**
     * Indicates the insertion of the full source of the asset.
     */
    Include
}
