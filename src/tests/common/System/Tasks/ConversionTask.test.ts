import { rejects } from "node:assert";
import { ConversionType } from "../../../../Conversion/ConversionType.js";
import { ISettings } from "../../../../Properties/ISettings.js";
import { Exception } from "../../../../System/Exception.js";
import { ConversionTask } from "../../../../System/Tasks/ConversionTask.js";
import { ITestContext } from "../../../ITestContext.js";
import { TestConstants } from "../../../TestConstants.js";

/**
 * Registers tests for the {@link ConversionTask `ConversionTask`} class.
 *
 * @param context
 * The test-context.
 */
export function ConversionTaskTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(ConversionTask),
        () =>
        {
            let task: ConversionTask;

            suiteSetup(
                () =>
                {
                    task = new class extends ConversionTask
                    {
                        /**
                         * @inheritdoc
                         */
                        public get Title(): string
                        {
                            return "Test";
                        }

                        /**
                         * @inheritdoc
                         */
                        protected async ExecuteTask(): Promise<void>
                        { }
                    }(TestConstants.Extension);
                });

            suite(
                nameof<ConversionTask>((task) => task.Execute),
                () =>
                {
                    test(
                        `Checking whether an error is thrown if no \`${nameof(ConversionType)}\` was selected…`,
                        () =>
                        {
                            context.Settings.ConversionType = [];
                            rejects(() => task.Execute(), Exception);
                        });
                });
        });
}
