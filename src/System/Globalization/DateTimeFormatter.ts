import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import * as path from 'path';
import Encoding from '../Text/Encoding';

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
    private locale: string = null;

    /**
     * The localizer to localize values.
     */
    private localize: any = null;

    /**
     * The path to load the localized values from.
     */
    private resourcePath: string = null;

    /**
     * The regular expression to replace the tokens.
     */
    private regex: RegExp = /d{1,4}|f{1,7}|F{1,7}|h{1,2}|H{1,2}|m{1,2}|M{1,4}|s{1,2}|t{1,2}|y{1,5}|\\.|'[^']*'/g;

    /**
     * Returns the tokens to replace.
     */
    private initializeTokens(date: Date, utc: boolean): { [id: string]: string }
    {
        let tokens: { [id: string]: string } = {
            ddd: this.localize(1, null).shortNames[date.getDay() + 1],
            dddd: this.localize(1, null).fullNames[date.getDay() + 1],
            MMM: this.localize(2, null).shortNames[date.getMonth()],
            MMMM: this.localize(2, null).fullNames[date.getMonth()],
            t: this.localize(3, null).shortNames[(date.getHours() < 12 ? 0 : 1)],
            tt: this.localize(3, null).fullNames[(date.getHours() < 12 ? 0 : 1)]
        }
        return tokens;
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
    constructor(locale: string = vscode.env.language, resourcePath: string = path.join(__dirname, '..', '..', '..', '..', 'Resources', 'Localization', 'DateTimeFormatter'))
    {
        if (locale)
        {
            this.Locale = locale;
        }

        if (resourcePath)
        {
            this.ResourcePath = resourcePath;
        }

        let localize: any = nls.config({ locale: locale })(path.join(resourcePath));
        this.localize = localize;
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
            case 'default':
            case 'fullDate':
                formatString = this.localize(0, null)[formatString];
                break;
        }

        formatString = formatString.replace(this.regex, function (match)
        {
            // Replacing 'fffffff'
            if (/^f+$/g.test(match))
            {
                return Encoding.PadLeft(date.getMilliseconds().toString(), match.length, '0');
            }
            // Replacing 'FFFFFFF'
            else if (/^F+$/g.test(match))
            {
                if (date.getMilliseconds() > 0)
                {
                    return Encoding.PadLeft(date.getMilliseconds().toString(), match.length, '0');
                }
                else
                {
                    return '';
                }
            }
            // Replacing 'd' and 'dd'
            else if (/^d{1,2}$/g.test(match))
            {
                return Encoding.PadLeft(date.getDate().toString(), match.length, '0');
            }
            // Replacing 'h' and 'hh'
            else if (/^h+$/g.test(match))
            {
                let hours = (date.getHours() % 12 || 12);
                return Encoding.PadLeft(hours.toString(), match.length, '0');
            }
            // Replacing 'H' and 'HH'
            else if (/^H+$/g.test(match))
            {
                return Encoding.PadLeft(date.getHours().toString(), match.length, '0');
            }
            // Replacing 'm' and 'mm'
            else if (/^m+$/g.test(match))
            {
                return Encoding.PadLeft(date.getMinutes().toString(), match.length, '0');
            }
            else if (/^M{1,2}$/g.test(match))
            {
                return Encoding.PadLeft((date.getMonth() + 1).toString(), match.length, '0');
            }
            // Replacing 's' and 'ss'
            else if (/^s+$/g.test(match))
            {
                return Encoding.PadLeft(date.getSeconds().toString(), match.length, '0');
            }
            // Replacing 'y' and 'yy'
            else if (/^y{1,2}$/g.test(match))
            {
                return Encoding.PadLeft(date.getFullYear().toString().slice(-2), match.length, '0');
            }
            // Replacing 'yyyyy'
            else if (/^y+$/g.test(match))
            {
                return Encoding.PadLeft(date.getFullYear().toString(), match.length, '0');
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
    public get Locale(): string
    {
        return this.locale;
    }
    public set Locale(value: string)
    {
        this.locale = value;
    }

    /**
     * Gets or sets the path to load the localized values from.
     */
    public get ResourcePath(): string
    {
        return this.resourcePath;
    }
    public set ResourcePath(value: string)
    {
        this.resourcePath = value;
    }
}