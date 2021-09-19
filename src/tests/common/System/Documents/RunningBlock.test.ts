import { notStrictEqual, strictEqual } from "assert";
import MarkdownIt = require("markdown-it");
import { Random } from "random-js";
import { Document } from "../../../../System/Documents/Document";
import { DocumentFragment } from "../../../../System/Documents/DocumentFragment";
import { RunningBlock } from "../../../../System/Documents/RunningBlock";

/**
 * Registers tests for the {@link RunningBlock `RunningBlock`} class.
 */
export function RunningBLockTests(): void
{
    suite(
        nameof(RunningBlock),
        () =>
        {
            let random: Random;
            let runningBlock: TestRunningBlock;

            let keys = [
                [
                    nameof<TestRunningBlock>((b) => b.Left),
                    nameof<TestRunningBlock>((b) => b.LeftSection)
                ],
                [
                    nameof<TestRunningBlock>((b) => b.Right),
                    nameof<TestRunningBlock>((b) => b.RightSection)
                ],
                [
                    nameof<TestRunningBlock>((b) => b.Center),
                    nameof<TestRunningBlock>((b) => b.CenterSection)
                ]
            ] as Array<[keyof TestRunningBlock, keyof TestRunningBlock]>;

            /**
             * Provides an implementation of the {@link RunningBlock `RunningBlock`} class for testing.
             */
            class TestRunningBlock extends RunningBlock
            {
                /**
                 * @inheritdoc
                 */
                public override get LeftSection(): DocumentFragment
                {
                    return super.LeftSection;
                }

                /**
                 * @inheritdoc
                 */
                public override get RightSection(): DocumentFragment
                {
                    return super.RightSection;
                }

                /**
                 * @inheritdoc
                 */
                public override get CenterSection(): DocumentFragment
                {
                    return super.CenterSection;
                }

                /**
                 * @inheritdoc
                 *
                 * @param content
                 * The content to render.
                 *
                 * @param view
                 * The attributes to use for rendering the {@link content `content`}.
                 *
                 * @returns
                 * The rendered representation of the specified {@link content `content`}.
                 */
                public override async RenderTemplate(content: string, view: Record<string, unknown>): Promise<string>
                {
                    return super.RenderTemplate(content, view);
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
                    runningBlock = new TestRunningBlock(new Document(new MarkdownIt()));
                });

            for (let entry of keys)
            {
                suite(
                    entry[0],
                    () =>
                    {
                        test(
                            `Checking whether the \`${entry[0]}\`-property sets the content of the corresponding section…`,
                            () =>
                            {
                                let value = random.string(10);
                                (runningBlock as any)[entry[0]] = value;
                                strictEqual((runningBlock[entry[1]] as DocumentFragment).Content, value);
                            });
                    });
            }

            suite(
                nameof<TestRunningBlock>((runningBlock) => runningBlock.RenderTemplate),
                () =>
                {
                    test(
                        "Checking whether the sections are replaced with their rendered content…",
                        async function()
                        {
                            this.slow(3.5 * 1000);
                            this.timeout(7 * 1000);

                            for (let entry of keys)
                            {
                                let value = random.string(10);
                                (runningBlock as any)[entry[0]] = value;
                                runningBlock.Content = `{{ ${entry[0]} }}`;
                                strictEqual(await runningBlock.Render(), value);
                            }
                        });

                    test(
                        "Checking whether the section-content cannot be overridden with document-attributes…",
                        async function()
                        {
                            this.slow(3.5 * 1000);
                            this.timeout(7 * 1000);

                            for (let entry of keys)
                            {
                                let value = random.string(11);
                                runningBlock.Document.Attributes[entry[0]] = value;
                                runningBlock.Content = `{{ ${entry[0]} }}`;
                                notStrictEqual(await runningBlock.Render(), value);
                            }
                        });
                });
        });
}
