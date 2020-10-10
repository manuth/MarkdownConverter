import { doesNotThrow, notStrictEqual, ok } from "assert";
import { extension } from "../../../../extension";

/**
 * Registers tests for the `Extension` class.
 */
export function ExtensionTests(): void
{
    suite(
        "Extension",
        () =>
        {
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
