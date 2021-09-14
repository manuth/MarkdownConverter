import { strictEqual } from "assert";
import { Package } from "@manuth/package-json-editor";
import { Extension } from "../../../../System/Extensibility/Extension";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the {@link Extension `Extension`} class.
 */
export function ExtensionTests(): void
{
    suite(
        nameof(Extension),
        () =>
        {
            let extension: Extension;
            let npmPackage: Package;

            setup(
                () =>
                {
                    npmPackage = TestConstants.PackageMetadata;
                    extension = new Extension(npmPackage);
                });

            suite(
                nameof<Extension>((extension) => extension.Author),
                () =>
                {
                    test(
                        "Checking whether the author is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.Author, npmPackage.AdditionalProperties.Get("publisher"));
                        });
                });

            suite(
                nameof<Extension>((extension) => extension.Name),
                () =>
                {
                    test(
                        "Checking whether the extension-name is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.Name, npmPackage.Name);
                        });
                });

            suite(
                nameof<Extension>((extension) => extension.FullName),
                () =>
                {
                    test(
                        "Checking whether the full extension-name is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.FullName, `${extension.Author}.${extension.Name}`);
                        });
                });
        });
}
