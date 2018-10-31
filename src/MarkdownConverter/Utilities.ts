import * as shell from "async-shelljs";

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
        let current: IteratorResult<string>;
        let iterator = this.TryGetUsername();
        
        do
        {
            current = await iterator.next();

            if (current.value !== null)
            {
                return current.value.trim();
            }
        }
        while (!current.done);

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
        return await shell.asyncExec("git config --global user.name");
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
        return await shell.asyncExec("osascript -e long user name of (system info)");
    }

    /**
     * A set of functions to figure out the user-name.
     */
    private static async* TryGetUsername()
    {
        yield Utilities.CheckEnv();

        yield* (async function*()
        {
            let methods: (() => Promise<string>)[] = [];
            methods.push(Utilities.CheckGit);

            if (process.platform === "win32")
            {
                methods.push(Utilities.CheckWmic);
            }

            if (process.platform === "darwin")
            {
                methods.push(Utilities.CheckOsaScript);
            }

            for (let method of methods)
            {
                try
                {
                    yield await method();
                }
                catch
                {
                    yield null;
                }
            }
        })();
    }
}