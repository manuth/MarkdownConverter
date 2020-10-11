import { extension } from "..";
import { MarkdownConverterExtension } from "../MarkdownConverterExtension";

/**
 * Provides constants for testing.
 */
export class TestConstants
{
    /**
     * Gets the representation of this extension.
     */
    public static get Extension(): MarkdownConverterExtension
    {
        return extension;
    }
}
