/**
 * Represents a conversion-type.
 */
export enum ConversionType
{
    /**
     * BMP-conversion
     */
    BMP,
    /**
     * HTML-conversion.
     */
    HTML,

    /**
     * JPG-conversion
     */
    JPEG,
    /**
     * PDF-conversion.
     */
    PDF,

    /**
     * PNG-conversion.
     */
    PNG,
    
    /**
     * PPM-conversion
     */
    PPM
}

/**
 * The extensions of the conversion-types
 */
export let Extensions : { [id : number] : string } = BuildExtensions();

function BuildExtensions() : { [id : number] : string }
{
    let extensions : { [id : number] : string } = { };
    extensions[ConversionType.BMP] = '.bmp';
    extensions[ConversionType.HTML] = '.html';
    extensions[ConversionType.JPEG] = '.jpg';
    extensions[ConversionType.PDF] = '.pdf';
    extensions[ConversionType.PNG] = '.png';
    extensions[ConversionType.PPM] = '.ppm';
    return extensions;
}