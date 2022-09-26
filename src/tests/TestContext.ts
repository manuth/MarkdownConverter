import { createRequire } from "module";
import vscode from "vscode";
import { ConfigInterceptor } from "./ConfigInterceptor.js";
import { ITestContext } from "./ITestContext.js";

const { commands, Uri, window } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Represents a test-context.
 *
 * @template TSection
 * The type of the intercepted settings-section.
 */
export class TestContext<TSection = any> implements ITestContext<TSection>
{
    /**
     * The config-interceptor of this context.
     */
    private interceptor: ConfigInterceptor<TSection>;

    /**
     * Initializes a new instance of the {@link TextContext `TextContext`}.
     *
     * @param interceptor
     * The config-interceptor of this context.
     */
    public constructor(interceptor: ConfigInterceptor<TSection>)
    {
        this.interceptor = interceptor;
    }

    /**
     * @inheritdoc
     */
    public get Settings(): Partial<TSection>
    {
        return this.interceptor.Settings;
    }

    /**
     * @inheritdoc
     */
    public set Settings(value: Partial<TSection>)
    {
        this.interceptor.Settings = value;
    }

    /**
     * @inheritdoc
     */
    public Clear(): void
    {
        this.interceptor.Clear();
    }

    /**
     * @inheritdoc
     */
    public async CloseActiveEditor(): Promise<void>
    {
        await commands.executeCommand("workbench.action.closeActiveEditor");
    }

    /**
     * @inheritdoc
     */
    public async CloseEditors(): Promise<void>
    {
        await commands.executeCommand("workbench.action.closeAllGroups");
    }

    /**
     * @inheritdoc
     */
    public async OpenMarkdownDocument(): Promise<void>
    {
        await window.showTextDocument(Uri.parse("untitled:.md"));
    }

    /**
     * @inheritdoc
     */
    public async OpenPreview(): Promise<void>
    {
        await commands.executeCommand("markdown.showPreview");
    }

    /**
     * @inheritdoc
     */
    public async ResetEditor(): Promise<void>
    {
        await commands.executeCommand("workbench.action.files.revert");
    }

    /**
     * @inheritdoc
     */
    public async FocusFirstEditor(): Promise<void>
    {
        await commands.executeCommand("workbench.action.focusFirstEditorGroup");
    }
}
