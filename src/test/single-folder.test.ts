import { SingleFolderTests } from "../tests/single-folder/index.js";
import { CommonHooks } from "./CommonHooks.js";

suite(
    "Tests for Visual Studio Code in Single-Folder Mode",
    () =>
    {
        let context = CommonHooks();
        SingleFolderTests(context);
    });
