import { strictEqual } from "assert";
import { Exception } from "../../../System/Exception";

/**
 * Registers tests for the {@link Exception `Exception`} class.
 */
export function ExceptionTests(): void
{
    suite(
        nameof(Exception),
        () =>
        {
            let exception: Exception;
            let innerException: Exception;

            suiteSetup(
                () =>
                {
                    innerException = new Exception();
                });

            suite(
                nameof(Exception.constructor),
                () =>
                {
                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            exception = new Exception();
                            strictEqual(exception.Message, null);
                            strictEqual(exception.InnerException, null);
                            exception = new Exception("hello");
                            strictEqual(exception.Message, "hello");
                            strictEqual(exception.InnerException, null);
                            exception = new Exception("hello", innerException);
                            strictEqual(exception.Message, "hello");
                            strictEqual(exception.InnerException, innerException);
                        });
                });
        });
}
