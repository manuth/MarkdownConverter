import template = require("es6-template-string");
import format = require("string-template");
import { parse, relative, resolve } from "upath";
import { Progress, TextDocument } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType";
import { Resources } from "../../Properties/Resources";
import { IProgressState } from "../Tasks/IProgressState";
import { IPatternContext } from "./IPatternContext";

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
     * Initializes a new instance of the `PatternResolver` class.
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
     * @param documentRoot
     * The path to the folder containing the document.
     *
     * @param document
     * The document to create the destination-path for.
     *
     * @param type
     * The type of the file to create the filename for.
     *
     * @param destinationRoot
     * The path to the folder to resolve the pattern to.
     *
     * @returns
     */
    public Resolve(documentRoot: string, document: TextDocument, type: ConversionType, destinationRoot?: string): string
    {
        let extension: string;
        let context: IPatternContext;
        let parsedPath = parse(document.fileName);

        this.Reporter?.report(
            {
                message: format(Resources.Resources.Get("Progress.ConversionStarting"), ConversionType[type])
            });

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
            dirname: (destinationRoot !== null) ? relative(destinationRoot, documentRoot) : ".",
            workspaceFolder: destinationRoot
        };

        this.Reporter?.report(
            {
                message: Resources.Resources.Get("Progress.ResolveFileName")
            });

        let result = template(this.Pattern, context);

        if (destinationRoot)
        {
            result = resolve(destinationRoot, result);
        }

        return result;
    }
}
