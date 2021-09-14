import { SingleFolderTests } from "../tests/single-folder";
import { CommonHooks } from "./CommonHooks";

suite(
    "Tests for Visual Studio Code in Single-Folder Mode",
    () =>
    {
        let context = CommonHooks();
        SingleFolderTests(context);
    });
