import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import * as path from 'path';
import { Base } from "./Base";

let tokens : { [id : string] : string };

/**
 * Provides the functionallity to format a date.
 */
export class DateTimeFormatter
{
    /**
     * The locale to format the date.
     */
    private locale : string = null;

    /**
     * The localizer to localize values.
     */
    private localize : any = null;

    /**
     * The path to load the localized values from.
     */
    private resourcePath : string = null;
    
    /**
     * The regular expression to replace the tokens.
     */
    private regex : RegExp = /d{1,4}|f{1,7}|F{1,7}|h{1,2}|H{1,2}|m{1,2}|M{1,4}|s{1,2}|t{1,2}|y{1,5}|\\.|'[^']*'/g;

    /**
     * Returns the tokens to replace.
     */
    private initializeTokens(date : Date, utc : boolean) : { [id : string] : string }
    {
        let tokens : { [id : string] : string } = {
            ddd: this.localize(1).shortNames[date.getDay() + 1],
            dddd: this.localize(1).fullNames[date.getDay() + 1],
            MMM: this.localize(2).shortNames[date.getMonth()],
            MMMM: this.localize(2).fullNames[date.getMonth()],
            t: this.localize(3).shortNames[(date.getHours() < 12 ? 0 : 1)],
            tt: this.localize(3).fullNames[(date.getHours() < 12 ? 0 : 1)]
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
    constructor(locale : string = vscode.env.language, resourcePath : string = path.join(__dirname, '..', '..', '..', 'Localization', 'DateTimeFormatter'))
    {
        if (locale)
        {
            this.Locale = locale;
        }
        
        if (resourcePath)
        {
            this.ResourcePath = resourcePath;
        }

		let localize : any = nls.config({ locale: locale })(path.join(resourcePath));
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
    public Format(formatString : string, date : Date = new Date(), utc : boolean = false) : string
    {
        tokens = this.initializeTokens(date, utc);

        switch (formatString)
        {
            case 'default':
            case 'fullDate':
                formatString = this.localize(0)[formatString];
                break;
        }

        formatString = formatString.replace(this.regex, function(match)
        {
            // Replacing 'fffffff'
            if (/^f+$/g.test(match))
            {
                return padLeft(date.getMilliseconds().toString(), match.length, '0');
            }
            // Replacing 'FFFFFFF'
            else if (/^F+$/g.test(match))
            {
                if (date.getMilliseconds() > 0)
                {
                    return padLeft(date.getMilliseconds().toString(), match.length, '0');
                }
                else
                {
                    return '';
                }
            }
            // Replacing 'd' and 'dd'
            else if (/^d{1,2}$/g.test(match))
            {
                return padLeft(date.getDate().toString(), match.length, '0');
            }
            // Replacing 'h' and 'hh'
            else if (/^h+$/g.test(match))
            {
                let hours = (date.getHours() % 12 || 12);
                return padLeft(hours.toString(), match.length, '0');
            }
            // Replacing 'H' and 'HH'
            else if (/^H+$/g.test(match))
            {
                return padLeft(date.getHours().toString(), match.length, '0');
            }
            // Replacing 'm' and 'mm'
            else if (/^m+$/g.test(match))
            {
                return padLeft(date.getMinutes().toString(), match.length, '0');
            }
            else if (/^M{1,2}$/g.test(match))
            {
                return padLeft((date.getMonth() + 1).toString(), match.length, '0');
            }
            // Replacing 's' and 'ss'
            else if (/^s+$/g.test(match))
            {
                return padLeft(date.getSeconds().toString(), match.length, '0');
            }
            // Replacing 'y' and 'yy'
            else if (/^y{1,2}$/g.test(match))
            {
                return padLeft(date.getFullYear().toString().slice(-2), match.length, '0');
            }
            // Replacing 'yyyyy'
            else if (/^y+$/g.test(match))
            {
                return padLeft(date.getFullYear().toString(), match.length, '0');
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
    public get Locale() : string
    {
        return this.locale;
    }
    public set Locale(value : string)
    {
        this.locale = value;
    }

    /**
     * Gets or sets the path to load the localized values from.
     */
    public get ResourcePath() : string
    {
        return this.resourcePath;
    }
    public set ResourcePath(value : string)
    {
        this.resourcePath = value;
    }
}

/**
 * Returns a new string that right-aligns the characters in this instance by padding them on the left with a specified Unicode character, for a specified total length.
 * 
 * @param totalWidth
 * The number of characters in the resulting string, equal to the number of original characters plus any additional padding characters.
 * 
 * @param paddingChar
 * A Unicode padding character.
 */
function padLeft(subject : string, totalWidth : number, paddingChar : string) : string
{
    for (let i : number = subject.length; i < totalWidth; i++)
    {
        subject = paddingChar + subject;
    }
    return subject;
}