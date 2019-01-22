import shell = require("async-shelljs");
import { isNullOrUndefined } from "util";

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
        "HGUSER",
        "C9_USER"
    ];

    /**
     * Gets the full name of the current user.
     */
    public static async GetFullName(): Promise<string>
    {
        let methods: (() => Promise<string>)[] = [];

        methods = [
            async () => this.CheckEnv(),
            this.CheckGit
        ];

        if (process.platform === "win32")
        {
            methods.push(this.CheckWmic);
        }
        else if (process.platform === "darwin")
        {
            methods.push(this.CheckOsaScript);
        }

        for (let method of methods)
        {
            try
            {
                let result = await method();

                if (!isNullOrUndefined(result))
                {
                    return result.trim();
                }
            }
            catch
            { }
        }

        return "";
    }

    /**
     * Tries to figure out the username using environment-variables.
     */
    private static CheckEnv(): string
    {
        let environment = process.env;
        let variableNames = this.envVars.filter(x => x in environment);

        for (let variableName of variableNames)
        {
            if (environment[variableName] !== null)
            {
                return environment[variableName];
            }
        }

        return null;
    }

    /**
     * Tries to figure out the username using git's global settings
     */
    private static async CheckGit()
    {
        return shell.asyncExec("git config --global user.name");
    }

    /**
     * Tries to figure out the username using wmic.
     */
    private static async CheckWmic()
    {
        return (await shell.asyncExec('wmic useraccount where name="%username%" get fullname')).replace("FullName", "").trim();
    }

    /**
     * Tries to figure out the username using osascript.
     */
    private static async CheckOsaScript()
    {
        return shell.asyncExec("osascript -e long user name of (system info)");
    }
}