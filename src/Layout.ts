import { Margin } from "./Margin";
import { Base } from "./Core/Base";

/**
 * Represents a document-layout.
 */
export class Layout extends Base
{
    /**
     * The margin.
     */
    private margin : Margin = new Margin();

    /**
     * The width.
     */
    private width : string = null;

    /**
     * The height.
     */
    private height : string = null;

    /**
     * The paper-format.
     */
    private format : string = 'A4';

    /**
     * The paper-orientation.
     */
    private orientation : string = 'portrait';

    /**
     * Paper-sizes
     */
    private static paperSizes = {
        A3: {
            Width: '297mm',
            Height: '42cm'
        },
        A4: {
            Width: '21cm',
            Height: '297mm'
        },
        A5: {
            Width: '148mm',
            Height: '21cm'
        },
        Legal: {
            Width: '8.5in',
            Height: '14.0in'
        },
        Letter: {
            Width: '8.5in',
            Height: '11.0in'
        },
        Tabloid: {
            Width: '11.0in',
            Height: '17.0in'
        }
    }

    /**
     * Initializes a new instance of the Layout class.
     */
    constructor()
    {
        super();
    }

    /**
     * Gets or sets the margin.
     */
    public get Margin() : Margin
    {
        return this.margin;
    }
    public set Margin(value : Margin)
    {
        this.margin = value;
    }

    /**
     * Gets or sets the width.
     */
    public get Width() : string
    {
        if (this.width)
        {
            return this.width;
        }
        else
        {
            return Layout.paperSizes[this.format][(this.orientation == 'landspace' ? 'Height' : 'Width')];
        }
    }
    public set Width(value : string)
    {
        this.width = value;
    }

    /**
     * Gets or sets the height.
     */
    public get Height() : string
    {
        if (this.height)
        {
            return this.height;
        }
        else
        {
            return Layout.paperSizes[this.format][(this.orientation == 'landspace' ? 'Width' : 'Height')];
        }
    }
    public set Height(value : string)
    {
        this.height = value;
    }

    /**
     * Gets or sets the paper-format.
     */
    public get Format() : string
    {
        if (!this.width && !this.height)
        {
            return this.format;
        }
        else
        {
            return null;
        }
    }
    public set Format(value : string)
    {
        if (!value || (value in Layout.paperSizes))
        {
            this.format = value;
        }
        else
        {
            throw new SyntaxError('The paper-format "' + value + '" isn\'t supported.');
        }
    }

    /**
     * Gets or sets the paper-orientation.
     */
    public get Orientation() : string
    {
        if (this.Width > this.Height)
        {
            return 'landspace';
        }
        else
        {
            return 'portrait';
        }
    }
    public set Orientation(value : string)
    {
        if (value == 'landspace' || value == 'portrait')
        {
            if (value != this.Orientation)
            {
                if (!this.Format)
                {
                    let width = this.Width;
                    let height = this.Height;

                    this.Width = height;
                    this.Height = width;
                }
                else
                {
                    this.orientation = value;
                }
            }
        }
        else
        {
            throw new SyntaxError('The paper-orientation "' + value + '" isn\'t supported.');
        }
    }

    /**
     * Returns an object which represents the 
     */
    public toJSON() : string
    {
        return JSON.stringify({
            Margin: this.Margin.toObject(),
            Width: this.Width,
            Height: this.Height,
            Format: this.Format,
            Orientation: this.Orientation
        });
    }
}