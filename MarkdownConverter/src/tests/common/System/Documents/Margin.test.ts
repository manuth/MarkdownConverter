import Assert = require("assert");
import { Margin } from "../../../../System/Documents/Margin";

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
            "constructor(string all)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let margin = new Margin(testValue2);
                        Assert.strictEqual(margin.Top, testValue2);
                        Assert.strictEqual(margin.Right, testValue2);
                        Assert.strictEqual(margin.Bottom, testValue2);
                        Assert.strictEqual(margin.Left, testValue2);
                    });
            });

        suite(
            "constructor(string vertical, string horizontal)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let margin = new Margin(testValue1, testValue4);
                        Assert.strictEqual(margin.Top, testValue1);
                        Assert.strictEqual(margin.Right, testValue4);
                        Assert.strictEqual(margin.Bottom, testValue1);
                        Assert.strictEqual(margin.Left, testValue4);
                    });
            });

        suite(
            "constructor(string top, string right, string bottom, string left)",
            () =>
            {
                test(
                    "Checking whether the values are set correctly…",
                    () =>
                    {
                        let margin = new Margin(testValue1, testValue2, testValue3, testValue4);
                        Assert.strictEqual(margin.Top, testValue1);
                        Assert.strictEqual(margin.Right, testValue2);
                        Assert.strictEqual(margin.Bottom, testValue3);
                        Assert.strictEqual(margin.Left, testValue4);
                    });
            });
    });