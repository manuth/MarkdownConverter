import { slugify } from "transliteration";

/**
 * Provides the functionality to generate slugs.
 */
export class Slugifier
{
    /**
     * The slugs that were generated so far.
     */
    private slugs: string[] = [];

    /**
     * Initializes a new instance of the {@link Slugifier `Slugifier`} class.
     */
    public constructor()
    {
    }

    /**
     * Gets or sets the slugs that were generated so far.
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
     * Creates a slug for the specified {@link text `text`}.
     *
     * @param text
     * The text to create a slug for.
     *
     * @returns
     * The slug for the specified {@link text `text`}.
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
     * Creates a slug for the specified {@link text `text`}.
     *
     * @param text
     * The text to create a slug for.
     *
     * @returns
     * The slug for the specified {@link text `text`}.
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
