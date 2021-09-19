import { WorkspaceTests } from "../tests/workspace";
import { CommonHooks } from "./CommonHooks";

suite(
    "Tests for Visual Studio Code in Workspace Mode",
    () =>
    {
        CommonHooks();
        WorkspaceTests();
    });
