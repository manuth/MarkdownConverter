'use strict'
import * as shell from 'shelljs';
import { Base } from "./Base";

export class Fullname
{
    /**
     * The environment-variables which may contain the username.
     */
    private static envVars : string[] = [
        'GIT_AUTHOR_NAME',
        'GIT_COMMITTER_NAME',
        'HGUSER', // Mercurial
        'C9_USER' // Cloud9
    ];

    /**
     * Tries to figure out the username using wmic.
     */
    private static CheckWmic() : string
    {
        let fullname = shell.exec('wmic useraccount where name="%username%" get fullname').stdout.replace('FullName', '');
        return fullname;
    }

    /**
     * Tries to figure out the username using environment-variables.
     */
    private static CheckEnv() : string
    {
		let env = process.env;
		let varName = this.envVars.find(x => env[x]);
		let fullname = varName && env[varName];

		return fullname;
    }

    /**
     * Tries to figure out the username using the npm-configuration
     */
    private static CheckAuthorName() : string
    {
        let fullname = require('rc')('npm')['init-author-name'];
        return fullname;
    }

    /**
     * Tries to figure out the username using git's global settings
     */
    private static CheckGit() : string
    {
        return shell.exec('git config --global user.name');
    }

    /**
     * Tries to figure out the username using osascript.
     */
    private static CheckOsaScript() : string
    {
        return shell.exec('osascript -e long user name of (system info)');
    }

    /**
     * A set of functions to figure out the user-name.
     */
    public static* functions()
    {
        yield this.CheckEnv();
        yield this.CheckAuthorName();
    	if (process.platform === 'win32')
        {
		    yield this.CheckWmic();
	    }

        if (process.platform === 'darwin')
        {
            yield this.CheckOsaScript();
        }
        return this.CheckGit();
    }

    /**
     * Gets the full name of the current user.
     */
    public static get FullName() : string
    {
        let functionArray = this.functions();
        do
        {
            try
            {
                var current = functionArray.next();
                current.value = current.value.trim();
            }
            catch (e) { }
        }
        while(!(current.done || current.value));
        return current.value;
    }
    
}