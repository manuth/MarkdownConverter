import { basename } from "path";
import { AssetTests as AssetClassTests } from "./Asset.test";
import { PictureSourceTests } from "./PictureSource.test";
import { StyleSheetTests } from "./StyleSheet.test";
import { WebScriptTests } from "./WebScript.test";

/**
 * Registers tests related to assets.
 */
export function AssetTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            AssetClassTests();
            StyleSheetTests();
            WebScriptTests();
            PictureSourceTests();
        });
}
