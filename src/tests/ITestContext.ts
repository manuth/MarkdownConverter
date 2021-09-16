/**
 * Represents a test-context.
 *
 * @template TSection
 * The type of the intercepted settings-section.
 */
export interface ITestContext<TSection extends any = any>
{
    /**
     * Gets or sets the intercepted settings.
     */
    Settings: Partial<TSection>;

    /**
     * Forces all settings to resolve to the default value.
     */
    Clear(): void;

    /**
     * Closes the active editor.
     */
    CloseActiveEditor(): Promise<void>;

    /**
     * Hides all editors.
     */
    CloseEditors(): Promise<void>;

    /**
     * Opens an untitled markdown-document.
     */
    OpenMarkdownDocument(): Promise<void>;

    /**
     * Opens a preview for the currently opened markdown-file.
     */
    OpenPreview(): Promise<void>;

    /**
     * Resets all changes made to the opened files.
     */
    ResetEditor(): Promise<void>;

    /**
     * Moves the focus to the first editor.
     */
    FocusFirstEditor(): Promise<void>;
}
