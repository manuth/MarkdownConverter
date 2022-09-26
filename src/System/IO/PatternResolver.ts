import template from "es6-template-string";
import path from "upath";
import { Progress, TextDocument } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType.js";
import { Resources } from "../../Properties/Resources.js";
import { IProgressState } from "../Tasks/IProgressState.js";
import { IPatternContext } from "./IPatternContext.js";

const { dirname, parse, relative } = path;

/**
 * Provides the functionality to resolve path-patterns.
 */
export class PatternResolver
{
    /**
     * The pattern to resolve.
     */
    private pattern: string;

    /**
     * A component for reporting progress.
     */
    private reporter: Progress<IProgressState>;

    /**
     * The variables inside the pattern.
     */
    private variables: Array<string | number | symbol>;

    /**
     * Initializes a new instance of the {@link PatternResolver `PatternResolver`} class.
     *
     * @param pattern
     * The pattern to resolve.
     *
     * @param reporter
     * A component for reporting progress.
     */
    public constructor(pattern: string, reporter?: Progress<IProgressState>)
    {
        let variables: Array<string | number | symbol> = [];
        this.pattern = pattern;
        this.reporter = reporter;

        let context: IPatternContext = {
            basename: "",
            extension: "",
            filename: "",
            dirname: "",
            workspaceFolder: ""
        };

        template(pattern, context);

        for (let key of Object.keys(context))
        {
            delete context[key as keyof IPatternContext];

            try
            {
                template(pattern, context);
            }
            catch
            {
                variables.push(key);
            }

            context[key as keyof IPatternContext] = "";
        }

        this.variables = variables;
    }

    /**
     * Gets the pattern to resolve.
     */
    public get Pattern(): string
    {
        return this.pattern;
    }

    /**
     * Gets the variables inside the pattern.
     */
    public get Variables(): ReadonlyArray<string | number | symbol>
    {
        return [...this.variables];
    }

    /**
     * Gets a component for reporting progress.
     */
    protected get Reporter(): Progress<IProgressState>
    {
        return this.reporter;
    }

    /**
     * Resolves the pattern.
     *
     * @param workspaceFolder
     * The path to the current workspace.
     *
     * @param document
     * The document to create the destination-path for.
     *
     * @param type
     * The type of the file to create the filename for.
     *
     * @returns
     * The resolved pattern.
     */
    public Resolve(workspaceFolder: string, document: TextDocument, type: ConversionType): string
    {
        let extension: string;
        let context: IPatternContext;
        let parsedPath = parse(document.fileName);

        switch (type)
        {
            case ConversionType.SelfContainedHTML:
            case ConversionType.HTML:
                extension = "html";
                break;
            case ConversionType.JPEG:
                extension = "jpg";
                break;
            case ConversionType.PNG:
                extension = "png";
                break;
            case ConversionType.PDF:
                extension = "pdf";
                break;
        }

        context = {
            filename: parsedPath.base,
            basename: parsedPath.name,
            extension,
            dirname: document.isUntitled ? "." : relative(workspaceFolder, dirname(document.fileName)),
            workspaceFolder
        };

        this.Reporter?.report(
            {
                message: Resources.Resources.Get("Progress.ResolveFileName")
            });

        let result = template(this.Pattern, context);
        return result;
    }
}
