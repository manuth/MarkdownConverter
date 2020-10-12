import { strictEqual } from "assert";
import { Package } from "@manuth/package-json-editor";
import { resolve } from "upath";
import { Constants } from "../../../../Constants";
import { Extension } from "../../../../System/Extensibility/Extension";

/**
 * Registers tests for the `Extension` class.
 */
export function ExtensionTests(): void
{
    suite(
        "Extension",
        () =>
        {
            let extension: Extension;

            setup(
                () =>
                {
                    extension = new Extension(new Package(resolve(Constants.PackageDirectory, "package.json")));
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
