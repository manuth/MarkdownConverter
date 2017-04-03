# MarkdownConverter

Provides the functionallity to convert MarkDown-files to html, png, or pdf using Visual Studio Code.

## What's `MarkdownConverter`?

MarkdownConverter is a Visual Studio Code-extension which allows you to export your Markdown-file as PDF-, HTML or Image-files.  
It provides many features, such as DateTime-Formatting, configuring your own CSS-styles, setting Headers and Footers, FrontMatter and much more.

## Credits
 - [ShiyumiChan][Shiyu] - thanks for borrowing your English-skills
 - Yume for helping me a lot to create the [MarkdownConverter-Wiki][MarkdownConverterWiki]
 - [Regexr.com][RegexR]
 - [fullname]
 - [node-html-pdf] and [vscode-markdown-pdf] these two projects were my inspiration
 - Samuel - Thanks to him I could get started with implementing GitHub-emoji-support :tada: :tada:

## Usage

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
 2. Open up the command pallet (<kbd>Ctrl</kbd> + <kbd>P</kbd>) and search for `Markdown: Convert` (`Markdown: Konvertieren` in German) or `mco` (`mk` in German) for short
 3. Press enter and wait for the process to finish

## Features and more

If you have any further questions or want to know more about the features of MarkdownConverter have a look at the [MarkdownConverter-Wiki][MarkdownConverterWiki].

# Known Issues

  - Dynamic Footer/Header-heights aren't supported by PhantomJS.  
    For that reason all Headers/Footers will have the height of the default Header/Footer.  
    I'm sorry...

<!--- References -->
[Shiyu]: https://shiyumichan.deviantart.com/
[RegexR]: http://regexr.com/
[fullname]: https://www.npmjs.com/package/fullname
[node-html-pdf]: https://github.com/marcbachmann/node-html-pdf
[vscode-markdown-pdf]: https://github.com/yzane/vscode-markdown-pdf
[MarkdownConverterWiki]: https://github.com/manuth/MarkdownConverter/wiki