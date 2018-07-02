import * as ChildProcess from "child_process";
import * as Format from "string-template";
import * as FS from "fs-extra";
import * as Path from "path";
import { env, TextDocument, window } from "vscode";
import ConversionType from "./ConversionType";
import Converter from "./Converter";
import Document from "./System/Drawing/Document";
import UnauthorizedAccessException from "./System/UnauthorizedAccessException";
import Resources from "./System/ResourceManager";

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
        let doc: Document;

        doc = new Document();
        doc.Content = textDocument.getText();

        let converter = new Converter(doc);

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
                    Format(Resources.Get("SuccessMessage"), ConversionType[type], destination),
                    Resources.Get("OpenFileLabel")).then(
                        (label) =>
                        {
                            if (label === Resources.Get("OpenFileLabel"))
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
                                        window.showWarningMessage(Resources.Get("UnsupportetPlatformException"));
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
                    message = Format(Resources.Get("UnauthorizedAccessException"), e.Path);
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