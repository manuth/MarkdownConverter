import { strictEqual } from "assert";
import { Package } from "@manuth/package-json-editor";
import { resolve } from "upath";
import { Constants } from "../../../../Constants";
import { ISettings } from "../../../../Properties/ISettings";
import { Extension } from "../../../../System/Extensibility/Extension";
import { ITestContext } from "../../../ITestContext";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the `Extension` class.
 *
 * @param context
 * The test-context.
 */
export function ExtensionTests(context: ITestContext<ISettings>): void
{
    suite(
        "Extension",
        () =>
        {
            let extension: Extension;

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the extension can be initialized correctly…",
                        () =>
                        {
                            extension = new Extension(TestConstants.Extension.Context, new Package(resolve(Constants.PackageDirectory, "package.json")));
                        });
                });

            suite(
                "Author",
                () =>
                {
                    test(
                        "Checking whether the author is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.Author, "manuth");
                        });
                });

            suite(
                "Name",
                () =>
                {
                    test(
                        "Checking whether the extension-name is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.Name, "markdown-converter");
                        });
                });

            suite(
                "FullName",
                () =>
                {
                    test(
                        "Checking whether the full extension-name is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.FullName, "manuth.markdown-converter");
                        });
                });
        });
}
