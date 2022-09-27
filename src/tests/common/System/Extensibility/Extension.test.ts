import { doesNotReject, notStrictEqual, ok, strictEqual } from "node:assert";
import { createRequire } from "node:module";
import { Package } from "@manuth/package-json-editor";
import { CultureInfo } from "@manuth/resource-manager";
import MarkdownIt from "markdown-it";
import { Random } from "random-js";
import { createSandbox, SinonSandbox } from "sinon";
import vscode from "vscode";
import { Constants } from "../../../../Constants.js";
import { Resources } from "../../../../Properties/Resources.js";
import { Extension } from "../../../../System/Extensibility/Extension.js";
import { Task } from "../../../../System/Tasks/Task.js";
import { TestConstants } from "../../../TestConstants.js";

const { commands, env, window, workspace } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link Extension `Extension`} class.
 */
export function ExtensionTests(): void
{
    suite(
        nameof(Extension),
        () =>
        {
            let random: Random;
            let sandbox: SinonSandbox;
            let extension: TestExtension;
            let npmPackage: Package;

            /**
             * Provides an implementation of the {@link Extension `Extension`} class for testing.
             */
            class TestExtension extends Extension
            {
                /**
                 * @inheritdoc
                 *
                 * @param task
                 * The task to execute.
                 */
                public override async ExecuteTask(task: Task): Promise<void>
                {
                    return super.ExecuteTask(task);
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
                    sandbox = createSandbox();
                    npmPackage = TestConstants.PackageMetadata;
                    extension = new TestExtension(npmPackage);
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameof(Extension.constructor),
                () =>
                {
                    test(
                        `Checking whether the ${nameof(Resources)}\`' \`${nameof(Resources.Culture)}\` is set to vscode's language…`,
                        () =>
                        {
                            Resources.Culture = CultureInfo.InvariantCulture;
                            new Extension(npmPackage);

                            for (let resource of [Resources.Resources, Resources.Files])
                            {
                                notStrictEqual(resource.Locale, CultureInfo.InvariantCulture);
                                strictEqual(resource.Locale.Name, new CultureInfo(env.language).Name);
                            }
                        });
                });

            suite(
                nameof<TestExtension>((extension) => extension.Author),
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
                nameof<TestExtension>((extension) => extension.Name),
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
                nameof<TestExtension>((extension) => extension.FullName),
                () =>
                {
                    test(
                        "Checking whether the full extension-name is resolved correctly…",
                        () =>
                        {
                            strictEqual(extension.FullName, `${extension.Author}.${extension.Name}`);
                        });
                });

            suite(
                nameof<TestExtension>((extension) => extension.Activate),
                () =>
                {
                    let extensionMethod = "extendMarkdownIt";

                    setup(
                        () =>
                        {
                            sandbox.replace(window, "showTextDocument", () => null);
                            sandbox.replace(workspace, "openTextDocument", () => null);
                            sandbox.replace(commands, "executeCommand", () => null);
                        });

                    test(
                        `Checking whether the \`${extensionMethod}\`-method exposed by the \`${nameof<TestExtension>((e) => e.Activate)}\`-method resolves the system-parser fix \`${nameof(Promise)}\`…`,
                        async () =>
                        {
                            let parser = new MarkdownIt();
                            let systemParserFixPromise = extension.EnableSystemParser();
                            (await extension.Activate() as any)[extensionMethod](parser);
                            doesNotReject(() => systemParserFixPromise);
                            strictEqual(extension.VSCodeParser, parser);
                        });
                });

            suite(
                nameof<TestExtension>((extension) => extension.ExecuteTask),
                () =>
                {
                    let messages: string[];
                    let error: Error;

                    setup(
                        () =>
                        {
                            messages = [];
                            error = new Error(random.string(20));

                            sandbox.replace(
                                window,
                                "showErrorMessage",
                                async (message: string) =>
                                {
                                    messages.push(message);
                                    return "";
                                });
                        });

                    test(
                        "Checking whether an error-message is displayed if the task throws an exception…",
                        async () =>
                        {
                            await extension.ExecuteTask(
                                new class extends Task
                                {
                                    /**
                                     * @inheritdoc
                                     */
                                    public get Title(): string
                                    {
                                        return "Test";
                                    }

                                    /**
                                     * @inheritdoc
                                     */
                                    public async Execute(): Promise<void>
                                    {
                                        throw error;
                                    }
                                }(extension));

                            ok(
                                messages.some(
                                    (message) =>
                                    {
                                        return message.includes(error.message);
                                    }));
                        });
                });
        });
}
