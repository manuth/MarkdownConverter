import { strictEqual } from "assert";
import { Renderable } from "../../../../System/Documents/Renderable";

/**
 * Registers tests for the `Renderable` class.
 */
export function RenderableTests(): void
{
    suite(
        "Renderable",
        () =>
        {
            /**
             * Provides an implementation of the `Renderable` class for testing.
             */
            class TestRenderable extends Renderable
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The rendered text.
                 */
                public async Render(): Promise<string>
                {
                    return this.Content;
                }
            }

            let verifier: string;
            let text: string;
            let renderer: TestRenderable;

            suiteSetup(
                () =>
                {
                    verifier = "rendered: ";
                    text = "hello world";

                    renderer = new class extends TestRenderable
                    {
                        /**
                         * @inheritdoc
                         *
                         * @returns
                         * The rendered text.
                         */
                        public override async Render(): Promise<string>
                        {
                            return verifier + this.Content;
                        }
                    }(text);
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the values are set correctly…",
                        () =>
                        {
                            let renderer = new TestRenderable();
                            strictEqual(renderer.Content, "");
                            renderer = new TestRenderable("hello");
                            strictEqual(renderer.Content, "hello");
                        });
                });

            suite(
                "Render",
                () =>
                {
                    test(
                        "Checking whether text can be rendered…",
                        async () =>
                        {
                            strictEqual(await renderer.Render(), verifier + text);
                        });
                });
        });
}
