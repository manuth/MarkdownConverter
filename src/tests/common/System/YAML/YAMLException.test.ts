import Assert = require("assert");
import { CultureInfo } from "culture-info";
import Dedent = require("dedent");
import fm = require("front-matter");
import { Resources } from "../../../../Properties/Resources";
import { Exception } from "../../../../System/Exception";
import { IMark } from "../../../../System/YAML/IMark";
import { YAMLException } from "../../../../System/YAML/YAMLException";

suite(
    "YAMLException",
    () =>
    {
        let yamlError: any;

        suiteSetup(
            () =>
            {
                try
                {
                    (fm as any)(
                        Dedent(
                            `
                            ---
                            this: is: an: invalid: YAML: string
                            ---`));
                }
                catch (error)
                {
                    yamlError = error;
                }
            });

        suite(
            "constructor(any exception)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let exception = new YAMLException(yamlError);
                        Assert.ok(exception.Name);
                        Assert.ok(exception.Message);
                        Assert.ok(exception.Mark);
                        Assert.ok(exception.Reason);
                    });
            });

        suite(
            "constructor(string name, string reason?, IMark mark?, string message?)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let name = "name";
                        let reason = "reason";
                        let mark: IMark = new Object() as any;
                        let message = "message";
                        let innerException = new Exception();
                        let exception = new YAMLException(name, reason, mark, message, innerException);
                        Assert.strictEqual(exception.Name, name);
                        Assert.strictEqual(exception.Message, message);
                        Assert.strictEqual(exception.Mark, mark);
                        Assert.strictEqual(exception.Reason, reason);
                        Assert.strictEqual(exception.InnerException, innerException);
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
                        let exception = new YAMLException(yamlError);
                        let germanMessage: string;
                        let englishMessage: string;
                        Resources.Culture = new CultureInfo("de");
                        germanMessage = exception.Message;
                        Resources.Culture = new CultureInfo("en");
                        englishMessage = exception.Message;
                        Assert.notStrictEqual(germanMessage, englishMessage);
                    });
            });
    });
