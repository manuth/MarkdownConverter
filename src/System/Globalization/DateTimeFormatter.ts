import CultureInfo from "culture-info";
import { ResourceManager } from "../../Properties/ResourceManager";
import { StringUtils } from "../Text/StringUtils";

/**
 * Gets a set of DateTime-string-tokens.
 */
let tokens: { [id: string]: string };

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
     * Returns the tokens to replace.
     */
    private GetTokens(date: Date): { [id: string]: string }
    {
        let day = date.getDay() - 1;

        if (day < 0)
        {
            day = 6;
        }

        let dateTimeTokens: { [id: string]: string } = {
            ddd: ResourceManager.Resources.Get("DateTime.DaysOfWeek.ShortNames", this.locale)[day],
            dddd: ResourceManager.Resources.Get("DateTime.DaysOfWeek.FullNames", this.locale)[day],
            MMM: ResourceManager.Resources.Get("DateTime.Months.ShortNames", this.locale)[date.getMonth()],
            MMMM: ResourceManager.Resources.Get("DateTime.Months.FullNames", this.locale)[date.getMonth()],
            t: ResourceManager.Resources.Get("DateTime.TimeDesignator.ShortNames", this.locale)[(date.getHours() < 12 ? 0 : 1)],
            tt: ResourceManager.Resources.Get("DateTime.TimeDesignator.FullNames", this.locale)[(date.getHours() < 12 ? 0 : 1)]
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
    public Format(formatString: string, date: Date = new Date()): string
    {
        tokens = this.GetTokens(date);

        try
        {
            formatString = ResourceManager.Resources.Get("DateTime.Formats." + formatString, this.locale);
        }
        catch
        {
        }

        formatString = formatString.replace(this.pattern, (match) =>
        {
            if (/^f+$/g.test(match))
            {
                return StringUtils.PadLeft(date.getMilliseconds().toString(), match.length, "0");
            }
            else if (/^F+$/g.test(match))
            {
                if (date.getMilliseconds() > 0)
                {
                    return StringUtils.PadLeft(date.getMilliseconds().toString(), match.length, "0");
                }
                else
                {
                    return "";
                }
            }
            else if (/^d{1,2}$/g.test(match))
            {
                return StringUtils.PadLeft(date.getDate().toString(), match.length, "0");
            }
            else if (/^h+$/g.test(match))
            {
                let hours = (date.getHours() % 12 || 12);
                return StringUtils.PadLeft(hours.toString(), match.length, "0");
            }
            else if (/^H+$/g.test(match))
            {
                return StringUtils.PadLeft(date.getHours().toString(), match.length, "0");
            }
            else if (/^m+$/g.test(match))
            {
                return StringUtils.PadLeft(date.getMinutes().toString(), match.length, "0");
            }
            else if (/^M{1,2}$/g.test(match))
            {
                return StringUtils.PadLeft((date.getMonth() + 1).toString(), match.length, "0");
            }
            else if (/^s+$/g.test(match))
            {
                return StringUtils.PadLeft(date.getSeconds().toString(), match.length, "0");
            }
            else if (/^y{1,2}$/g.test(match))
            {
                return StringUtils.PadLeft(date.getFullYear().toString().slice(-2), match.length, "0");
            }
            else if (/^y+$/g.test(match))
            {
                return StringUtils.PadLeft(date.getFullYear().toString(), match.length, "0");
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