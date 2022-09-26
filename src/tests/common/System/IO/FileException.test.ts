import { notStrictEqual, ok, strictEqual } from "node:assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Random } from "random-js";
import { Resources } from "../../../../Properties/Resources.js";
import { FileException } from "../../../../System/IO/FileException.js";

/**
 * Registers tests for the {@link FileException `FileException`} class.
 */
export function FileExceptionTests(): void
{
    suite(
        nameof(FileException),
        () =>
        {
            let random: Random;
            let exception: FileException;
            let message: string;
            let path: string;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    message = random.string(10);
                    path = random.string(25);
                    exception = new FileException(message, path);
                });

            suite(
                nameof(FileException.constructor),
                () =>
                {
                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            ok(!exception.InnerException);
                            strictEqual(exception.Message, message);
                            strictEqual(exception.Path, path);
                        });
                });

            suite(
                nameof<FileException>((exception) => exception.Message),
                () =>
                {
                    setup(
                        () =>
                        {
                            exception = new FileException();
                        });

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
