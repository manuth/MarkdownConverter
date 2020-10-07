import { ok, strictEqual } from "assert";
import { Exception } from "../../../System/Exception";

/**
 * Registers tests for the `Exception` class.
 */
export function ExceptionTests(): void
{
    suite(
        "Exception",
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
                "constructor(string message?, Exception innerException?)",
                () =>
                {
                    test(
                        "Checking whether the values are assigned correctly…",
                        () =>
                        {
                            exception = new Exception();
                            ok(!exception.Message);
                            ok(!exception.InnerException);
                            exception = new Exception("hello");
                            strictEqual(exception.Message, "hello");
                            ok(!exception.InnerException);
                            exception = new Exception("hello", innerException);
                            strictEqual(exception.Message, "hello");
                            strictEqual(exception.InnerException, innerException);
                        });
                });
        });
}
