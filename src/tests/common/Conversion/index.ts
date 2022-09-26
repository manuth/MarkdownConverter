import { basename } from "path";
import { ConverterTests } from "./Converter.test.js";
import { ConverterPluginTests } from "./ConverterPlugin.test.js";

/**
 * Registers tests for conversion.
 */
export function ConversionTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            ConverterPluginTests();
            ConverterTests();
        });
}
