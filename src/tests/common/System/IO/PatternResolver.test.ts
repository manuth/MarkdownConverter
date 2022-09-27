import { ok, strictEqual, throws } from "node:assert";
import { createRequire } from "node:module";
import { basename, dirname } from "node:path";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import rescape from "@stdlib/utils-escape-regexp-string";
import { Context } from "mocha";
import { Random } from "random-js";
import path from "upath";
import vscode, { TextDocument } from "vscode";
import { Constants } from "../../../../Constants.js";
import { ConversionType } from "../../../../Conversion/ConversionType.js";
import { IPatternContext } from "../../../../System/IO/IPatternContext.js";
import { PatternResolver } from "../../../../System/IO/PatternResolver.js";
import { IPatternTest } from "./IPatternTest.js";

const { normalize, parse, relative } = path;
const { Uri, workspace } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link PatternResolver `PatternResolver`} class.
 */
export function PatternResolverTests(): void
{
    suite(
        nameof(PatternResolver),
        () =>
        {
            let random: Random;
            let tempDir: TempDirectory;
            let tempFile: TempFile;
            let document: TextDocument;
            let conversionType: ConversionType;
            let extension: string;
            let incorrectVariable = "testVariable";

            let variableNames = [
                nameof<IPatternContext>((context) => context.basename),
                nameof<IPatternContext>((context) => context.extension),
                nameof<IPatternContext>((context) => context.filename),
                nameof<IPatternContext>((context) => context.dirname),
                nameof<IPatternContext>((context) => context.workspaceFolder)
            ];

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    tempDir = new TempDirectory();

                    tempFile = new TempFile(
                        {
                            Directory: tempDir.MakePath("Test")
                        });

                    document = await workspace.openTextDocument(Uri.file(tempFile.FullName));
                    conversionType = ConversionType.JPEG;
                    extension = "jpg";
                });

            suiteTeardown(
                () =>
                {
                    tempFile.Dispose();
                    tempDir.Dispose();
                });

            suite(
                nameof(PatternResolver.constructor),
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
                nameof<PatternResolver>((resolver) => resolver.Variables),
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
                nameof<PatternResolver>((resolver) => resolver.Resolve),
                () =>
                {
                    let tests: IPatternTest[];

                    tests = [
                        {
                            VariableName: nameof<IPatternContext>((context) => context.filename),
                            async Test(result)
                            {
                                strictEqual(result, parse(tempFile.FullName).name);
                            }
                        },
                        {
                            VariableName: nameof<IPatternContext>((context) => context.basename),
                            async Test(result)
                            {
                                strictEqual(result, parse(tempFile.FullName).name);
                            }
                        },
                        {
                            VariableName: nameof<IPatternContext>((context) => context.extension),
                            async Test(result)
                            {
                                strictEqual(result, extension);
                            }
                        },
                        {
                            VariableName: nameof<IPatternContext>((context) => context.dirname),
                            Message: (pattern) => `Checking whether \`${pattern}\` contains the path to the directory relative to the workspace-folder…`,
                            async Test(result)
                            {
                                strictEqual(
                                    normalize(relative(tempDir.MakePath(), dirname(tempFile.FullName))),
                                    normalize(result));
                            }
                        },
                        {
                            VariableName: nameof<IPatternContext>((context) => context.dirname),
                            get FileName()
                            {
                                return tempDir.MakePath("Test.md");
                            },
                            Message: (pattern) => `Checking whether \`${pattern}\` is empty if the file is a direct child of the workspace-folder…`,
                            async Test(this: Context, result)
                            {
                                this.slow(2 * 1000);
                                this.timeout(4 * 1000);
                                ok(/^\.?$/.test(result));
                            }
                        },
                        {
                            VariableName: nameof<IPatternContext>((context) => context.workspaceFolder),
                            async Test(result)
                            {
                                strictEqual(result, tempDir.FullName);
                            }
                        }
                    ];

                    for (let patternTest of tests)
                    {
                        let pattern = `\${${patternTest.VariableName}}`;

                        test(
                            patternTest.Message?.(pattern) ?? `Checking whether \`${pattern}\` is substituted correctly…`,
                            async function()
                            {
                                let tempFile: TempFile = null;
                                let tempDocument: TextDocument = null;

                                if (patternTest.FileName)
                                {
                                    tempFile = new TempFile(
                                        {
                                            Directory: dirname(patternTest.FileName),
                                            FileNamePattern: rescape(basename(patternTest.FileName))
                                        });

                                    tempDocument = await workspace.openTextDocument(tempFile.FullName);
                                }

                                let test = patternTest?.Test;
                                test = test?.bind(this);

                                await test?.(
                                    new PatternResolver(pattern).Resolve(
                                        patternTest?.WorkspaceFolder ?? tempDir.FullName,
                                        tempDocument ?? document,
                                        conversionType));

                                tempFile?.Dispose();
                            });
                    }

                    test(
                        "Checking whether messages are reported while resolving the path…",
                        () =>
                        {
                            let reportCounter = 0;
                            new PatternResolver("", { report() { reportCounter++; } }).Resolve("", document, conversionType);
                            ok(reportCounter > 0);
                        });
                });
        });
}
