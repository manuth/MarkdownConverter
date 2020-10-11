import { TextDocument } from "vscode";
import { extension } from "..";
import { Converter } from "../Conversion/Converter";
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
                let result: string;

                Converter.prototype.Start = async (type, path) =>
                {
                    result = path;
                    Converter.prototype.Start = originalStart;
                };

                try
                {
                    await new ConversionRunner(extension).Execute(this.TextDocument);
                    resolve(result);
                }
                catch (error)
                {
                    reject(error);
                }
            });
    }
}
