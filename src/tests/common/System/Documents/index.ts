import { CustomPaperFormatTests } from "./CustomPageFormat.test";
import { DocumentTests as DocumentClassTests } from "./Document.test";
import { DocumentFragmentTests } from "./DocumentFragment.test";
import { MarginTests } from "./Margin.test";
import { PaperTests } from "./Paper.test";
import { RenderableTests } from "./Renderable.test";
import { SlugifierTests } from "./Slugifier.test";
import { StandardizedPaperFormatTests } from "./StandardizedPaperFormat.test";
import { TocSettingTests } from "./TocSettings.test";

/**
 * Registers tests related to documents.
 */
export function DocumentTests(): void
{
    suite(
        "Documents",
        () =>
        {
            SlugifierTests();
            RenderableTests();
            DocumentFragmentTests();
            StandardizedPaperFormatTests();
            CustomPaperFormatTests();
            MarginTests();
            PaperTests();
            TocSettingTests();
            DocumentClassTests();
        });
}
