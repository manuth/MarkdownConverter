import Assert = require("assert");
import { Exception } from "../../../System/Exception";

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
                        Assert.ok(!exception.Message);
                        Assert.ok(!exception.InnerException);
                        exception = new Exception("hello");
                        Assert.strictEqual(exception.Message, "hello");
                        Assert.ok(!exception.InnerException);
                        exception = new Exception("hello", innerException);
                        Assert.strictEqual(exception.Message, "hello");
                        Assert.strictEqual(exception.InnerException, innerException);
                    });
            });
    });
