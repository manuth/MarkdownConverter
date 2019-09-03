import Assert = require("assert");
import { CustomPaperFormat } from "../../../System/Documents/CustomPaperFormat";

suite(
    "CustomPaperFormat",
    () =>
    {
        suite(
            "constructor(string width, string height)",
            () =>
            {
                test(
                    "Checking whether the values are assigned correctly…",
                    () =>
                    {
                        let values: Partial<CustomPaperFormat> = {
                            Width: "187cm",
                            Height: "190cm"
                        };

                        let format = new CustomPaperFormat(values.Width, values.Height);
                        Assert.strictEqual(format.Width, values.Width);
                        Assert.strictEqual(format.Height, values.Height);
                    });
            });
    });