import { EssentialTests } from "../tests/essentials/index.test.js";
import { CommonHooks } from "./CommonHooks.js";

suite(
    "Essential Tests",
    () =>
    {
        CommonHooks();
        EssentialTests();
    });
