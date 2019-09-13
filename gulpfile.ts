import browserify = require("browserify");
import log = require("fancy-log");
import gulp = require("gulp");
import filter = require("gulp-filter");
import sourcemaps = require("gulp-sourcemaps");
import ts = require("gulp-typescript");
import merge = require("merge-stream");
import minimist = require("minimist");
import Path = require("upath");
import buffer = require("vinyl-buffer");
import source = require("vinyl-source-stream");
import watchify = require("watchify");
import { Settings } from "./.gulp/Settings";
import "./.gulp/TaskFunction";

/**
 * The message that is printed when starting the compilation in watch mode.
 */
const watchStartMessage = "Starting compilation in watch mode...";

/**
 * The message that is printed when starting an incremental compilation.
 */
const incrementalMessage = "File change detected. Starting incremental compilation...";

/**
 * Generates the message that is printed after finishing a compilation in watch mode.
 *
 * @param errorCount
 * The number of errors which occurred.
 */
const watchFinishMessage = (errorCount: number) =>
{
    return `Found ${errorCount} errors. Watching for file changes.`;
};

/**
 * The arguments passed by the user.
 */
let args = minimist(
    process.argv.slice(2),
    {
        string: [
            "target"
        ],
        alias: {
            target: "t"
        },
        default: {
            target: "Debug"
        }
    });

/**
 * The settings for building the project.
 */
let settings = new Settings(args["target"]);

/**
 * Builds the project.
 */
export function Build()
{
    if (settings.Debug)
    {
        return Debug();
    }
    else
    {
        return Release();
    }
}

/**
 * Builds the project in watched mode.
 */
export function Watch()
{
    settings.Watch = true;
    Build();
}
Watch.description = "Builds the project in watched mode.";

/**
 * Executes the compilation for the Release-target.
 */
function Release()
{
    if (settings.Watch)
    {
        log.info(watchStartMessage);
    }

    let entries = [
        "extension.ts"
    ];

    let bundlers: { [entry: string]: browserify.BrowserifyObject } = {};
    let optionBase: browserify.Options = {
        ...watchify.args,
        node: true,
        ignoreMissing: true
    };

    for (let file of entries)
    {
        let bundler = browserify(
            {
                ...optionBase,
                basedir: Path.normalize(settings.DestinationPath(Path.dirname(file))),
                entries: [
                    Path.normalize(settings.SourcePath(file))
                ],
                standalone: Path.join(Path.dirname(file), Path.parse(file).name)
            });

        if (settings.Watch)
        {
            bundler = watchify(bundler);
        }

        bundlers[file] = bundler;
    }

    for (let bundler of entries.map((entry) => bundlers[entry]))
    {
        bundler.plugin(
            require("tsify"),
            {
                project: settings.ExtensionPath("tsconfig.json")
            }
        ).external(
            [
                "mocha",
                "shelljs",
                "vscode"
            ]);
    }

    /**
     * Builds the project.
     */
    // tslint:disable-next-line: completed-docs
    function build()
    {
        let buildProcessing = true;
        let errorMessages: string[] = [];
        let streams: NodeJS.ReadWriteStream[] = [];

        if (settings.Watch)
        {
            Promise.all(
                entries.map(
                    (entry) =>
                    {
                        return new Promise(
                            (resolve) =>
                            {
                                let listener = () =>
                                {
                                    bundlers[entry].removeListener("update", listener);
                                    resolve();
                                };

                                bundlers[entry].on("update", listener);
                            });
                    })
            ).then(
                () =>
                {
                    if (!buildProcessing)
                    {
                        log.info(incrementalMessage);
                        build();
                    }
                });
        }

        for (let file of entries)
        {
            let fileName = Path.changeExt(file, "js");
            let stream = bundlers[file].bundle().on(
                "error",
                (error) =>
                {
                    let message: string = error.message;
                    if (!errorMessages.includes(message))
                    {
                        errorMessages.push(message);
                        log.error(message);
                    }
                }
            ).pipe(
                source(fileName)
            ).pipe(
                buffer()
            );

            streams.push(stream);
        }

        let stream = merge(streams).pipe(
            gulp.dest(settings.DestinationPath())
        );

        if (settings.Watch)
        {
            stream.on(
                "end",
                () =>
                {
                    log.info(watchFinishMessage(errorMessages.length));
                    buildProcessing = false;
                });
        }

        return stream;
    }

    build.displayName = Build.displayName;
    build.description = Build.description;
    return build();
}
Build.description = "Builds the project";

/**
 * Executes the compilation for the Debug-target.
 */
function Debug()
{
    let project = ts.createProject(settings.ExtensionPath("tsconfig.json"));

    /**
     * Compiles a Debug-build.
     */
    let builder = () =>
    {
        let reporter: ts.reporter.Reporter = {
            error(error, typescript)
            {
                ts.reporter.defaultReporter().error(error, typescript);
            },

            finish(results)
            {
                if (settings.Watch)
                {
                    let errorCount =
                        results.transpileErrors +
                        results.optionsErrors +
                        results.syntaxErrors +
                        results.globalErrors +
                        results.semanticErrors +
                        results.declarationErrors +
                        results.emitErrors;
                    log.info(watchFinishMessage(errorCount));

                    results.transpileErrors = 0;
                    results.optionsErrors = 0;
                    results.syntaxErrors = 0;
                    results.globalErrors = 0;
                    results.semanticErrors = 0;
                    results.declarationErrors = 0;
                    results.emitErrors = 0;
                }
                else
                {
                    ts.reporter.defaultReporter().finish(results);
                }
            }
        };

        return gulp.src(settings.SourcePath("**", "*.ts")).pipe(
            sourcemaps.init()
        ).pipe(
            project(reporter)
        ).pipe(
            sourcemaps.write(".")
        ).pipe(
            filter(["**", "!**/*.ts.map"])
        ).pipe(
            gulp.dest(settings.DestinationPath())
        );
    };

    if (settings.Watch)
    {
        log.info(watchStartMessage);

        gulp.watch(
            settings.SourcePath("**", "*.ts"),
            function Build()
            {
                log.info(incrementalMessage);
                return builder();
            });

        builder();
    }

    return builder();
}

export default Build;