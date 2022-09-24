import { EssentialTests } from "../tests/essentials";
import { CommonHooks } from "./CommonHooks";

suite(
    "Essential Tests",
    () =>
    {
        CommonHooks();
        EssentialTests();
    });
