import { doesNotThrow, notStrictEqual, ok } from "assert";
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

            suiteSetup(
                () =>
                {
                    extension = TestConstants.Extension;
                });

            suite(
                nameof<Extension>((extension) => extension.EnableSystemParser),
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
