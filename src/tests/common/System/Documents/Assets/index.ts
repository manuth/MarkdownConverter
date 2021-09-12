import { AssetTests as AssetClassTests } from "./Asset.test";
import { StyleSheetTests } from "./StyleSheet.test";
import { WebScriptTests } from "./WebScript.test";

/**
 * Registers tests related to assets.
 */
export function AssetTests(): void
{
    suite(
        "Assets",
        () =>
        {
            AssetClassTests();
            StyleSheetTests();
            WebScriptTests();
        });
}
