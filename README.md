# MarkdownConverter
A markdown-converter for [Visual Studio Code][VSCode]

## What's `MarkdownConverter`?
> MarkdownConverter is a Visual Studio Code-extension which allows you to export your Markdown-file as PDF-, HTML or Image-files.  
> It provides many features, such as DateTime-Formatting, configuring your own CSS-styles, setting Headers and Footers, FrontMatter and much more.

## Usage
 1. Set your desired conversion-types or skip this step to convert your markdown-file to `PDF`:
      - Open up your Visual Studio Code-Settings and set `markdownConverter.ConversionType` to an array of types:
        ```json
        {
          "markdownConverter.ConversionType": [
            "HTML",
            "PDF"
          ]
        }
        ```
 2. Optionally set the pattern for resolving the destination-path:
    ```json
    {
      "markdownConverter.DestinationPattern": "${workspaceFolder}/output/${dirname}/${basename}.${extension}"
    }
 3. Open up the command pallet (<kbd>Ctrl</kbd>, <kbd>Shift</kbd>+<kbd>P</kbd>) and search one of these commands:
    - `Markdown: Convert Document` (`Markdown: Dokument Konvertieren` in German) or `mco` (`mk` in German) for short
    - `Markdown: Convert all Documents` (`Markdown: Alle Dokumente konvertieren`) or `mcd` (`madk` in German) for short
    - `Markdown: Chain all Documents` (`Markdown: Alle Dokumente verketten`) or `mcad` (`madv` in German) for short 
 4. Press enter and wait for the process to finish

<!--- References -->
[VSCode]: https://code.visualstudio.com/