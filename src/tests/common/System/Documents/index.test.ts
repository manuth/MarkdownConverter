import { basename } from "node:path";
import { AssetTests } from "./Assets/index.test.js";
import { CustomPaperFormatTests } from "./CustomPageFormat.test.js";
import { DocumentTests as DocumentClassTests } from "./Document.test.js";
import { DocumentFragmentTests } from "./DocumentFragment.test.js";
import { MarginTests } from "./Margin.test.js";
import { MarkdownFragmentTests } from "./MarkdownFragment.test.js";
import { PaperTests } from "./Paper.test.js";
import { PluginTests } from "./Plugins/index.test.js";
import { RenderableTests } from "./Renderable.test.js";
import { RunningBLockTests as RunningBlockTests } from "./RunningBlock.test.js";
import { SlugifierTests } from "./Slugifier.test.js";
import { StandardizedPageFormatTests } from "./StandardizedPageFormat.test.js";
import { TocSettingTests } from "./TocSettings.test.js";

/**
 * Registers tests related to documents.
 */
export function DocumentTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            AssetTests();
            SlugifierTests();
            PluginTests();
            RenderableTests();
            DocumentFragmentTests();
            MarkdownFragmentTests();
            RunningBlockTests();
            StandardizedPageFormatTests();
            CustomPaperFormatTests();
            MarginTests();
            PaperTests();
            TocSettingTests();
            DocumentClassTests();
        });
}
