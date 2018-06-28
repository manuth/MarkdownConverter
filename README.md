# MarkdownConverter
Provides the functionallity to convert MarkDown-files to html, png, or pdf using [Visual Studio Code][VSCode].

## What's `MarkdownConverter`?
> MarkdownConverter is a Visual Studio Code-extension which allows you to export your Markdown-file as PDF-, HTML or Image-files.  
> It provides many features, such as DateTime-Formatting, configuring your own CSS-styles, setting Headers and Footers, FrontMatter and much more.

## Usages
 1. Set your desired conversion-types or skip this step to convert your markdown-file to `PDF`:
      - Open up your Visual Studio Code-Settings and set `markdownConverter.conversionType` to either your desired type or an array of types:  
        ```json
        {
          "markdownConverter.conversionType": "PNG"
        }
        ```
        or
        ```json
        {
          "markdownConverter.conversionType": [
            "HTML",
            "PDF"
          ]
        }
        ```
 2. Open up the command pallet (<kbd>Ctrl</kbd>, <kbd>Shift</kbd>+<kbd>P</kbd>) and search for `Markdown: Convert` (`Markdown: Konvertieren` in German) or `mco` (`mk` in German) for short
 3. Press enter and wait for the process to finish

# Known Issues
  - Dynamic Footer/Header-heights aren't supported by PhantomJS.  
    For that reason all Headers/Footers will have the height of the default Header/Footer.  
    I'm sorry...
  - Anchor-links are not working inside a PDF-document due to an issue of [Skia][AnchorIssue] (a graphics-engine maintained by google)

<!--- References -->
[VSCode]: https://code.visualstudio.com/
[AnchorIssue]: https://bugs.chromium.org/p/skia/issues/detail?id=7532