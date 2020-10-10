import { notStrictEqual, ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Resources } from "../../../../Properties/Resources";
import { FileException } from "../../../../System/IO/FileException";

/**
 * Registers tests for the `FileException` class.
 */
export function FileExceptionTests(): void
{
    suite(
        "FileException",
        () =>
        {
            let exception: FileException;

            setup(
                () =>
                {
                    exception = new FileException();
                });

            suite(
                "constructor",
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
                "Message",
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
                            let customException = new FileException(null, "world");
                            let germanMessage: string;
                            let englishMessage: string;

                            Resources.Culture = new CultureInfo("de");
                            strictEqual(exception.Message, customException.Message);
                            germanMessage = exception.Message;
                            Resources.Culture = new CultureInfo("en");
                            strictEqual(exception.Message, customException.Message);
                            englishMessage = exception.Message;
                            notStrictEqual(germanMessage, englishMessage);
                        });
                });
        });
}
