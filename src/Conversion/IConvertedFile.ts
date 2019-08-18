import { ConversionType } from "./ConversionType";

/**
 * Provides information about a converted file.
 */
export interface IConvertedFile
{
    /**
     * The type of the converted file.
     */
    Type: ConversionType;

    /**
     * The name of the converted file.
     */
    FileName: string;
}