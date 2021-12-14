/**
 * Represents a MultiTable.
 */
 export class MultiTable
 {
    /**
     * The Multiline option.
     */
    private multiline: boolean;

    /**
     * The right option.
     */
    private rowspan: boolean;

    /**
     * The Headerless option.
     */
    private headerless: boolean;

    /**
     * Initializes a new instance of the {@link MultiTable `MultiTable`} class.
     *
     */
    public constructor();

    /**
     * Initializes a new instance of the {@link MultiTable `MultiTable`} class.
     *
     * @param multiline
     * The multiline option.
     *
     * @param rowspan
     * The right option.
     *
     * @param headerless
     * The bottom option.
     */
    public constructor(multiline: boolean, rowspan: boolean, headerless: boolean);

    /**
     * Initializes a new instance of the {@link MultiTable `MultiTable`} class.
     *
     * @param multiline
     * The multiline option.
     *
     * @param rowspan
     * The right option.
     *
     * @param headerless
     * The bottom option.
     */
    public constructor(multiline?: boolean, rowspan?: boolean, headerless?: boolean)
    {
        if (rowspan)
        {
            this.multiline = multiline;
        }

        if (rowspan)
        {
            this.rowspan = rowspan;
        }

        if (headerless)
        {
            this.headerless = headerless;
        }
    }

    /**
     * Gets or sets the multiline option.
     */
    public get Multiline(): boolean
    {
        return this.multiline;
    }

    /**
     * @inheritdoc
     */
    public set Multiline(value: boolean)
    {
        this.multiline = value;
    }

    /**
     * Gets or sets the rowspan option.
     */
    public get Rowspan(): boolean
    {
        return this.rowspan;
    }

    /**
     * @inheritdoc
     */
    public set Rowspan(value: boolean)
    {
        this.rowspan = value;
    }

    /**
     * Gets or sets the headerless option.
     */
    public get Headerless(): boolean
    {
        return this.headerless;
    }

    /**
     * @inheritdoc
     */
    public set Headerless(value: boolean)
    {
        this.headerless = value;
    }
}
