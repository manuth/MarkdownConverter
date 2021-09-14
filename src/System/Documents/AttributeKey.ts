/**
 * Represents a key of a document-attribute.
 */
export enum AttributeKey
{
    /**
     * Indicates the title of the document.
     */
    Title = "Title",

    /**
     * Indicates the author of the document.
     */
    Author = "Author",

    /**
     * Indicates the default date-format of the document.
     */
    DateFormat = "DateFormat",

    /**
     * Indicates the date of the creation of the document.
     */
    CreationDate = "CreationDate",

    /**
     * Indicates the date of the last change of the document.
     */
    ChangeDate = "ChangeDate",

    /**
     * Indicates the current date.
     */
    CurrentDate = "CurrentDate",

    /**
     * Indicates the template for the metadata-section.
     */
    MetaTemplate = "MetaTemplate",

    /**
     * Indicates the template of the header.
     */
    HeaderTemplate = "HeaderTemplate",

    /**
     * Indicates the template of the footer.
     */
    FooterTemplate = "FooterTemplate"
}
