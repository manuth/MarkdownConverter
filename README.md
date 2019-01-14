# MarkdownConverter
A markdown-converter for [Visual Studio Code][VSCode]

## What's `MarkdownConverter`?
> MarkdownConverter is a Visual Studio Code-extension which allows you to export your Markdown-file as PDF-, HTML or Image-files.  
> It provides many features, such as DateTime-Formatting, configuring your own CSS-styles, setting Headers and Footers, FrontMatter and much more.

## Usage
 1. Set your desired conversion-types or skip this step to convert your markdown-file to `PDF`:
      - Open up your Visual Studio Code-Settings and set `markdownConverter.ConversionType` to either your desired type or an array of types:  
        ```json
        {
          "markdownConverter.ConversionType": [
            "PNG"
          ]
        }
        ```
        or
        ```json
        {
          "markdownConverter.ConversionType": [
            "HTML",
            "PDF"
          ]
        }
        ```
 2. Open up the command pallet (<kbd>Ctrl</kbd>, <kbd>Shift</kbd>+<kbd>P</kbd>) and search for `Markdown: Convert Document` (`Markdown: Dokument Konvertieren` in German) or `mco` (`mk` in German) for short
 3. Press enter and wait for the process to finish

<!--- References -->
[VSCode]: https://code.visualstudio.com/