import MarkdownIt from "markdown-it";
import { TextDocument } from "vscode";
import { Converter } from "../Conversion/Converter.js";
import { ConversionRunner } from "../System/Tasks/ConversionRunner.js";

/**
 * Provides an implementation of the {@link ConversionRunner `ConversionRunner`} class for testing.
 */
export class TestConversionRunner extends ConversionRunner
{
    /**
     * @inheritdoc
     *
     * @param document
     * The document to get the workspace-path for.
     *
     * @returns
     * The path to the workspace of the specified {@link document `document`}.
     */
    public override GetWorkspacePath(document: TextDocument): string
    {
        return super.GetWorkspacePath(document);
    }

    /**
     * @inheritdoc
     *
     * @param workspaceRoot
     * The path to the root of the workspace of the document.
     *
     * @param document
     * The document to convert.
     *
     * @returns
     * A converter generated according to the settings.
     */
    public override LoadConverter(workspaceRoot: string, document: TextDocument): Promise<Converter>
    {
        return super.LoadConverter(workspaceRoot, document);
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The parser.
     */
    public override LoadParser(): Promise<MarkdownIt>
    {
        return super.LoadParser();
    }

    /**
     * @inheritdoc
     *
     * @param converter
     * The converter to load the fragment for.
     *
     * @param source
     * Either the path to a file to load the source from or the source of the fragment.
     *
     * @returns
     * The content of the fragment.
     */
    public override async LoadFragment(converter: Converter, source: string): Promise<string>
    {
        return super.LoadFragment(converter, source);
    }
}
