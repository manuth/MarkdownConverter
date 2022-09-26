import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { TestOptions } from "@vscode/test-electron/out/runTest.js";
import { SuiteSet } from "./SuiteSet.js";
import { SuiteVarName } from "./SuiteVarName.js";

/**
 * Provides the functionality to get configurations for specific {@link SuiteSet `SuiteSet`}s.
 */
export class ConfigStore
{
    /**
     * The base name of the vscode test directory.
     */
    private static readonly vscodeTestDir = ".vscode-test";

    /**
     * The path to the root of the project.
     */
    private static projectRoot = resolve(fileURLToPath(new URL(".", new URL(import.meta.url))), "..", "..");

    /**
     * The path to the root of the test files.
     */
    private static testRootPath = resolve(this.projectRoot, "lib", "test");

    /**
     * The path to the root of the test environments.
     */
    private static testEnvironmentRootPath = resolve(this.projectRoot, "src", "test");

    /**
     * The common options for running vscode.
     */
    private static commonOptions: TestOptions = null;

    /**
     * The suite sets and their corresponding options.
     */
    private static configurations: Partial<Record<SuiteSet, TestOptions>> = {};

    /**
     * Gets the common options for running vscode.
     */
    protected static get CommonOptions(): TestOptions
    {
        if (!this.commonOptions)
        {
            this.commonOptions = {
                extensionDevelopmentPath: resolve(this.ProjectRoot),
                extensionTestsPath: join(this.TestRootPath, "index.cjs")
            };
        }

        return this.commonOptions;
    }

    /**
     * Gets the path to the root of the project.
     */
    public static get ProjectRoot(): string
    {
        return this.projectRoot;
    }

    /**
     * Gets the path to the root of the test files.
     */
    public static get TestRootPath(): string
    {
        return this.testRootPath;
    }

    /**
     * Gets the path to the root of the test environments.
     */
    public static get TestEnvironmentRootPath(): string
    {
        return this.testEnvironmentRootPath;
    }

    /**
     * Gets the path to a single file.
     */
    public static get SingleFilePath(): string
    {
        return resolve(this.TestEnvironmentRootPath, "single-file", "Test.md");
    }

    /**
     * Gets the path to a single folder.
     */
    public static get SingleFolderPath(): string
    {
        return resolve(this.TestEnvironmentRootPath, "single-folder");
    }

    /**
     * Gets the path to a workspace.
     */
    public static get WorkspacePath(): string
    {
        return resolve(this.TestEnvironmentRootPath, "workspace", "workspace.code-workspace");
    }

    /**
     * Gets the options for the specified {@link suite `suite`}.
     *
     * @param suite
     * The suite to get the options for.
     *
     * @returns
     * The options for the specified {@link suite `suite`}.
     */
    public static Get(suite: SuiteSet): TestOptions
    {
        if (!(suite in this.configurations))
        {
            this.configurations[suite] = this.CreateConfiguration(suite);
        }

        return this.configurations[suite];
    }

    /**
     * Creates a configuration for the specified {@link suite `suite`}.
     *
     * @param suite
     * The suite to create the configuration for.
     *
     * @returns
     * A configuration for the specified {@link suite `suite`}.
     */
    protected static CreateConfiguration(suite: SuiteSet): TestOptions
    {
        let workingPath: string;

        switch (suite)
        {
            case SuiteSet.SingleFile:
                workingPath = this.SingleFilePath;
                break;
            case SuiteSet.Workspace:
                workingPath = this.WorkspacePath;
                break;
            default:
                workingPath = this.SingleFolderPath;
                break;
        }

        let vscodeTestDir = join(this.ProjectRoot, this.vscodeTestDir, suite);

        return {
            ...this.CommonOptions,
            extensionTestsEnv: {
                [SuiteVarName]: suite
            },
            launchArgs: [
                workingPath,
                `--extensions-dir=${join(vscodeTestDir, "extensions")}`,
                `--user-data-dir=${join(vscodeTestDir, "user-data")}`
            ]
        };
    }
}
