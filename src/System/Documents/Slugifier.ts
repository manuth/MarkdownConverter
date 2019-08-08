import Transliteration = require("transliteration");

/**
 * Provides the functionality to generate slugs.
 */
export class Slugifier
{
    /**
     * The already generated slugs.
     */
    private slugs: string[] = [];

    /**
     * Initializes a new instance of the `Slugifier` class.
     */
    public constructor()
    {
    }

    /**
     * Gets or sets the already generated slugs.
     */
    protected get Slugs(): string[]
    {
        return this.slugs;
    }
    protected set Slugs(value: string[])
    {
        this.slugs = value;
    }

    /**
     * Slugifies a text.
     *
     * @param text
     * The text that is to be slugified.
     */
    public CreateSlug(text: string): string
    {
        let baseName = this.Slugify(text);

        let counter = 1;
        let slug = baseName;

        while (this.Slugs.includes(slug))
        {
            slug = `${baseName}-${++counter}`;
        }

        this.Slugs.push(slug);
        return slug;
    }

    /**
     * Slugifies a text.
     *
     * @param text
     * The text that is to be slugified.
     */
    protected Slugify(text: string): string
    {
        return Transliteration.slugify(
            text,
            {
                lowercase: true,
                separator: "-",
                ignore: []
            });
    }
}