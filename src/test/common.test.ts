import { CommonTests } from "../tests/common/index.js";
import { CommonHooks } from "./CommonHooks.js";

suite(
    "Common Tests",
    () =>
    {
        let context = CommonHooks();
        CommonTests(context);
    });
