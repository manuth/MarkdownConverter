import { MultiRange } from "multi-integer-range";
import { ListType } from "./ListType.js";

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
     * The levels of the headings to include in the table of contents.
     */
    private levels: MultiRange;

    /**
     * The {@link RegExp `RegExp`} to replace with the table of contents.
     */
    private indicator: RegExp;

    /**
     * The list-type of the table of contents.
     */
    private listType: ListType;

    /**
     * Initializes a new instance of the {@link TocSettings `TocSettings`} class.
     *
     * @param className
     * The css-class of the toc-container.
     *
     * @param levels
     * The levels to display inside the toc.
     *
     * @param indicator
     * The {@link RegExp `RegExp`} to replace with the table of contents.
     *
     * @param listType
     * The list-type of the toc.
     */
    public constructor(className: string, levels: MultiRange = new MultiRange([]), indicator = /\[\[\s*toc\s*\]\]/g, listType: ListType = ListType.Unordered)
    {
        this.class = className;
        this.levels = levels;
        this.indicator = indicator;
        this.listType = listType;
    }

    /**
     * Gets or sets the class for the div containing the table of contents.
     */
    public get Class(): string
    {
        return this.class;
    }

    /**
     * @inheritdoc
     */
    public set Class(value: string)
    {
        this.class = value;
    }

    /**
     * Gets or sets the levels of the headings to include in the table of contents.
     */
    public get Levels(): MultiRange
    {
        return this.levels;
    }

    /**
     * @inheritdoc
     */
    public set Levels(value: MultiRange)
    {
        this.levels = value;
    }

    /**
     * Gets or sets the {@link RegExp `RegExp`} to be replace with the table of contents.
     */
    public get Indicator(): RegExp
    {
        return this.indicator;
    }

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
    public set ListType(value: ListType)
    {
        this.listType = value;
    }
}
