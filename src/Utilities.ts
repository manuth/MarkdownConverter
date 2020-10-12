import { exec } from "child_process";
import { promisify } from "util";

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
     *
     * @returns
     * The full name of the current user.
     */
    public static async GetFullName(): Promise<string>
    {
        let methods: Array<() => Promise<string>> = [];

        methods = [
            async () => this.CheckEnv(),
            async () => this.CheckGit()
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

                if (result)
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
     * Executes the command.
     *
     * @param command
     * The command to execute.
     *
     * @returns
     * The output of the command.
     */
    private static async ExecuteCommand(command: string): Promise<string>
    {
        let result = await promisify(exec)(command);

        if (result.stderr)
        {
            throw new Error(result.stderr);
        }
        else
        {
            return result.stdout;
        }
    }

    /**
     * Tries to figure out the username using environment-variables.
     *
     * @returns
     * The result of the environment-lookup.
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
     * Tries to figure out the username using git's global settings.
     *
     * @returns
     * The result of the git-lookup.
     */
    private static async CheckGit(): Promise<string>
    {
        return this.ExecuteCommand("git config --global user.name");
    }

    /**
     * Tries to figure out the username using wmic.
     *
     * @returns
     * The result of the wmic-lookup.
     */
    private static async CheckWmic(): Promise<string>
    {
        return (await this.ExecuteCommand('wmic useraccount where name="%username%" get fullname')).replace("FullName", "").trim();
    }

    /**
     * Tries to figure out the username using osascript.
     *
     * @returns
     * The result of the osascript-lookup.
     */
    private static async CheckOsaScript(): Promise<string>
    {
        return this.ExecuteCommand("osascript -e long user name of (system info)");
    }
}
