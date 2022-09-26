import { basename } from "node:path";
import { AssetTests as AssetClassTests } from "./Asset.test.js";
import { PictureSourceTests } from "./PictureSource.test.js";
import { StyleSheetTests } from "./StyleSheet.test.js";
import { WebScriptTests } from "./WebScript.test.js";

/**
 * Registers tests related to assets.
 */
export function AssetTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            AssetClassTests();
            StyleSheetTests();
            WebScriptTests();
            PictureSourceTests();
        });
}
