import Assert = require("assert");
import { CultureInfo } from "culture-info";
import { isNullOrUndefined } from "util";
import { Resources } from "../../../../Properties/Resources";
import { FileException } from "../../../../System/IO/FileException";

suite(
    "FileException",
    () =>
    {
        suite(
            "constructor(string message, string path)",
            () =>
            {
                test(
                    "Checking whether the values are assigned correctly…",
                    () =>
                    {
                        let exception = new FileException("hello", "world");
                        Assert.strictEqual(isNullOrUndefined(exception.InnerException), true);
                        Assert.strictEqual(exception.Message, "hello");
                        Assert.strictEqual(exception.Path, "world");
                    });

                test(
                    "Checking whether a default message is set…",
                    () =>
                    {
                        Assert.strictEqual(isNullOrUndefined(new FileException().Message), false);
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
                    "Checking whether the message is localized…",
                    () =>
                    {
                        let exception = new FileException(null, "world");
                        let germanMessage: string;
                        let englishMessage: string;

                        Resources.Culture = new CultureInfo("de");
                        germanMessage = exception.Message;
                        Resources.Culture = new CultureInfo("en");
                        englishMessage = exception.Message;
                        Assert.notEqual(germanMessage, englishMessage);
                    });
            });
    });