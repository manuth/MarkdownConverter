import { createRequire } from "node:module";
import { resolve } from "node:path";
import fs from "fs-extra";
import getUri from "get-uri";
import path from "upath";
import vscode from "vscode";
import { Constants } from "../../../Constants.js";
import { AssetURLType } from "./AssetURLType.js";
import { InsertionType } from "./InsertionType.js";

const { readFile } = fs;
const { isAbsolute } = path;
const { Uri } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Represents an asset.
 */
export abstract class Asset
{
    /**
     * The path to the root of the document of this asset.
     */
    private docRoot: string = null;

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
     *
     * @param docRoot
     * The path to the root of the document of this asset.
     */
    public constructor(path: string, insertionType?: InsertionType, docRoot?: string)
    {
        this.url = path;
        this.insertionType = insertionType ?? InsertionType.Default;
        this.docRoot = docRoot;
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
     * Gets the path to the root of the document of this asset.
     */
    protected get DocRoot(): string
    {
        return this.docRoot;
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
    protected async ReadFile(): Promise<Buffer>
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
                                let buffers: Buffer[] = [];

                                result.on(
                                    "data",
                                    (chunk) =>
                                    {
                                        buffers.push(Buffer.from(chunk));
                                    });

                                result.on(
                                    "error",
                                    (error) =>
                                    {
                                        reject(error);
                                    });

                                result.on(
                                    "end",
                                    () =>
                                    {
                                        resolve(Buffer.concat(buffers));
                                    });
                            }
                        });
                });
        }
        else
        {
            return readFile(resolve(this.DocRoot ?? "", this.URL));
        }
    }
}
