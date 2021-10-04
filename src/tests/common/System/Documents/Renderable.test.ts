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
                protected async RenderContent(): Promise<string>
                {
                    return this.Content;
                }
            }

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
        });
}
