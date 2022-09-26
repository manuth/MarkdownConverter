import { notStrictEqual, ok, strictEqual } from "node:assert";
import { CultureInfo } from "@manuth/resource-manager";
import { TempFile } from "@manuth/temp-files";
import { Resources } from "../../../../Properties/Resources.js";
import { FileNotFoundException } from "../../../../System/IO/FileNotFoundException.js";

/**
 * Registers tests for the {@link FileNotFoundException `FileNotFoundException`} class.
 */
export function FileNotFoundExceptionTests(): void
{
    suite(
        nameof(FileNotFoundException),
        () =>
        {
            let file: TempFile;
            let exception: FileNotFoundException;

            setup(
                () =>
                {
                    file = new TempFile();
                    exception = new FileNotFoundException(file.FullName);
                });

            teardown(
                () =>
                {
                    file.Dispose();
                });

            suite(
                nameof(FileNotFoundException.constructor),
                () =>
                {
                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            ok(!exception.InnerException);
                            strictEqual(exception.Path, file.FullName);
                        });
                });

            suite(
                nameof<FileNotFoundException>((exception) => exception.Message),
                () =>
                {
                    test(
                        "Checking whether a default message is set…",
                        () =>
                        {
                            ok(exception.Message);
                        });

                    test(
                        "Checking whether the message is localized…",
                        () =>
                        {
                            let germanMessage: string;
                            let englishMessage: string;

                            Resources.Culture = new CultureInfo("de");
                            germanMessage = exception.Message;
                            Resources.Culture = new CultureInfo("en");
                            englishMessage = exception.Message;
                            notStrictEqual(germanMessage, englishMessage);
                        });
                });
        });
}
