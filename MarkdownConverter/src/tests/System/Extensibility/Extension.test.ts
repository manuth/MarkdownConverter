import Assert = require("assert");
import { isNullOrUndefined } from "util";
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
                        extension = new Extension();
                    });
            });
    });