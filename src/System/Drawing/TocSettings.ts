import { MultiRange } from "multi-integer-range";
import { ListType } from "./ListType";

/**
 * Provides basic definitions of a table of contents.
 */
export class TocSettings
{
    /**
     * The class for the div containing the table of contents.
     */
    private class: string;

    /**
     * Heading-levels which are to be include.
     */
    private levels: MultiRange;

    /**
     * The RegExp that is to be replaced with the table of contents.
     */
    private indicator: RegExp;

    /**
     * The list-type of the table of contents.
     */
    private listType: ListType;

    /**
     * Initializes a new instance of the `TocSettingsClass`.
     * 
     * @param $class
     * The css-class of the toc-container.
     * 
     * @param levels
     * The levels to display inside the toc.
     * 
     * @param indicator
     * A regexp which should be replaced by the toc inside the document.
     */
    public constructor($class: string, levels: MultiRange = new MultiRange([]), indicator: RegExp, listType: ListType = ListType.Unordered)
    {
        this.class = $class;
        this.levels = levels;
        this.indicator = indicator;
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
    public get Levels(): MultiRange
    {
        return this.levels;
    }
    public set Levels(value: MultiRange)
    {
        this.levels = value;
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
}