import { createSandbox } from "sinon";
import { TextDocument } from "vscode";
import { Converter } from "../Conversion/Converter";
import { Settings } from "../Properties/Settings";
import { ConversionRunner } from "../System/Tasks/ConversionRunner";

/**
 * Provides the functionality to test the substitution of the {@link ConversionRunner `ConversionRunner`}.
 */
export class SubstitutionTester
{
    /**
     * The conversion-runner to use for testing.
     */
    private conversionRunner: ConversionRunner;

    /**
     * Initializes a new instance of the {@link SubstitutionTester `SubstitutionTester`}.
     *
     * @param conversionRunner
     * The conversion-runner to use for testing.
     */
    public constructor(conversionRunner: ConversionRunner)
    {
        this.conversionRunner = conversionRunner;
    }

    /**
     * Gets the conversion-runner to use for testing.
     */
    public get ConversionRunner(): ConversionRunner
    {
        return this.conversionRunner;
    }

    /**
     * Tests the current substitution-settings.
     *
     * @param document
     * The document to rename.
     *
     * @param pattern
     * The pattern to test.
     *
     * @returns
     * The result of the substitution.
     */
    public async Test(document: TextDocument, pattern: string): Promise<string>
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

                    sandbox.replaceGetter(Settings.Default, "DestinationPattern", () => pattern);
                    await this.ConversionRunner.Execute(document);
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
