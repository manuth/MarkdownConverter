import * as FS from 'fs';
import { Base } from "./Core/Base";
import { Document } from "./Document";

/**
 * Provides a markdown-converter.
 */
export class Converter extends Base
{
    /**
     * The document which is to be converted.
     */
    private document : Document;

    /**
     * Initializes a new instance of the Constructor class with a filepath.
     * 
     * @param document
     * The document which is to be converted.
     */
    constructor(document : Document)
    {
        super();
    }
}