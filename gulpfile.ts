import log = require("fancy-log");
import gulp = require("gulp");
import filter = require("gulp-filter");
import sourcemaps = require("gulp-sourcemaps");
import ts = require("gulp-typescript");
import lazyPipe = require("lazypipe");
import minimist = require("minimist");
import { Settings } from "./.gulp/Settings";
import "./.gulp/TaskFunction";

/**
 * The arguments passed by the user.
 */
let args = minimist(
    process.argv.slice(2),
    {
        string: [
            "mode"
        ],
        alias: {
            mode: "m"
        },
        default: {
            mode: "Release"
        }
    });

/**
 * The settings for building the project.
 */
let settings = new Settings(args["mode"]);

/**
 * The typescript-project.
 */
let project = ts.createProject(settings.ExtensionPath("tsconfig.json"));

/**
 * Builds the project in watched mode.
 */
export function Watch()
{
    let builder = Build;
    gulp.watch(
        settings.SourcePath("**", "*.ts"),
        function Build()
        {
            log.info("File change detected. Starting incremental compilation...");
            return builder();
        });

    settings.Watch = true;
    log.info("Starting compilation in watch mode...");
    builder();
}
Watch.description = "Builds the project in watched mode.";

/**
 * Builds the project.
 */
export function Build()
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
                log.info(`Found ${errorCount} errors. Watching for file changes.`);
            }
            else
            {
                ts.reporter.defaultReporter().finish(results);
            }

            results.transpileErrors = 0;
            results.optionsErrors = 0;
            results.syntaxErrors = 0;
            results.globalErrors = 0;
            results.semanticErrors = 0;
            results.declarationErrors = 0;
            results.emitErrors = 0;
        }
    };

    let builder = lazyPipe().pipe(
        sourcemaps.init
    ).pipe(
        project,
        reporter
    ).pipe(
        sourcemaps.write,
        "."
    ).pipe(
        filter,
        ["**", "!**/*.ts.map"]
    );

    return gulp.src(settings.SourcePath("**", "*.ts")).pipe(
        builder()
    ).pipe(
        gulp.dest(settings.DestinationPath())
    );
}
Build.description = "Builds the project";

export default Build;