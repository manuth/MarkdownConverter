/**
 * Represents a margin.
 */
export class Margin
{
    /**
     * The top margin.
     */
    private top: string;

    /**
     * The right margin.
     */
    private right: string;

    /**
     * The bottom margin.
     */
    private bottom: string;

    /**
     * The left margin.
     */
    private left: string;

    /**
     * Initializes a new instance of the Margin class.
     *
     * @param all
     * The margin to apply on all sides.
     */
    public constructor(all: string);

    /**
     * Initializes a new instance of the Margin class.
     *
     * @param vertical
     * The margin to apply vertically.
     *
     * @param horizontal
     * The margin to apply horizontally.
     */
    public constructor(vertical: string, horizontal: string);

    /**
     * Initializes a new instance of the Margin class.
     *
     * @param top
     * The top margin.
     *
     * @param right
     * The right margin.
     *
     * @param bottom
     * The bottom margin.
     *
     * @param left
     * The left margin.
     */
    public constructor(top: string, right: string, bottom: string, left: string);

    /**
     * Initializes a new instance of the Margin class.
     *
     * @param top
     * The top margin.
     *
     * @param right
     * The right margin.
     *
     * @param bottom
     * The bottom margin.
     *
     * @param left
     * The left margin.
     */
    public constructor(top: string, right?: string, bottom?: string, left?: string)
    {
        this.top =
            this.right =
            this.bottom =
            this.left = top;

        if (right)
        {
            this.left = this.right = right;
        }

        if (bottom)
        {
            this.bottom = bottom;
        }

        if (left)
        {
            this.left = left;
        }
    }

    /**
     * Gets or sets the top margin.
     */
    public get Top(): string
    {
        return this.top;
    }

    /**
     * @inheritdoc
     */
    public set Top(value: string)
    {
        this.top = value;
    }

    /**
     * Gets or sets the right margin.
     */
    public get Right(): string
    {
        return this.right;
    }

    /**
     * @inheritdoc
     */
    public set Right(value: string)
    {
        this.right = value;
    }

    /**
     * Gets or sets the bottom margin.
     */
    public get Bottom(): string
    {
        return this.bottom;
    }

    /**
     * @inheritdoc
     */
    public set Bottom(value: string)
    {
        this.bottom = value;
    }

    /**
     * Gets or sets the left margin.
     */
    public get Left(): string
    {
        return this.left;
    }

    /**
     * @inheritdoc
     */
    public set Left(value: string)
    {
        this.left = value;
    }
}
