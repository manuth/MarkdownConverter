import { doesNotThrow, ok, strictEqual } from "assert";
import { join } from "path";
import { Package } from "@manuth/package-json-editor";
import { TempDirectory } from "@manuth/temp-files";
import { Random } from "random-js";
import { createSandbox, SinonSandbox } from "sinon";
import { Extension, ExtensionKind, extensions, Uri } from "vscode";
import { MarkdownContributions } from "../../../../System/Extensibility/MarkdownContributions";

/**
 * Registers tests for the {@link MarkdownContributions `MarkdownContributions`} class.
 */
export function MarkdownContributionTests(): void
{
    suite(
        nameof(MarkdownContributions),
        () =>
        {
            const contributionPropertyName = "contributes";
            const styleContributionPoint = "markdown.previewStyles";
            const scriptContributionPoint = "markdown.previewScripts";
            let sandbox: SinonSandbox;
            let random: Random;
            let tempDirectories: TempDirectory[];
            let contributionCollector: TestMarkdownContributions;
            let mockedExtensions: Array<Extension<any>>;

            /**
             * Provides an implementation of the {@link MarkdownContributions `MarkdownContributions`} class for testing.
             */
            class TestMarkdownContributions extends MarkdownContributions
            {
                /**
                 * @inheritdoc
                 */
                public override Load(): void
                {
                    super.Load();
                }

                /**
                 * @inheritdoc
                 *
                 * @param contributes
                 * The contributions of the extension.
                 *
                 * @param extension
                 * The extension to load the contributions from.
                 */
                public override LoadScripts(contributes: any, extension: Extension<any>): void
                {
                    super.LoadScripts(contributes, extension);
                }

                /**
                 * @inheritdoc
                 *
                 * @param contributes
                 * The contributions of the extension.
                 *
                 * @param extension
                 * The extension to load the contributions from.
                 */
                public override LoadStyles(contributes: any, extension: Extension<any>): void
                {
                    super.LoadStyles(contributes, extension);
                }
            }

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    let fileCounter = 0;
                    sandbox = createSandbox();
                    tempDirectories = [];
                    contributionCollector = new TestMarkdownContributions();
                    mockedExtensions = [];

                    for (let i = random.integer(2, 10); i > 0; i--)
                    {
                        let tempDir = new TempDirectory();
                        let npmPackage = new Package(tempDir.MakePath(Package.FileName), {});
                        let contributions: Record<string, unknown> = {};
                        tempDirectories.push(tempDir);

                        for (let contributionPoint of [styleContributionPoint, scriptContributionPoint])
                        {
                            if (random.bool())
                            {
                                contributions[contributionPoint] = [];

                                for (let i = random.integer(1, 5); i > 0; i--)
                                {
                                    (contributions[contributionPoint] as string[]).push(`./${random.string(10)}${++fileCounter}`);
                                }
                            }
                        }

                        npmPackage.AdditionalProperties.Add(contributionPropertyName, contributions);

                        mockedExtensions.push(
                            {
                                activate: async () => null,
                                exports: null,
                                extensionKind: ExtensionKind.Workspace,
                                id: null,
                                extensionPath: tempDir.FullName,
                                extensionUri: Uri.file(tempDir.FullName),
                                isActive: true,
                                packageJSON: npmPackage.ToJSON()
                            });
                    }

                    sandbox.replaceGetter(extensions, "all", () => mockedExtensions);
                });

            teardown(
                () =>
                {
                    sandbox.restore();

                    for (let tempDir of tempDirectories)
                    {
                        tempDir.Dispose();
                    }
                });

            let contributionKeys = [
                [
                    nameof<MarkdownContributions>((c) => c.PreviewStyles),
                    styleContributionPoint
                ],
                [
                    nameof<MarkdownContributions>((c) => c.PreviewScripts),
                    scriptContributionPoint
                ]
            ] as Array<[keyof MarkdownContributions, string]>;

            for (let entry of contributionKeys)
            {
                let scheme = "vscode-resource";

                suite(
                    entry[0],
                    () =>
                    {
                        test(
                            `Checking whether all contributions use the \`${scheme}\`-scheme…`,
                            () =>
                            {
                                for (let contribution of contributionCollector[entry[0]])
                                {
                                    strictEqual(contribution.scheme, scheme);
                                }
                            });

                        test(
                            "Checking whether all extension-contributions are present…",
                            () =>
                            {
                                for (let extension of mockedExtensions)
                                {
                                    for (let contribution of (new Package(extension.packageJSON).AdditionalProperties.Get(contributionPropertyName) as any)[entry[1]] ?? [] as string[])
                                    {
                                        ok(
                                            contributionCollector[entry[0]].some(
                                                (uri) =>
                                                {
                                                    return uri.fsPath === Uri.file(join(extension.extensionPath, contribution)).fsPath;
                                                }));
                                    }
                                }
                            });
                    });
            }

            suite(
                nameof<TestMarkdownContributions>((contributions) => contributions.Load),
                () =>
                {
                    test(
                        "Checking whether having invalid paths doesn't throw an exception…",
                        () =>
                        {
                            mockedExtensions[0].packageJSON[contributionPropertyName][scriptContributionPoint] ??= [];
                            (mockedExtensions[0].packageJSON[contributionPropertyName][scriptContributionPoint] as string[]).push(null);
                            doesNotThrow(() => contributionCollector.Load());
                        });

                    test(
                        `Checking whether the absence of a ${nameof(Package.FileName)}\`-file doesn't throw an exception…`,
                        () =>
                        {
                            sandbox.replace(mockedExtensions[0], "packageJSON", null);
                            doesNotThrow(() => contributionCollector.Load());
                        });

                    test(
                        "Checking whether the absence of contributions in an extension doesn't throw an exception…",
                        () =>
                        {
                            mockedExtensions[0].packageJSON[contributionPropertyName] = null;
                            doesNotThrow(() => contributionCollector.Load());
                        });

                    test(
                        "Checking whether the contributions are only loaded once…",
                        () =>
                        {
                            let innerSandbox = createSandbox();
                            let spy = innerSandbox.spy(contributionCollector);
                            contributionCollector.Load();
                            ok(spy.LoadScripts.callCount > 0);
                            ok(spy.LoadStyles.callCount > 0);
                            innerSandbox.restore();
                            spy = innerSandbox.spy(contributionCollector);
                            contributionCollector.Load();
                            strictEqual(spy.LoadScripts.callCount, 0);
                            strictEqual(spy.LoadStyles.callCount, 0);
                        });
                });
        });
}
