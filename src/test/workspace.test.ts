import { WorkspaceTests } from "../tests/workspace";
import { CommonHooks } from "./CommonHooks";

suite(
    "Test for Visual Studio Code in Workspace Mode",
    () =>
    {
        CommonHooks();
        WorkspaceTests();
    });
