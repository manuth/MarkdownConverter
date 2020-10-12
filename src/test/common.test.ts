import { CommonTests } from "../tests/common";
import { CommonHooks } from "./CommonHooks";

suite(
    "Common Tests",
    () =>
    {
        let context = CommonHooks();
        CommonTests(context);
    });
