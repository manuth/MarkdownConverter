import { pathExistsSync } from "fs-extra";
import { isAbsolute } from "upath";
import { Uri } from "vscode";
import { FileException } from "../../IO/FileException";
import { AssetPathType } from "./AssetPathType";

/**
 * Represents an asset.
 */
export abstract class Asset
{
    /**
     * The path to the asset.
     */
    private path: string;

    /**
     * Initializes a new instance of the `Asset` class.
     *
     * @param path
     * The path to the asset.
     */
    public constructor(path: string)
    {
        this.path = path;
    }

    /**
     * Gets the path to the asset.
     */
    public get Path(): string
    {
        return this.path;
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
            schemeIncluded = true;
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
     * The source-code of this asset.
     *
     * @returns
     * A string representing this asset.
     */
    public ToString(): string
    {
        switch (this.PathType)
        {
            case AssetPathType.Link:
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
