import { notStrictEqual, ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import dedent from "dedent";
import fm from "front-matter";
import { Random } from "random-js";
import { Resources } from "../../../../Properties/Resources.js";
import { Exception } from "../../../../System/Exception.js";
import { IMarker } from "../../../../System/YAML/IMarker.js";
import { YAMLException } from "../../../../System/YAML/YAMLException.js";

/**
 * Registers tests for the {@link YAMLException `YAMLException`} class.
 */
export function YAMLExceptionTests(): void
{
    suite(
        nameof(YAMLException),
        () =>
        {
            let random: Random;
            let yamlError: any;

            suiteSetup(
                () =>
                {
                    random = new Random();

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
                nameof(YAMLException.constructor),
                () =>
                {
                    test(
                        "Checking whether an exception can be constructed based on a YAML-error…",
                        () =>
                        {
                            let exception = new YAMLException(yamlError);
                            ok(exception.Name);
                            ok(exception.Message);
                            ok(exception.Marker);
                            ok(exception.Reason);
                            strictEqual(exception.InnerException, yamlError);
                        });

                    test(
                        "Checking whether custom values can be passed…",
                        () =>
                        {
                            let name = random.string(10);
                            let reason = random.string(15);
                            let marker: IMarker = new Object() as any;
                            let message = random.string(25);
                            let innerException = new Exception();
                            let exception = new YAMLException(name, reason, marker, message, innerException);
                            strictEqual(exception.Name, name);
                            strictEqual(exception.Message, message);
                            strictEqual(exception.Marker, marker);
                            strictEqual(exception.Reason, reason);
                            strictEqual(exception.InnerException, innerException);
                        });
                });

            suite(
                nameof<YAMLException>((exception) => exception.Message),
                () =>
                {
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
