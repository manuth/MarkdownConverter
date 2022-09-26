import { notStrictEqual, ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { Random } from "random-js";
import { Resources } from "../../../../Properties/Resources.js";
import { OperationCancelledException } from "../../../../System/OperationCancelledException.js";

/**
 * Registers tests for the {@link OperationCancelledException `OperationCancelledException`} class.
 */
export function OperationCancelledExceptionTests(): void
{
    suite(
        nameof(OperationCancelledException),
        () =>
        {
            let random: Random;
            let exception: OperationCancelledException;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    exception = new OperationCancelledException();
                });

            suite(
                nameof(OperationCancelledException.constructor),
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
                            exception = new OperationCancelledException();
                            ok(exception.Message);
                            exception = new OperationCancelledException(message);
                            strictEqual(exception.Message, message);
                        });
                });

            suite(
                nameof<OperationCancelledException>((exception) => exception.Message),
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
