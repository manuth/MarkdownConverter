import { SingleFileTests } from "../tests/single-file";
import { CommonHooks } from "./CommonHooks";

suite(
    "Tests for Visual Studio Code in Single-File Mode",
    () =>
    {
        let context = CommonHooks();
        SingleFileTests(context);
    });
