import { strictEqual } from "assert";
import { Renderable } from "../../../../System/Documents/Renderable";

/**
 * Registers tests for the {@link Renderable `Renderable`} class.
 */
export function RenderableTests(): void
{
    suite(
        nameof(Renderable),
        () =>
        {
            /**
             * Provides an implementation of the {@link Renderable `Renderable`} class for testing.
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
                nameof(Renderable.constructor),
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
                nameof<Renderable>((renderable) => renderable.Render),
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
