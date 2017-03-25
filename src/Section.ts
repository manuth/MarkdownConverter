/**
 * Represents a section of a document.
 */
import { Base } from "./Core/Base";

export class Section extends Base
{
    /**
     * The height of the section.
     */
    private height : string;

    /**
     * The content of the section.
     */
    private content : string;

    constructor(height : string = '', content : string = '')
    {
        super();
        if (height)
        {
            this.Height = height;
        }

        if (content)
        {
            this.Content = content;
        }
    }

    /**
     * Gets or sets the height of the section.
     */
    public get Height() : string
    {
        return this.height;
    }
    public set Height(value : string)
    {
        this.height = value;
    }
    
    /**
     * Gets or sets the content of the section.
     */
    public get Content() : string
    {
        return this.content;
    }
    public set Content(value : string)
    {
        this.content = value;
    }

    /**
     * Returns a JSON-string which represents the section.
     */
    public toJSON() : string
    {
        return JSON.stringify({
            Height: this.Height,
            Content: this.Content
        });
    }
}

/**
 * Represents a header.
 */
export class Header extends Section
{
}

/**
 * Represents a footer.
 */
export class Footer extends Section
{
}