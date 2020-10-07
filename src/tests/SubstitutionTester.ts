import MarkdownIt = require("markdown-it");
import { TextDocument } from "vscode";
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
     *
     * @returns
     * The result of the substitution.
     */
    public async Test(): Promise<string>
    {
        return new Promise<string>(
            async (resolve, reject) =>
            {
                let originalStart = Converter.prototype.Start;

                Converter.prototype.Start = async (type, path) =>
                {
                    resolve(path);
                    Converter.prototype.Start = originalStart;
                };

                try
                {
                    new ConversionRunner({ VSCodeParser: new MarkdownIt() } as MarkdownConverterExtension).Execute(this.TextDocument);
                }
                catch (error)
                {
                    reject(error);
                }
            });
    }
}
