import { Package } from "@manuth/package-json-editor";
import { join } from "upath";
import { extensions } from "vscode";
import { Constants } from "../Constants";
import { MarkdownConverterExtension } from "../MarkdownConverterExtension";
import { Extension } from "../System/Extensibility/Extension";

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

    /**
     * Gets the name of the suite-variable.
     */
    public static get SuiteVarName(): string
    {
        return "TEST_SUITE";
    }
}
