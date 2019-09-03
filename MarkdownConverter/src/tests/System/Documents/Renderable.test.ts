import Assert = require("assert");
import { Renderable } from "../../../System/Documents/Renderable";

suite(
    "Renderable",
    () =>
    {
        let verifier = "rendered: ";
        let otherVerifier = "other rendered: ";
        let text = "hello world";
        let renderer = new class extends Renderable
        {
            /**
             * @inheritdoc
             */
            protected async RenderText(text: string)
            {
                return verifier + text;
            }
        }(text);

        let otherRenderer = new class extends Renderable
        {
            /**
             * @inheritdoc
             */
            protected async RenderText(text: string)
            {
                return otherVerifier + text;
            }
        }(text);

        /**
         * Provides an implementation of the `Renderable` class for testing.
         */
        class TestRenderable extends Renderable
        {
            /**
             * @inheritdoc
             */
            protected async RenderText(text: string)
            {
                return text;
            }
        }

        suite(
            "constructor(string content?)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let renderer = new TestRenderable();
                        Assert.strictEqual(renderer.Content, "");
                        renderer = new TestRenderable("hello");
                        Assert.strictEqual(renderer.Content, "hello");
                    });
            });

        suite(
            "Render()",
            () =>
            {
                test(
                    "Checking whether text can be renderer…",
                    async () =>
                    {
                        Assert.strictEqual(await renderer.Render(), verifier + text);
                    });
            });

        suite(
            "RenderTextBy(Renderable renderer, string text)",
            () =>
            {
                test(
                    "Checking whether text can be rendered by another Renderable…",
                    async () =>
                    {
                        Assert.strictEqual(await renderer["RenderTextBy"](otherRenderer, renderer.Content), otherVerifier + text);
                    });
            });
    });