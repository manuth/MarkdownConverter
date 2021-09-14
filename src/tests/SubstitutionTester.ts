import { TextDocument } from "vscode";
import { Converter } from "../Conversion/Converter";
import { ConversionRunner } from "../System/Tasks/ConversionRunner";
import { TestConstants } from "./TestConstants";

/**
 * Provides the functionality to test the substitution of the {@link ConversionRunner `ConversionRunner`}.
 */
export class SubstitutionTester
{
    /**
     * The document to test the substitution for.
     */
    public TextDocument: TextDocument;

    /**
     * Initializes a new instance of the {@link SubstitutionTester `SubstitutionTester`}.
     *
     * @param textDocument
     * The text-document to test the substitution for.
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
                    await new ConversionRunner(TestConstants.Extension).Execute(this.TextDocument);
                    resolve(result);
                }
                catch (error)
                {
                    reject(error);
                }
            });
    }
}
