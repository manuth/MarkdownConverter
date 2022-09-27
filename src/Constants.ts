import { pathToFileURL } from "url";
import { pkgUpSync } from "pkg-up";
import puppeteer, { PuppeteerNode } from "puppeteer-core";
import path from "upath";
import { InternalConstants } from "./InternalConstants.cjs";

const { dirname } = path;

/**
 * Provides constants for the extension.
 */
export class Constants
{
    /**
     * The path to the root of this package.
     */
    private static packageDirectory: string = null;

    /**
     * The url to the root of this package.
     */
    private static packageURL: URL = null;

    /**
     * A puppeteer instance.
     */
    private static puppeteer: PuppeteerNode = null;

    /**
     * Gets the path to the root of this package.
     */
    public static get PackageDirectory(): string
    {
        if (this.packageDirectory === null)
        {
            this.packageDirectory = dirname(pkgUpSync(
                {
                    cwd: InternalConstants.LibraryDirectory
                }));
        }

        return this.packageDirectory;
    }

    /**
     * Gets the url to the root of this package.
     */
    public static get PackageURL(): URL
    {
        if (this.packageURL === null)
        {
            this.packageURL = pathToFileURL(this.PackageDirectory);
        }

        return this.packageURL;
    }

    /**
     * Gets a puppeteer instance.
     */
    public static get Puppeteer(): PuppeteerNode
    {
        if (this.puppeteer === null)
        {
            let puppeteerConstructor: any = puppeteer.constructor;

            this.puppeteer = new puppeteerConstructor(
                {
                    projectRoot: this.PackageDirectory
                });
        }

        return this.puppeteer;
    }
}
