import * as ChildProcess from "child_process";
import CultureInfo from "culture-info";
import * as Format from "string-template";
import * as FS from "fs-extra";
import * as Path from "path";
import { env, TextDocument, window } from "vscode";
import ConversionType from "./ConversionType";
import Converter from "./Converter";
import Document from "./System/Drawing/Document";
import UnauthorizedAccessException from "./System/UnauthorizedAccessException";
import Settings from "./Properties/Settings";
import ResourceManager from "./Properties/ResourceManager";

/**
 * Provides the main logic of the extension
 */
export default class Program
{
    /**
     * Converts a markdown-file to other file-types
     */
    public static async Main(textDocument: TextDocument, types: ConversionType[], outDir: string, fileName: string): Promise<void>
    {
        let converter = new Converter(new Document());
        converter.Document.Content = textDocument.getText();
        converter.Document.FileName = textDocument.fileName;
        
        converter.Document.Quality = Settings.Default.ConversionQuality;
        converter.Document.EmojiType = Settings.Default.EmojiType;

        for (let key in Settings.Default.Attributes)
        {
            converter.Document.Attributes[key] = Settings.Default.Attributes[key];
        }

        converter.Document.Locale = new CultureInfo(Settings.Default.Locale);
        converter.Document.DateFormat = Settings.Default.DateFormat;

        converter.Document.Paper = Settings.Default.PaperFormat;

        converter.Document.HeaderFooterEnabled = Settings.Default.HeaderFooterEnabled;
        converter.Document.Header.Content = Settings.Default.HeaderTemplate;
        converter.Document.Footer.Content = Settings.Default.FooterTemplate;

        converter.Document.TocSettings = Settings.Default.TocSettings;

        if (Settings.Default.Template)
        {
            converter.Document.Template = Settings.Default.Template;
        }
        else if (Settings.Default.SystemStylesEnabled)
        {
            converter.Document.Template = (await FS.readFile(ResourceManager.Files.Get("SystemTemplate"))).toString();
        }

        converter.Document.HighlightStyle = Settings.Default.HighlightStyle;

        if (converter.Document.HighlightStyle !== "Default" && converter.Document.HighlightStyle !== "None" && converter.Document.HighlightStyle)
        {
            converter.Document.StyleSheets.push(Path.join(ResourceManager.Files.Get("HighlightJSStylesDir"), converter.Document.HighlightStyle + ".css"));
        }

        converter.Document.SystemStylesEnabled = Settings.Default.SystemStylesEnabled;

        for (let key in Settings.Default.StyleSheets)
        {
            converter.Document.StyleSheets.push(Settings.Default.StyleSheets[key]);
        }

        for (let type of types)
        {
            if (!FS.existsSync(outDir))
            {
                FS.mkdirpSync(outDir);
            }

            try
            {
                let extension: string;

                switch (type)
                {
                    case ConversionType.HTML:
                        extension = "html";
                        break;
                    case ConversionType.JPEG:
                        extension = "jpg";
                        break;
                    case ConversionType.PNG:
                        extension = "png";
                        break;
                    case ConversionType.PDF:
                    default:
                        extension = "pdf";
                        break;
                }

                let destination = Path.join(outDir, fileName + "." + extension);
                await converter.Start(type, destination);
                window.showInformationMessage(
                    Format(ResourceManager.Resources.Get("SuccessMessage"), ConversionType[type], destination),
                    ResourceManager.Resources.Get("OpenFileLabel")).then(
                        (label) =>
                        {
                            if (label === ResourceManager.Resources.Get("OpenFileLabel"))
                            {
                                switch (process.platform)
                                {
                                    case "win32":
                                        ChildProcess.exec(Format('"{0}"', destination));
                                        break;
                                    case "darwin":
                                        ChildProcess.exec(Format('bash -c \'open "{0}"\'', destination));
                                        break;
                                    case "linux":
                                        ChildProcess.exec(Format('bash -c \'xdg-open "{0}"\'', destination));
                                        break;
                                    default:
                                        window.showWarningMessage(ResourceManager.Resources.Get("UnsupportetPlatformException"));
                                        break;
                                }
                            }
                        });
            }
            catch (e)
            {
                let message = e.toString();
                if (e instanceof UnauthorizedAccessException)
                {
                    message = Format(ResourceManager.Resources.Get("UnauthorizedAccessException"), e.Path);
                }
                else
                {
                    throw e;
                }

                window.showErrorMessage(message);
            }
        }
    }
}