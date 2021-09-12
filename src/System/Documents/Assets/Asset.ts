import { pathExistsSync } from "fs-extra";
import { isAbsolute } from "upath";
import { Uri } from "vscode";
import { FileException } from "../../IO/FileException";
import { AssetPathType } from "./AssetPathType";
import { InsertionType } from "./InsertionType";

/**
 * Represents an asset.
 */
export abstract class Asset
{
    /**
     * The url to the asset.
     */
    private url: string;

    /**
     * The type of the insertion of the asset.
     */
    private insertionType: InsertionType;

    /**
     * Initializes a new instance of the `Asset` class.
     *
     * @param path
     * The path to the asset.
     *
     * @param insertionType
     * The type of the insertion of the asset.
     */
    public constructor(path: string, insertionType?: InsertionType)
    {
        this.url = path;
        this.insertionType = insertionType ?? InsertionType.Default;
    }

    /**
     * Gets the url to the asset.
     */
    public get URL(): string
    {
        return this.url;
    }

    /**
     * Gets the path to the asset.
     */
    public get Path(): string
    {
        return this.PathType === AssetPathType.Link ? Uri.parse(this.URL).fsPath : this.URL;
    }

    /**
     * Gets the type of the path of the asset.
     */
    public get PathType(): AssetPathType
    {
        let schemeIncluded: boolean;

        try
        {
            Uri.parse(this.Path, true);
            schemeIncluded = !isAbsolute(this.Path);
        }
        catch
        {
            schemeIncluded = false;
        }

        if (schemeIncluded)
        {
            return AssetPathType.Link;
        }
        else if (isAbsolute(this.Path))
        {
            return AssetPathType.AbsolutePath;
        }
        else
        {
            return AssetPathType.RelativePath;
        }
    }

    /**
     * Gets or sets the type of the insertion of the asset.
     */
    public get InsertionType(): InsertionType
    {
        return this.insertionType;
    }

    /**
     * @inheritdoc
     */
    public set InsertionType(value: InsertionType)
    {
        this.insertionType = value;
    }

    /**
     * The source-code of this asset.
     *
     * @returns
     * A string representing this asset.
     */
    public ToString(): string
    {
        switch (this.GetInsertionType())
        {
            case InsertionType.Link:
                return this.GetReferenceSource();

            default:
                if (pathExistsSync(this.Path))
                {
                    return this.GetSource();
                }
                else
                {
                    throw new FileException(null, this.Path);
                }
        }
    }

    /**
     * @inheritdoc
     *
     * @returns
     * A string representing this asset.
     */
    public toString(): string
    {
        return this.ToString();
    }

    /**
     * Gets the type of the insertion of the asset.
     *
     * @returns
     * The type of the insertion of the asset.
     */
    protected GetInsertionType(): InsertionType
    {
        if (this.InsertionType !== InsertionType.Default)
        {
            return this.InsertionType;
        }
        else
        {
            switch (this.PathType)
            {
                case AssetPathType.Link:
                    return InsertionType.Link;
                default:
                    return InsertionType.Include;
            }
        }
    }

    /**
     * Gets the inline-source of the asset.
     *
     * @returns
     * The inline-source of the asset.
     */
    protected abstract GetSource(): string;

    /**
     * Gets the reference-expression of the asset.
     *
     * @returns
     * The reference-expression of the asset.
     */
    protected abstract GetReferenceSource(): string;
}
