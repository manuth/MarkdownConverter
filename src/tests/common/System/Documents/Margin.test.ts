import { strictEqual } from "assert";
import { Margin } from "../../../../System/Documents/Margin";

/**
 * Registers tests for the {@link Margin `Margin`} class.
 */
export function MarginTests(): void
{
    suite(
        "Margin",
        () =>
        {
            let testValue1: string;
            let testValue2: string;
            let testValue3: string;
            let testValue4: string;

            suiteSetup(
                () =>
                {
                    testValue1 = "7mm";
                    testValue2 = "8m";
                    testValue3 = "87cm";
                    testValue4 = "19km";
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether all values of the margin can be set at once…",
                        () =>
                        {
                            let margin = new Margin(testValue2);
                            strictEqual(margin.Top, testValue2);
                            strictEqual(margin.Right, testValue2);
                            strictEqual(margin.Bottom, testValue2);
                            strictEqual(margin.Left, testValue2);
                        });

                    test(
                        "Checking whether horizontal and vertical values can be set…",
                        () =>
                        {
                            let margin = new Margin(testValue1, testValue4);
                            strictEqual(margin.Top, testValue1);
                            strictEqual(margin.Right, testValue4);
                            strictEqual(margin.Bottom, testValue1);
                            strictEqual(margin.Left, testValue4);
                        });

                    test(
                        "Checking whether the values can be set separately…",
                        () =>
                        {
                            let margin = new Margin(testValue1, testValue2, testValue3, testValue4);
                            strictEqual(margin.Top, testValue1);
                            strictEqual(margin.Right, testValue2);
                            strictEqual(margin.Bottom, testValue3);
                            strictEqual(margin.Left, testValue4);
                        });
                });
        });
}
