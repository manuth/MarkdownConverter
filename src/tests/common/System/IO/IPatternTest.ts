/**
 * Provides information for performing a pattern-test.
 */
export interface IPatternTest
{
    /**
     * The name of the template-variable to test.
     */
    VariableName: string;

    /**
     * The name of the workspace-folder.
     */
    WorkspaceFolder?: string;

    /**
     * The name of the file to test.
     */
    FileName?: string;

    /**
     * Creates a message for the pattern-test.
     *
     * @param pattern
     * The pattern to create a message for.
     */
    Message?(pattern: string): string;

    /**
     * Checks whether the {@link result `result`} is valid.
     *
     * @param result
     * The result of the test.
     */
    Test(result: string): Promise<void>;
}
