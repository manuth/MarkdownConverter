/**
 * Provides some usefule functionallities.
 */
export class Utilities
{
    /**
     * Converts a string to code its code-points-value.
     * 
     * @param subject
     * The string to convert.
     */
    public static UTF8CharToCodePoints(subject : string) : number
    {
        let bytes : number[] = [ ];
        let byte : number;
        let buffer = Buffer.from(subject);
        let result : number = 0;

        // Determining the mask-type of the UTF-8 char.
        //
        // The UTF-8 Masks are as followed:
        //
        // 
        //  |     Unicode-Range     |              UTF-8-Mask             | Length (in bytes) |
        //  |-----------------------|------------------------------------:|------------------:|
        //  | 0000 0000 – 0000 007F |                            0xxxxxxx |                 1 |
        //  | 0000 0080 – 0000 07FF |                   110xxxxx 10xxxxxx |                 2 |
        //  | 0000 0800 – 0000 FFFF |          1110xxxx 10xxxxxx 10xxxxxx |                 3 |
        //  | 0001 0000 – 0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx |                 4 |
        //
        let length;

        if ((buffer[0] & 0x80) == 0x0)
        {
            return buffer[0];
        }

        if ((buffer[0] & 0xE0) == 0xC0)
        {
            length = 2;
            // Removing the mask of the first byte.
            buffer[0] = buffer[0] & 0x1F;
        }
        if ((buffer[0] & 0xF0) == 0xE0)
        {
            length = 3;
            // Removing the mask of the first byte.
            buffer[0] = buffer[0] & 0xF;
        }

        if ((buffer[0] & 0xF8) == 0xF0)
        {
            length = 4;
            // Removing the mask of the first byte.
            buffer[0] = buffer[0] & 0x7;
        }

        length--;

        for (let i : number = 0; i <= length; i++)
        {
            if ((buffer[i] & 0xC0) == 0x80 || i == 0)
            {
                // Removing the mask.
                buffer[i] = buffer[i] & 0x3F;
                // Moving the byte to the propper position.
                result += buffer[i] << ((length - i) * 8) >> ((length - i) * 2);
            }
            else
            {
                throw new SyntaxError('The given character isn\'t a valid UTF-8-character.');
            }
        }
        return result;
    }

    /**
     * Returns a new string that right-aligns the characters in this instance by padding them on the left with a specified Unicode character, for a specified total length.
     * 
     * @param subject
     * The subject to pad.
     * 
     * @param totalWidth
     * The number of characters in the resulting string, equal to the number of original characters plus any additional padding characters.
     * 
     * @param paddingChar
     * A Unicode padding character.
     */
    public static PadLeft(subject : string, totalWidth : number, paddingChar : string)
    {
        for (let i : number = subject.length; i < totalWidth; i++)
        {
            subject = paddingChar + subject;
        }
        return subject;
    }

    /**
     * Converts a number to a hexadecimal string.
     * 
     * @param subject
     * The number to convert.
     * 
     * @param size
     * The length of the string to return.
     */
    public static DecToHexString(subject : number, length : number = 2) : string
    {
        return this.PadLeft(subject.toString(16), length, '0');
    }
}