import { ListType } from "./ListType";
import { MultiRange } from 'multi-integer-range';

/**
 * Provides basic definitions of a table of contents.
 */
export class TocSettings
{
    /**
     * The class for the div containing the table of contents.
     */
    private class: string = "toc";

    /**
     * Heading-levels which are to be include.
     */
    private levels: number[] = [2, 3, 4, 5, 6];

    /**
     * The RegExp that is to be replaced with the table of contents.
     */
    private indicator: RegExp = /^\[\[\s*toc\s*\]\]/im;

    /**
     * The list-type of the table of contents.
     */
    private listType: ListType = ListType.ul;

    /**
     * Initializes a new instance of the TocSettings class.
     */
    constructor()
    {
    }

    /**
     * Gets or sets the class for the div containing the table of contents.
     */
    public get Class(): string
    {
        return this.class;
    }
    public set Class(value: string)
    {
        this.class = value;
    }

    /**
     * Gets or sets the heading-levels which are to be included.
     */
    public get Levels(): number[]
    {
        return this.levels;
    }
    public set Levels(value: number[])
    {
        this.levels = value;
    }

    /**
     * Gets or sets the heading-levels which are to be included.
     */
    public get LevelRange(): string
    {
        return new MultiRange(this.levels).toString();
    }
    public set LevelRange(value: string)
    {
        this.levels = new MultiRange(value).toArray();
    }

    /**
     * Gets or sets the RegExp that is to be replaced with the table of contents.
     */
    public get Indicator(): RegExp
    {
        return this.indicator;
    }
    public set Indicator(value: RegExp)
    {
        this.indicator = value;
    }

    /**
     * Gets or sets the list-type of the table of contents.
     */
    public get ListType(): ListType
    {
        return this.listType;
    }
    public set ListType(value: ListType)
    {
        this.listType = value;
    }

    /**
     * Returns a JSON-string which represents the object.
     */
    public toJSON(): string
    {
        return JSON.stringify({
            Class: this.Class,
            IncludeLevel: this.Levels
        });
    }
}