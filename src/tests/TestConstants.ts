import { createRequire } from "node:module";
import { Package } from "@manuth/package-json-editor";
import path from "upath";
import vscode from "vscode";
import { Constants } from "../Constants.js";
import { MarkdownConverterExtension } from "../MarkdownConverterExtension.js";
import { Extension } from "../System/Extensibility/Extension.js";

const { join } = path;
const { extensions } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Provides constants for testing.
 */
export class TestConstants
{
    /**
     * Gets the path to the `package.json`-file of this extension.
     */
    public static get PackageFileName(): string
    {
        return join(Constants.PackageDirectory, Package.FileName);
    }

    /**
     * Gets the metadata of the `package.json`-file of this extension.
     */
    public static get PackageMetadata(): Package
    {
        return new Package(this.PackageFileName);
    }

    /**
     * Gets the representation of this extension.
     */
    public static get Extension(): MarkdownConverterExtension
    {
        return extensions.getExtension(new Extension(this.PackageMetadata).FullName).exports.extension;
    }
}
