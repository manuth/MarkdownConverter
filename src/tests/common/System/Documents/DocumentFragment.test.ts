import { strictEqual } from "assert";
import MarkdownIt = require("markdown-it");
import { TextDocument, workspace } from "vscode";
import { Document } from "../../../../System/Documents/Document";
import { DocumentFragment } from "../../../../System/Documents/DocumentFragment";

suite(
    "DocumentFragment",
    () =>
    {
        let text: string;
        let verifier: string;
        let textDocument: TextDocument;
        let document: Document;

        suiteSetup(
            async () =>
            {
                text = "hello world";
                verifier = "rendered by document: ";
                textDocument = await workspace.openTextDocument({ language: "markdown" });

                document = new class extends Document
                {
                    /**
                     * Initializes a new instance of the class.
                     */
                    public constructor()
                    {
                        super(textDocument, new MarkdownIt());
                    }

                    /**
                     * @inheritdoc
                     *
                     * @param text
                     * The text to render.
                     *
                     * @returns
                     * The rendered text.
                     */
                    protected async RenderText(text: string): Promise<string>
                    {
                        return verifier + text;
                    }
                }();
            });

        suite(
            "constructor(Document document)",
            () =>
            {
                test(
                    "Checking whether the properties are set correctly…",
                    () =>
                    {
                        let documentFragment = new DocumentFragment(document);
                        strictEqual(documentFragment.Document, document);
                    });
            });

        suite(
            "RenderText(string text)",
            () =>
            {
                test(
                    "Checking whether the text is rendered by the `Document`-object…",
                    async () =>
                    {
                        let documentFragment = new DocumentFragment(document);
                        documentFragment.Content = text;
                        strictEqual(await documentFragment.Render(), verifier + text);
                    });
            });
    });
