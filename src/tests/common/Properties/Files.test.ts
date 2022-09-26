import { ok } from "node:assert";
import fs from "fs-extra";
import { Files } from "../../../Properties/Files.js";

const { lstat, pathExists } = fs;

/**
 * Registers tests for the {@link Files `Files`} class.
 */
export function FilesTests(): void
{
    suite(
        nameof(Files),
        () =>
        {
            suite(
                nameof(Files.SystemStyle),
                () =>
                {
                    test(
                        "Checking whether the path points to an existing file…",
                        async () =>
                        {
                            ok(await pathExists(Files.SystemStyle));
                            ok((await lstat(Files.SystemStyle)).isFile());
                        });
                });

            suite(
                nameof(Files.DefaultHighlight),
                () =>
                {
                    test(
                        "Checking whether the path points to an existing file…",
                        async () =>
                        {
                            ok(await pathExists(Files.DefaultHighlight));
                            ok((await lstat(Files.DefaultHighlight)).isFile());
                        });
                });

            suite(
                nameof(Files.SystemTemplate),
                () =>
                {
                    test(
                        "Checking whether the path points to an existing file…",
                        async () =>
                        {
                            ok(await pathExists(Files.SystemTemplate));
                            ok((await lstat(Files.SystemTemplate)).isFile());
                        });
                });

            suite(
                nameof(Files.HighlightJSStylesDir),
                () =>
                {
                    test(
                        "Checking whether the path points to an existing directory…",
                        async () =>
                        {
                            ok(await pathExists(Files.HighlightJSStylesDir));
                            ok((await lstat(Files.HighlightJSStylesDir)).isDirectory());
                        });
                });
        });
}
