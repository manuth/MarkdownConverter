import { EssentialTests } from "../tests/essentials/index.js";
import { CommonHooks } from "./CommonHooks.js";

suite(
    "Essential Tests",
    () =>
    {
        CommonHooks();
        EssentialTests();
    });
