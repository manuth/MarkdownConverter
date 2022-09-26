import { strictEqual } from "assert";
import { dirname } from "path";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import MarkdownIt from "markdown-it";
import { Random } from "random-js";
import { createSandbox, SinonSandbox } from "sinon";
import path from "upath";
import { Document } from "../../../../System/Documents/Document.js";
import { EnvironmentKey } from "../../../../System/Documents/EnvironmentKey.js";
import { MarkdownFragment } from "../../../../System/Documents/MarkdownFragment.js";

const { toUnix } = path;

/**
 * Registers tests for the {@link MarkdownFragment `MarkdownFragment`} class.
 */
export function MarkdownFragmentTests(): void
{
    suite(
        nameof(MarkdownFragment),
        () =>
        {
            /**
             * Provides an implementation of the {@link MarkdownFragment `MarkdownFragment`} class for testing.
             */
            class TestMarkdownFragment extends MarkdownFragment
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The rendered text.
                 */
                public override RenderContent(): Promise<string>
                {
                    return super.RenderContent();
                }
            }

            let sandbox: SinonSandbox;
            let random: Random;
            let tempFile: TempFile;
            let fragment: TestMarkdownFragment;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    sandbox = createSandbox();
                    fragment = new TestMarkdownFragment(new Document(new MarkdownIt()));
                    tempFile = new TempFile();
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                    tempFile.Dispose();
                });

            suite(
                nameof<TestMarkdownFragment>((fragment) => fragment.RenderContent),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof(MarkdownFragment)}\` is rendered using \`${nameof(MarkdownIt)}\`…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let text = random.string(10);
                            fragment.Content = `**${text}**`;
                            let textSelector = `:contains("${text}")`;
                            let result = await fragment.Render();

                            strictEqual(
                                load(result)(`b${textSelector},strong${textSelector}`).length,
                                1);
                        });

                    test(
                        "Checking whether the `markdown-it` environment is generated properly…",
                        async () =>
                        {
                            let environment: any;
                            sandbox.replace(fragment.Document.Parser, "render", (src, env) => environment = env);

                            for (let entry of [
                                [tempFile.FullName, dirname(tempFile.FullName)],
                                [null, null]
                            ] as Array<[string, string]>)
                            {
                                let fileNameSandbox = createSandbox();
                                fileNameSandbox.replaceGetter(fragment.Document, "FileName", () => entry[0]);
                                await fragment.RenderContent();
                                strictEqual(toUnix(environment[EnvironmentKey.RootDir] ?? ""), toUnix(entry[1] ?? ""));
                                fileNameSandbox.restore();
                            }
                        });
                });
        });
}
