import { notStrictEqual, ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import dedent = require("dedent");
import fm = require("front-matter");
import { Resources } from "../../../../Properties/Resources";
import { Exception } from "../../../../System/Exception";
import { IMark } from "../../../../System/YAML/IMark";
import { YAMLException } from "../../../../System/YAML/YAMLException";

/**
 * Registers tests for the `YAMLException` class.
 */
export function YAMLExceptionTests(): void
{
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
                            dedent(
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
                "constructor",
                () =>
                {
                    test(
                        "Checking whether an exception can be constructed based on a YAML-error…",
                        () =>
                        {
                            let exception = new YAMLException(yamlError);
                            ok(exception.Name);
                            ok(exception.Message);
                            ok(exception.Mark);
                            ok(exception.Reason);
                        });

                    test(
                        "Checking whether custom values can be passed…",
                        () =>
                        {
                            let name = "name";
                            let reason = "reason";
                            let mark: IMark = new Object() as any;
                            let message = "message";
                            let innerException = new Exception();
                            let exception = new YAMLException(name, reason, mark, message, innerException);
                            strictEqual(exception.Name, name);
                            strictEqual(exception.Message, message);
                            strictEqual(exception.Mark, mark);
                            strictEqual(exception.Reason, reason);
                            strictEqual(exception.InnerException, innerException);
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
                            notStrictEqual(germanMessage, englishMessage);
                        });
                });
        });
}
