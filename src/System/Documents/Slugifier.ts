import { slugify } from "transliteration";

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

    /**
     * @inheritdoc
     */
    protected set Slugs(value: string[])
    {
        this.slugs = value;
    }

    /**
     * Slugifies a text.
     *
     * @param text
     * The text that is to be slugified.
     *
     * @returns
     * The slugified text.
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
     * Resets the slugifier.
     */
    public Reset(): void
    {
        this.Slugs.splice(0, this.Slugs.length);
    }

    /**
     * Slugifies a text.
     *
     * @param text
     * The text that is to be slugified.
     *
     * @returns
     * The slugified text.
     */
    protected Slugify(text: string): string
    {
        return slugify(
            text,
            {
                lowercase: true,
                separator: "-",
                ignore: []
            });
    }
}
