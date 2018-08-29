import * as lodash from "lodash";
import * as MarkdownIt from "markdown-it";
import * as shell from "shelljs";

/**
 * Provides static methods.
 */
export class Utilities
{
    /**
     * The environment-variables which may contain the username.
     */
    private static envVars: string[] = [
        "GIT_AUTHOR_NAME",
        "GIT_COMMITTER_NAME",
        "HGUSER", // Mercurial
        "C9_USER" // Cloud9
    ];

    /**
     * The markdown-parser provided by `Visual Studio Code`.
     */
    private static vscodeParser: MarkdownIt.MarkdownIt;

    /**
     * Gets the full name of the current user.
     */
    public static get FullName(): string
    {
        let result: string;
        let current: IteratorResult<string>;
        let functionArray = this.functions();
        do
        {
            try
            {
                current = functionArray.next();
                result = current.value.trim();
            }
            catch (e) { }
        }
        while (!(current.done || result));

        return result;
    }

    /**
     * Gets the markdown-parser provided by `Visual Studio Code`.
     */
    public static get VSCodeParser(): MarkdownIt.MarkdownIt
    {
        return this.Clone(this.vscodeParser);
    }

    public static set VSCodeParser(value)
    {
        this.vscodeParser = value;
    }

    /**
     * Tries to figure out the username using wmic.
     */
    private static CheckWmic(): string
    {
        let fullname = shell.exec('wmic useraccount where name="%username%" get fullname').stdout.replace("FullName", "");
        return fullname;
    }

    /**
     * Tries to figure out the username using environment-variables.
     */
    private static CheckEnv(): string
    {
        let env = process.env;
        let varName = this.envVars.find(x => x in env);
        let fullname = varName && env[varName];

        return fullname;
    }

    /**
     * Tries to figure out the username using the npm-configuration
     */
    private static CheckAuthorName(): string
    {
        let fullname = require("rc")("npm")["init-author-name"];
        return fullname;
    }

    /**
     * Tries to figure out the username using git's global settings
     */
    private static CheckGit(): string
    {
        return shell.exec("git config --global user.name").stdout;
    }

    /**
     * Tries to figure out the username using osascript.
     */
    private static CheckOsaScript(): string
    {
        return shell.exec("osascript -e long user name of (system info)").stdout;
    }

    /**
     * A set of functions to figure out the user-name.
     */
    private static * functions()
    {
        yield this.CheckEnv();
        yield this.CheckAuthorName();
        if (process.platform === "win32")
        {
            yield this.CheckWmic();
        }

        if (process.platform === "darwin")
        {
            yield this.CheckOsaScript();
        }
        return this.CheckGit();
    }

    /**
     * Clones an object.
     * 
     * @param object
     * The object to clone.
     */
    public static Clone<T>(object: T): T
    {
        return lodash.cloneDeep<T>(object);
    }
}