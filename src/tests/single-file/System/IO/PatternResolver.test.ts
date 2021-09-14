import { ok, strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { Func } from "mocha";
import { dirname } from "upath";
import { TextDocument, Uri, workspace } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { PatternResolver } from "../../../../System/IO/PatternResolver";

/**
 * Registers tests for the {@link PatternResolver `PatternResolver`} class.
 */
export function PatternResolverTests(): void
{
    suite(
        "PatternResolver",
        () =>
        {
            let testFile: TempFile;
            let document: TextDocument;
            let conversionType: ConversionType;

            suiteSetup(
                async () =>
                {
                    testFile = new TempFile();
                    document = await workspace.openTextDocument(Uri.file(testFile.FullName));
                    conversionType = ConversionType.HTML;
                });

            suite(
                "Resolve",
                () =>
                {
                    let tests: Array<[string, (pattern: string) => string, (result: string) => ReturnType<Func>]> = [
                        [
                            "workspaceFolder",
                            (pattern) => `Checking whether the ${pattern} resolves to the destination-folder…`,
                            (result) =>
                            {
                                strictEqual(result, dirname(testFile.FullName));
                            }
                        ],
                        [
                            "dirname",
                            (pattern) => `Checking whether ${pattern} is empty…`,
                            (result) =>
                            {
                                ok(/^\.?$/.test(result));
                            }
                        ]
                    ];

                    for (let patternTest of tests)
                    {
                        let pattern = `\${${patternTest[0]}}`;

                        test(
                            patternTest[1](pattern),
                            function()
                            {
                                patternTest[2] = patternTest[2].bind(this);

                                patternTest[2](
                                    new PatternResolver(pattern).Resolve(
                                        dirname(testFile.FullName),
                                        document,
                                        conversionType,
                                        dirname(testFile.FullName)));
                            });
                    }
                });
        });
}
