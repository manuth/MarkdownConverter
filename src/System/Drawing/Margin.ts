/**
 * Represents a margin.
 */
export class Margin
{
    /**
     * The top margin.
     */
    private top : string = '1cm';

    /**
     * The right margin.
     */
    private right : string = '1cm';

    /**
     * The bottom margin.
     */
    private bottom : string = '1cm';

    /**
     * The left margin.
     */
    private left : string = '1cm';

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
    constructor(top? : string, right? : string, bottom? : string, left? : string)
    {
        if (top)
        {
            this.Top = top;
        }

        if (right)
        {
            this.Right = right;
        }

        if (bottom)
        {
            this.Bottom = bottom;
        }

        if (left)
        {
            this.Left = left;
        }
    }

    /**
     * Gets or sets the top margin.
     */
    public get Top() : string
    {
        return this.top;
    }
    public set Top(value : string)
    {
        this.top = value;
    }

    /**
     * Gets or sets the right margin.
     */
    public get Right() : string
    {
        return this.right;
    }
    public set Right(value : string)
    {
        this.right = value;
    }

    /**
     * Gets or sets the bottom margin.
     */
    public get Bottom() : string
    {
        return this.bottom;
    }
    public set Bottom(value : string)
    {
        this.bottom = value;
    }

    /**
     * Gets or sets the left margin.
     */
    public get Left() : string
    {
        return this.left;
    }
    public set Left(value : string)
    {
        this.left = value;
    }

    /**
     * Returns a JSON-object which represents the object.
     */
    public toJSON() : object
    {
        return {
            Top: this.Top,
            Right: this.Right,
            Bottom: this.Bottom,
            Left: this.Left
        };
    }
}