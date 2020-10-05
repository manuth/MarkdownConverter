import MarkdownIt = require("markdown-it");
import { TextDocument, workspace } from "vscode";
import { Converter } from "../Conversion/Converter";
import { MarkdownConverterExtension } from "../MarkdownConverterExtension";
import { ConversionRunner } from "../System/Tasks/ConversionRunner";

/**
 * Provides the functionality to test the substitution of the `ConversionRunner`.
 */
export class SubstitutionTester
{
    /**
     * The document whose name is to be tested.
     */
    public TextDocument: TextDocument;

    /**
     * Initializes a new instance of the `SubstitutionTester`.
     *
     * @param textDocument
     * The text-document whose name is to be tested.
     */
    public constructor(textDocument: TextDocument)
    {
        this.TextDocument = textDocument;
    }

    /**
     * Tests the current substitution-settings.
     */
    public async Test()
    {
        return new Promise<string>(
            async (resolve) =>
            {
                let originalStart = Converter.prototype.Start;
                Converter.prototype.Start = async (type, path) =>
                {
                    resolve(path);
                    Converter.prototype.Start = originalStart;
                };

                new ConversionRunner({ VSCodeParser: new MarkdownIt() } as MarkdownConverterExtension).Execute(this.TextDocument);
            });
    }
}