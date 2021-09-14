import { readFile } from "fs-extra";
import getUri = require("get-uri");
import { isAbsolute } from "upath";
import { Uri } from "vscode";
import { AssetURLType } from "./AssetURLType";
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
     * Initializes a new instance of the {@link Asset `Asset`} class.
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
     * Gets the type of the url of the asset.
     */
    public get URLType(): AssetURLType
    {
        let schemeIncluded: boolean;

        try
        {
            Uri.parse(this.URL, true);
            schemeIncluded = !isAbsolute(this.URL);
        }
        catch
        {
            schemeIncluded = false;
        }

        if (schemeIncluded)
        {
            return AssetURLType.Link;
        }
        else if (isAbsolute(this.URL))
        {
            return AssetURLType.AbsolutePath;
        }
        else
        {
            return AssetURLType.RelativePath;
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
     * Renders the asset.
     *
     * @returns
     * A string representing this asset.
     */
    public async Render(): Promise<string>
    {
        switch (this.GetInsertionType())
        {
            case InsertionType.Link:
                return this.GetReferenceSource();
            default:
                return this.GetSource();
        }
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
            switch (this.URLType)
            {
                case AssetURLType.Link:
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
    protected abstract GetSource(): Promise<string>;

    /**
     * Gets the reference-expression of the asset.
     *
     * @returns
     * The reference-expression of the asset.
     */
    protected abstract GetReferenceSource(): Promise<string>;

    /**
     * Reads the content from the asset.
     *
     * @returns
     * The content of the asset.
     */
    protected async ReadFile(): Promise<string>
    {
        if (this.URLType === AssetURLType.Link)
        {
            return new Promise(
                (resolve, reject) =>
                {
                    getUri(
                        this.URL,
                        (error, result) =>
                        {
                            if (error)
                            {
                                reject(error);
                            }
                            else
                            {
                                let content = "";

                                result.on(
                                    "error",
                                    (error) =>
                                    {
                                        reject(error);
                                    });

                                result.on(
                                    "data",
                                    (data) =>
                                    {
                                        content += `${data}`;
                                    });

                                result.on(
                                    "end",
                                    () =>
                                    {
                                        resolve(content);
                                    });
                            }
                        });
                });
        }
        else
        {
            return (await readFile(this.URL)).toString();
        }
    }
}
