import browserify = require("browserify");
import log = require("fancy-log");
import FileSystem = require("fs-extra");
import gulp = require("gulp");
import filter = require("gulp-filter");
import sourcemaps = require("gulp-sourcemaps");
import terser = require("gulp-terser");
import ts = require("gulp-typescript");
import merge = require("merge-stream");
import minimist = require("minimist");
import { Server, Socket } from "net";
import PromiseQueue = require("promise-queue");
import parseArgsStringToArgv from "string-argv";
import Path = require("upath");
import buffer = require("vinyl-buffer");
import source = require("vinyl-source-stream");
import watchify = require("watchify");
import { Settings } from "./.gulp/Settings";
import "./.gulp/TaskFunction";

/**
 * The port to listen for stop-requests.
 */
const watchConnectorPort = 25123;

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
let options = ParseArgs(process.argv.slice(2));

/**
 * Parses the specified arguments.
 *
 * @param args
 * The arguments to parse.
 */
function ParseArgs(args: string[])
{
    return minimist(
        args,
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
}

/**
 * The settings for building the project.
 */
let settings = new Settings(options["target"]);

/**
 * Builds the project.
 */
export function Build()
{
    return settings.Debug ? Debug() : Release();
}

/**
 * Builds the project in watched mode.
 */
export let Watch: gulp.TaskFunction = (done) =>
{
    settings.Watch = true;
    Build();

    let server = new Server(
        (socket) =>
        {
            socket.on(
                "data",
                (data) =>
                {
                    let args = parseArgsStringToArgv(data.toString());
                    socket.destroy();

                    if (args[0] === "stop")
                    {
                        let options = ParseArgs(args.slice(1));

                        if (options["target"] === settings.Target)
                        {
                            server.close();
                            done();
                            process.exit();
                        }
                    }
                });
        });

    server.listen(watchConnectorPort);
};
Watch.description = "Builds the project in watched mode.";

/**
 * Executes the compilation for the Release-target.
 */
async function Release()
{
    let streams: Array<Promise<NodeJS.ReadWriteStream>> = [];
    let queue: PromiseQueue = new PromiseQueue();

    if (settings.Watch)
    {
        log.info(watchStartMessage);
    }

    let entries = [
        "extension.ts"
    ];

    let optionBase: browserify.Options = {
        ...watchify.args,
        node: true,
        ignoreMissing: true
    };

    {
        let errorMessages: string[] = [];

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

            bundler.plugin(
                require("tsify"),
                {
                    project: settings.ExtensionPath("tsconfig.json")
                }
            ).external(
                [
                    "mocha",
                    "vscode"
                ]);

            let bundle = async () =>
            {
                return new Promise<NodeJS.ReadWriteStream>(
                    (resolve) =>
                    {
                        let stream = bundler.bundle().on(
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
                            source(Path.changeExt(file, "js"))
                        ).pipe(
                            buffer()
                        ).pipe(
                            terser()
                        ).pipe(
                            gulp.dest(settings.DestinationPath())
                        );

                        stream.on(
                            "end",
                            () =>
                            {
                                if (settings.Watch && ((queue.getQueueLength() + queue.getPendingLength()) === 1))
                                {
                                    log.info(watchFinishMessage(errorMessages.length));
                                }

                                errorMessages.splice(0, errorMessages.length);
                                resolve(stream);
                            });
                    });
            };

            if (settings.Watch)
            {
                bundler.on(
                    "update",
                    () =>
                    {
                        if ((queue.getQueueLength() + queue.getPendingLength()) === 0)
                        {
                            log.info(incrementalMessage);
                        }

                        queue.add(
                            async () =>
                            {
                                return bundle();
                            });
                    });
            }

            let build = () => queue.add(bundle);
            build.displayName = Build.displayName;
            build.description = Build.description;
            streams.push(build());
        }
    }

    return merge(await Promise.all(streams)) as NodeJS.ReadWriteStream;
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
            (sourcemaps as any).mapSources(
                (sourcePath: string) =>
                {
                    let sourceFile = Path.resolve(settings.DestinationPath(), sourcePath);
                    let baseDir = settings.DestinationPath(Path.relative(settings.SourcePath(), Path.dirname(sourceFile)));
                    return Path.relative(baseDir, sourceFile);
                })
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
    }

    return builder();
}

/**
 * Cleans all builds.
 */
export async function Clean()
{
    await FileSystem.remove(settings.DestinationPath());
}

/**
 * Stops a watch-task.
 */
export async function Stop()
{
    try
    {
        await new Promise(
            (resolve, reject) =>
            {
                let client = new Socket();

                client.connect(
                    watchConnectorPort,
                    "localhost",
                    async () =>
                    {
                        client.write(`stop -t ${settings.Target}`);
                    });

                client.on("close", resolve);
                client.on("error", reject);
            });
    }
    catch
    {
        log.info("The specified task is not running.");
    }
}
Stop.description = "Stops a watch-task";

export default Build;