import { dirname, extname } from "node:path";
import { Document } from "../Document.js";
import { Asset } from "./Asset.js";
import { AssetURLType } from "./AssetURLType.js";
import { InsertionType } from "./InsertionType.js";

/**
 * Represents the source of a picture.
 */
export class PictureSource extends Asset
{
    /**
     * The document of the picture.
     */
    private document: Document;

    /**
     * Initializes a new instance of the {@link PictureSource `PictureSource`} class.
     *
     * @param document
     * The document of the asset.
     *
     * @param path
     * The path to the asset.
     *
     * @param insertionType
     * The type of the insertion of the picture.
     */
    public constructor(document: Document, path: string, insertionType?: InsertionType)
    {
        super(path, insertionType);
        this.document = document;
    }

    /**
     * Gets the document of the picture.
     */
    public get Document(): Document
    {
        return this.document;
    }

    /**
     * @inheritdoc
     */
    protected override get DocRoot(): string
    {
        return this.Document.FileName ? dirname(this.Document.FileName) : null;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The type of the insertion of the picture.
     */
    protected override GetInsertionType(): InsertionType
    {
        if (this.InsertionType === InsertionType.Default)
        {
            return InsertionType.Link;
        }
        else
        {
            return super.GetInsertionType();
        }
    }

    /**
     * Gets the inline-source of the picture.
     *
     * @returns
     * The inline-source of the picture.
     */
    protected async GetSource(): Promise<string>
    {
        if (this.URLType === AssetURLType.RelativePath && !this.DocRoot)
        {
            return this.GetReferenceSource();
        }
        else
        {
            let fileExtension = extname(this.URL).slice(1);
            let typeName: string;

            if (fileExtension === "jpg")
            {
                typeName = "jpeg";
            }
            else if (fileExtension === "svg")
            {
                typeName = fileExtension + "+xml";
            }
            else
            {
                typeName = fileExtension;
            }

            return `data:image/${typeName};base64,${(await this.ReadFile()).toString("base64")}`;
        }
    }

    /**
     * Gets the reference-expression of the picture.
     *
     * @returns
     * The reference-expression of the picture.
     */
    protected async GetReferenceSource(): Promise<string>
    {
        return this.URL;
    }
}
