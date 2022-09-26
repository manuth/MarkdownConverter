import { CultureInfo } from "@manuth/resource-manager";
import { Resources } from "../../Properties/Resources.js";

/**
 * Provides the functionality to format a date.
 */
export class DateTimeFormatter
{
    /**
     * The locale to format the date in.
     */
    private locale: CultureInfo = null;

    /**
     * The pattern for replacing the tokens.
     */
    private pattern = /d{1,4}|f{1,7}|\.?F{1,7}|g{1,2}|h{1,2}|H{1,2}|m{1,2}|M{1,4}|s{1,2}|t{1,2}|y+|:|\/|o|\\.|'[^']*'|"[^"]*"|\\./g;

    /**
     * Initializes a new instance of the {@link DateTimeFormatter `DateTimeFormatter`} class.
     *
     * @param locale
     * The locale to format the date in.
     */
    public constructor(locale?: CultureInfo)
    {
        if (locale)
        {
            this.Locale = locale;
        }
    }

    /**
     * Gets or sets the locale to format the date in.
     */
    public get Locale(): CultureInfo
    {
        return this.locale;
    }

    /**
     * @inheritdoc
     */
    public set Locale(value: CultureInfo)
    {
        this.locale = value;
    }

    /**
     * Formats a date-value.
     *
     * @param formatString
     * The format-string to format the date-value.
     *
     * @param date
     * The date to format.
     *
     * @returns
     * The formatted date.
     */
    public Format(formatString: string, date: Date = new Date()): string
    {
        try
        {
            formatString = this.GetResource("Formats." + formatString);
        }
        catch
        { }

        formatString = formatString.replace(this.pattern, (match) =>
        {
            if (/^d{1,2}$/g.test(match))
            {
                return date.getDate().toString().padStart(match.length, "0");
            }
            else if (/^d{3,4}$/g.test(match))
            {
                let dayOfWeekKey = "DaysOfWeek";
                let dayOfWeek = date.getDay() - 1;

                if (dayOfWeek < 0)
                {
                    dayOfWeek = 6;
                }

                if (match === "ddd")
                {
                    return this.GetResource<string[]>(`${dayOfWeekKey}.ShortNames`)[dayOfWeek];
                }
                else
                {
                    return this.GetResource<string[]>(`${dayOfWeekKey}.FullNames`)[dayOfWeek];
                }
            }
            else if (/^f+$/g.test(match))
            {
                return date.getMilliseconds().toString().padStart(2, "0").padEnd(match.length, "0").slice(0, match.length);
            }
            else if (/^\.?F+$/g.test(match))
            {
                if (date.getMilliseconds() > 0)
                {
                    let prefix = match.replace(/^(\.?)F+$/g, "$1");
                    let result = match.replace(/^\.?(F+)$/g, "$1");
                    result = date.getMilliseconds().toString().slice(0, match.length).replace(/0*$/g, "");

                    if (result.length > 0)
                    {
                        return prefix + result;
                    }
                    else
                    {
                        return "";
                    }
                }
                else
                {
                    return "";
                }
            }
            else if (/^g+$/g.test(match))
            {
                return this.GetResource(`Era.${date.getFullYear() < 0 ? "Before" : "After"}`);
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
            else if (/^M{3,4}$/g.test(match))
            {
                let monthKey = "Months";
                let month = date.getMonth();

                if (match === "MMM")
                {
                    return this.GetResource<string[]>(`${monthKey}.ShortNames`)[month];
                }
                else
                {
                    return this.GetResource<string[]>(`${monthKey}.FullNames`)[month];
                }
            }
            else if (/^s+$/g.test(match))
            {
                return date.getSeconds().toString().padStart(match.length, "0");
            }
            else if (/^t+$/g.test(match))
            {
                let designatorKey = "TimeDesignator";
                let morningTime = date.getHours() < 12;

                if (match === "t")
                {
                    return this.GetResource<string[]>(`${designatorKey}.ShortNames`)[(morningTime ? 0 : 1)];
                }
                else
                {
                    return this.GetResource<string[]>(`${designatorKey}.FullNames`)[(morningTime ? 0 : 1)];
                }
            }
            else if (/^y{1,2}$/g.test(match))
            {
                return parseInt(Math.abs(date.getFullYear()).toString().slice(-2), 10).toString().padStart(match.length, "0");
            }
            else if (/^y+$/g.test(match))
            {
                return Math.abs(date.getFullYear()).toString().slice(-match.length).padStart(match.length, "0");
            }
            else if (/^:$/g.test(match))
            {
                return this.GetResource("TimeSeparator");
            }
            else if (/^\/$/g.test(match))
            {
                return this.GetResource("DateSeparator");
            }
            else if (/^'.*'|".*"$/g.test(match))
            {
                return match.slice(1, match.length - 1);
            }
            else if (/^\\.$/g.test(match))
            {
                return match[1];
            }
            return match;
        });

        return formatString;
    }

    /**
     * Gets a date-time resource.
     *
     * @template T
     * The type of the resource to get.
     *
     * @param name
     * The name of the resource to get.
     *
     * @returns
     * The date-time resource with the specified {@link name `name`}.
     */
    protected GetResource<T>(name: string): T
    {
        return Resources.Resources.Get(`DateTime.${name}`, this.Locale);
    }
}
