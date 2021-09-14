import { notStrictEqual, ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Resources } from "../../../../Properties/Resources";
import { FileException } from "../../../../System/IO/FileException";

/**
 * Registers tests for the {@link FileException `FileException`} class.
 */
export function FileExceptionTests(): void
{
    suite(
        nameof(FileException),
        () =>
        {
            let exception: FileException;

            setup(
                () =>
                {
                    exception = new FileException();
                });

            suite(
                nameof(FileException.constructor),
                () =>
                {
                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            let exception = new FileException("hello", "world");
                            ok(!exception.InnerException);
                            strictEqual(exception.Message, "hello");
                            strictEqual(exception.Path, "world");
                        });
                });

            suite(
                nameof<FileException>((exception) => exception.Message),
                () =>
                {
                    let originalLocale: CultureInfo;

                    suiteSetup(
                        () =>
                        {
                            originalLocale = Resources.Culture;
                        });

                    suiteTeardown(
                        () =>
                        {
                            Resources.Culture = originalLocale;
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
