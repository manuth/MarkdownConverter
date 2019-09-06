import Assert = require("assert");
import Path = require("path");
import { Extension } from "../../../System/Extensibility/Extension";

suite(
    "Extension",
    () =>
    {
        let extension: Extension;

        suite(
            "constructor()",
            () =>
            {
                test(
                    "Checking whether the extension can be initialized correctly…",
                    () =>
                    {
                        extension = new Extension(Path.resolve(__dirname, "..", "..", "..", "..", ".."));
                    });
            });

        suite(
            "Author",
            () =>
            {
                test(
                    "Checking whether the author is resolved correctly…",
                    () =>
                    {
                        Assert.strictEqual(extension.Author, "manuth");
                    });
            });

        suite(
            "Name",
            () =>
            {
                test(
                    "Checking whether the extension-name is resolved correctly…",
                    () =>
                    {
                        Assert.strictEqual(extension.Name, "markdown-converter");
                    });
            });

        suite(
            "FullName",
            () =>
            {
                test(
                    "Checking whether the full extension-name is resolved correctly…",
                    () =>
                    {
                        Assert.strictEqual(extension.Name, "manuth.markdown-converter");
                    });
            });
    });