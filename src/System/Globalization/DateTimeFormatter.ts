import Encoding from "../Text/Encoding";
import CultureInfo from "culture-info";
import Resources from "../ResourceManager";

/**
 * Gets a set of DateTime-string-tokens.
 */
let tokens: { [id: string]: string };

/**
 * Provides the functionallity to format a date.
 */
export default class DateTimeFormatter
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
     * Returns the tokens to replace.
     */
    private initializeTokens(date: Date, utc: boolean): { [id: string]: string }
    {
        let day = date.getDay() - 1;

        if (day < 0)
        {
            day = 6;
        }

        let dateTimeTokens: { [id: string]: string } = {
            ddd: Resources.Get("DateTime.DaysOfWeek.ShortNames", this.locale)[day],
            dddd: Resources.Get("DateTime.DaysOfWeek.FullNames", this.locale)[day],
            MMM: Resources.Get("DateTime.Months.ShortNames", this.locale)[date.getMonth()],
            MMMM: Resources.Get("DateTime.Months.FullNames", this.locale)[date.getMonth()],
            t: Resources.Get("DateTime.TimeDesignator.ShortNames", this.locale)[(date.getHours() < 12 ? 0 : 1)],
            tt: Resources.Get("DateTime.TimeDesignator.FullNames", this.locale)[(date.getHours() < 12 ? 0 : 1)]
        };
        return dateTimeTokens;
    }

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
     * Formats a date-value.
     * 
     * @param date
     * The date to format.
     * 
     * @param formatString
     * The format-string to format the date-value.
     */
    public Format(formatString: string, date: Date = new Date(), utc: boolean = false): string
    {
        tokens = this.initializeTokens(date, utc);

        switch (formatString)
        {
            case "Default":
            case "FullDate":
                formatString = Resources.Get("DateTime.Formats." + formatString, this.locale);
                break;
        }

        formatString = formatString.replace(this.pattern, (match) =>
        {
            // Replacing 'fffffff'
            if (/^f+$/g.test(match))
            {
                return Encoding.PadLeft(date.getMilliseconds().toString(), match.length, "0");
            }
            // Replacing 'FFFFFFF'
            else if (/^F+$/g.test(match))
            {
                if (date.getMilliseconds() > 0)
                {
                    return Encoding.PadLeft(date.getMilliseconds().toString(), match.length, "0");
                }
                else
                {
                    return "";
                }
            }
            // Replacing 'd' and 'dd'
            else if (/^d{1,2}$/g.test(match))
            {
                return Encoding.PadLeft(date.getDate().toString(), match.length, "0");
            }
            // Replacing 'h' and 'hh'
            else if (/^h+$/g.test(match))
            {
                let hours = (date.getHours() % 12 || 12);
                return Encoding.PadLeft(hours.toString(), match.length, "0");
            }
            // Replacing 'H' and 'HH'
            else if (/^H+$/g.test(match))
            {
                return Encoding.PadLeft(date.getHours().toString(), match.length, "0");
            }
            // Replacing 'm' and 'mm'
            else if (/^m+$/g.test(match))
            {
                return Encoding.PadLeft(date.getMinutes().toString(), match.length, "0");
            }
            else if (/^M{1,2}$/g.test(match))
            {
                return Encoding.PadLeft((date.getMonth() + 1).toString(), match.length, "0");
            }
            // Replacing 's' and 'ss'
            else if (/^s+$/g.test(match))
            {
                return Encoding.PadLeft(date.getSeconds().toString(), match.length, "0");
            }
            // Replacing 'y' and 'yy'
            else if (/^y{1,2}$/g.test(match))
            {
                return Encoding.PadLeft(date.getFullYear().toString().slice(-2), match.length, "0");
            }
            // Replacing 'yyyyy'
            else if (/^y+$/g.test(match))
            {
                return Encoding.PadLeft(date.getFullYear().toString(), match.length, "0");
            }
            // Replacing subjects listed in the 'tokens'-list
            else if (match in tokens)
            {
                return tokens[match];
            }
            return match;
        });
        return formatString;
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
}