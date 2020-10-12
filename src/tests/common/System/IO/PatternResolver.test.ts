import { ok, strictEqual, throws } from "assert";
import { TempFile } from "@manuth/temp-files";
import { Func } from "mocha";
import { Random } from "random-js";
import { dirname, parse } from "upath";
import { TextDocument, Uri, workspace } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { PatternResolver } from "../../../../System/IO/PatternResolver";

/**
 * Registers tests for the `PatternResolver` class.
 */
export function PatternResolverTests(): void
{
    suite(
        "PatternResolver",
        () =>
        {
            let random: Random;
            let testFile: TempFile;
            let document: TextDocument;
            let conversionType: ConversionType;
            let extension: string;
            let incorrectVariable = "testVariable";

            let variableNames = [
                "basename",
                "extension",
                "filename",
                "dirname",
                "workspaceFolder"
            ];

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    testFile = new TempFile();
                    document = await workspace.openTextDocument(Uri.file(testFile.FullName));
                    conversionType = ConversionType.JPEG;
                    extension = "jpg";
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether using an unspecified variable raises an error…",
                        () =>
                        {
                            throws(() => new PatternResolver(`\${${incorrectVariable}}`));
                        });
                });

            test(
                "Variables",
                () =>
                {
                    test(
                        "Checking whether all variables inside the pattern are recognized correctly…",
                        () =>
                        {
                            let variables: string[] = [];

                            for (let i = random.integer(0, 10); i--; i > 0)
                            {
                                variables.push(random.pick(variableNames));
                            }

                            let resolver = new PatternResolver(variables.map((variable) => `\${${variable}}`).join(""));

                            for (let variable of variables)
                            {
                                ok(resolver.Variables.includes(variable));
                            }
                        });
                });

            suite(
                "Resolve",
                () =>
                {
                    let tests: Array<[string, (result: string) => ReturnType<Func>]>;

                    tests = [
                        [
                            "basename",
                            (result) =>
                            {
                                strictEqual(result, parse(testFile.FullName).name);
                            }
                        ],
                        [
                            "extension",
                            (result) =>
                            {
                                strictEqual(result, extension);
                            }
                        ],
                        [
                            "filename",
                            (result) =>
                            {
                                strictEqual(result, parse(testFile.FullName).name);
                            }
                        ]
                    ];

                    for (let patternTest of tests)
                    {
                        test(
                            `Checking whether \`\${${patternTest[0]}}\` is substituted correctly…`,
                            function()
                            {
                                patternTest[1] = patternTest[1].bind(this);

                                patternTest[1](
                                    new PatternResolver(`\${${patternTest[0]}}`).Resolve(
                                        dirname(testFile.FullName),
                                        document,
                                        conversionType));
                            });
                    }
                });
        });
}
