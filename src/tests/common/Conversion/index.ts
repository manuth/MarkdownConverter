import { ConverterTests } from "./Converter.test";
import { ConverterPluginTests } from "./ConverterPlugin.test";

/**
 * Registers tests for conversion.
 */
export function ConversionTests(): void
{
    suite(
        "Conversion",
        () =>
        {
            ConverterPluginTests();
            ConverterTests();
        });
}
