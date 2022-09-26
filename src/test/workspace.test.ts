import { WorkspaceTests } from "../tests/workspace/index.js";
import { CommonHooks } from "./CommonHooks.js";

suite(
    "Tests for Visual Studio Code in Workspace Mode",
    () =>
    {
        CommonHooks();
        WorkspaceTests();
    });
