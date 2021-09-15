import { createSandbox } from "sinon";
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
                let result: string;
                let sandbox = createSandbox();

                try
                {
                    sandbox.replace(
                        Converter.prototype,
                        "Start",
                        async (type, path) =>
                        {
                            result = path;
                            sandbox.restore();
                        });

                    await new ConversionRunner(TestConstants.Extension).Execute(this.TextDocument);
                    resolve(result);
                }
                catch (exception)
                {
                    reject(exception);
                }
                finally
                {
                    sandbox.restore();
                }
            });
    }
}
