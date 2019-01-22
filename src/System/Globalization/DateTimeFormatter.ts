import { CultureInfo } from "localized-resource-manager";
import { Resources } from "../../Properties/Resources";

/**
 * Provides the functionallity to format a date.
 */
export class DateTimeFormatter
{
    /**
     * The locale to format the date.
     */
    private locale: CultureInfo = null;

    /**
     * The pattern for replacing the tokens.
     */
    private pattern: RegExp = /d{1,4}|f{1,7}|F{1,7}|h{1,2}|H{1,2}|m{1,2}|M{1,4}|s{1,2}|t{1,2}|y{1,5}|\\.|'[^']*'/g;

    /**
     * Initializes a new instance of the DateTimeFormatter class with a locale and a resource-path.
     *
     * @param locale
     * The locale to format the date.
     *
     * @param resourcePath
     * The path to load the localized values from.
     */
    constructor(locale?: CultureInfo)
    {
        if (locale)
        {
            this.Locale = locale;
        }
    }

    /**
     * Gets or sets the locale to format the date.
     */
    public get Locale(): CultureInfo
    {
        return this.locale;
    }

    public set Locale(value: CultureInfo)
    {
        this.locale = value;
    }

    /**
     * Formats a date-value.
     *
     * @param date
     * The date to format.
     *
     * @param formatString
     * The format-string to format the date-value.
     */
    public Format(formatString: string, date: Date = new Date()): string
    {
        let tokens = this.GetTokens(date);

        try
        {
            formatString = Resources.Resources.Get("DateTime.Formats." + formatString, this.locale);
        }
        catch
        {
        }

        formatString = formatString.replace(this.pattern, (match) =>
        {
            if (/^f+$/g.test(match))
            {
                return date.getMilliseconds().toString().padStart(match.length, "0");
            }
            else if (/^F+$/g.test(match))
            {
                if (date.getMilliseconds() > 0)
                {
                    return date.getMilliseconds().toString().padStart(match.length, "0");
                }
                else
                {
                    return "";
                }
            }
            else if (/^d{1,2}$/g.test(match))
            {
                return date.getDate().toString().padStart(match.length, "0");
            }
            else if (/^h+$/g.test(match))
            {
                let hours = (date.getHours() % 12 || 12);
                return hours.toString().padStart(match.length, "0");
            }
            else if (/^H+$/g.test(match))
            {
                return date.getHours().toString().padStart(match.length, "0");
            }
            else if (/^m+$/g.test(match))
            {
                return date.getMinutes().toString().padStart(match.length, "0");
            }
            else if (/^M{1,2}$/g.test(match))
            {
                return (date.getMonth() + 1).toString().padStart(match.length, "0");
            }
            else if (/^s+$/g.test(match))
            {
                return date.getSeconds().toString().padStart(match.length, "0");
            }
            else if (/^y{1,2}$/g.test(match))
            {
                return date.getFullYear().toString().slice(-2).padStart(match.length, "0");
            }
            else if (/^y+$/g.test(match))
            {
                return date.getFullYear().toString().padStart(match.length, "0");
            }
            else if (match in tokens)
            {
                return tokens[match];
            }
            return match;
        });

        return formatString;
    }

    /**
     * Returns the tokens to replace.
     */
    private GetTokens(date: Date = new Date()): { [id: string]: string }
    {
        let locale = this.Locale;
        let getDay = () =>
        {
            let day = date.getDay() - 1;

            if (day < 0)
            {
                day = 6;
            }

            return day;
        };

        let dateTimeTokens: { [id: string]: string } =
        {
            get ddd()
            {
                return Resources.Resources.Get<string[]>("DateTime.DaysOfWeek.ShortNames", locale)[getDay()];
            },

            get dddd()
            {
                return Resources.Resources.Get<string[]>("DateTime.DaysOfWeek.FullNames", locale)[getDay()];
            },

            get MMM()
            {
                return Resources.Resources.Get<string[]>("DateTime.Months.ShortNames", locale)[date.getMonth()];
            },

            get MMMM()
            {
                return Resources.Resources.Get<string[]>("DateTime.Months.FullNames", locale)[date.getMonth()];
            },

            get t()
            {
                return Resources.Resources.Get<string[]>("DateTime.TimeDesignator.ShortNames", locale)[(date.getHours() < 12 ? 0 : 1)];
            },

            get tt()
            {
                return Resources.Resources.Get<string[]>("DateTime.TimeDesignator.FullNames", locale)[(date.getHours() < 12 ? 0 : 1)];
            }
        };
        return dateTimeTokens;
    }
}