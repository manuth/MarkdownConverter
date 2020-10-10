import { doesNotThrow, notStrictEqual, ok } from "assert";
import { Package } from "@manuth/package-json-editor";
import { join } from "upath";
import { extensions } from "vscode";
import { Constants } from "../../../../Constants";
import { extension } from "../../../../extension";
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
            suiteSetup(
                async () =>
                {
                    await extensions.getExtension(
                        new Extension(
                            null,
                            new Package(join(Constants.PackageDirectory, "package.json"))).FullName).activate();
                });

            suite(
                "EnableSystemParser",
                () =>
                {
                    test(
                        "Checking whether the system-parser can be enabled manually…",
                        async function()
                        {
                            this.slow(11.5 * 1000);
                            this.timeout(46 * 1000);
                            ok((extension.VSCodeParser === null) || (extension.VSCodeParser === undefined));
                            await extension.EnableSystemParser();
                            notStrictEqual(extension.VSCodeParser, null);
                            doesNotThrow(() => extension.VSCodeParser.render("**test**"));
                        });
                });
        });
}
