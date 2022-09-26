import { notStrictEqual, ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Random } from "random-js";
import { Resources } from "../../../../Properties/Resources.js";
import { NoConversionTypeException } from "../../../../System/Tasks/NoConversionTypeException.js";

/**
 * Registers tests for the {@link NoConversionTypeException `NoConversionTypeException`} class.
 */
export function NoConversionTypeExceptionTests(): void
{
    suite(
        nameof(NoConversionTypeException),
        () =>
        {
            let random: Random;
            let exception: NoConversionTypeException;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    exception = new NoConversionTypeException();
                });

            suite(
                nameof(NoConversionTypeException.constructor),
                () =>
                {
                    let message: string;

                    setup(
                        () =>
                        {
                            message = random.string(10);
                        });

                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            exception = new NoConversionTypeException();
                            ok(exception.Message);
                            exception = new NoConversionTypeException(message);
                            strictEqual(exception.Message, message);
                        });
                });

            suite(
                nameof<NoConversionTypeException>((exception) => exception.Message),
                () =>
                {
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
