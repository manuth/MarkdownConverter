# MarkdownConverter
A markdown-converter for [vscode][vscode]

## Table of Contents
- [MarkdownConverter](#markdownconverter)
  - [Table of Contents](#table-of-contents)
  - [What is `MarkdownConverter`?](#what-is-markdownconverter)
  - [Usage](#usage)
  - [Variable Substitution](#variable-substitution)
    - [Date-Formatting](#date-formatting)
      - [Custom Date-Formats](#custom-date-formats)
  - [Headers and Footers](#headers-and-footers)
  - [Including Table of Contents](#including-table-of-contents)
  - [Settings](#settings)

## What is `MarkdownConverter`?
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
    ```
 3. Open up the command pallet (<kbd>Ctrl</kbd>, <kbd>Shift</kbd>+<kbd>P</kbd>) and search one of these commands:
    - `Markdown: Convert Document` (`Markdown: Dokument Konvertieren` in German) or `mco` (`mk` in German) for short
    - `Markdown: Convert all Documents` (`Markdown: Alle Dokumente konvertieren`) or `mcd` (`madk` in German) for short
    - `Markdown: Chain all Documents` (`Markdown: Alle Dokumente verketten`) or `mcad` (`madv` in German) for short 
 4. Press enter and wait for the process to finish

Normally, `MarkdownConverter` will refuse to convert files which aren't recognized as markdown-files.  
If you don't like this behavior, you might want to set `markdownConverter.IgnoreLanguageMode` to `true`.

## Variable Substitution
Before the conversion, the markdown-file is preprocessed using [`Handlebars`][Handlebars]. Variables (such as `{{ Author }}`) are automatically replaced with the corresponding attribute-value.  
While attribute-names wrapped in 2 braces are HTML-escaped, attribute-names wrapped in 3 braces (for example `{{{ Content }}}`) aren't escaped allowing it to contain HTML-code.

***Example:***
```md
---
Title: "Test"
Author: "John Doe"
Content: "This is an <b>important</b> message"
---

## {{ Title }}
{{{ Content }}}

This page was written by {{ Author }}
```

Following attributes are predefined and may be overridden by the document-attributes:
  * `CreationDate`  
    A `Date`-value indicating the time of the creation of the markdown-file
  * `ChangeDate`  
    A `Date`-value indicating the time of the last change of the content of the markdown-file
  * `CurrentDate`  
    A `Date`-value representing the time of the conversion
  * `Author`  
    The assumed name of the author according to `GIT_AUTHOR_NAME`, `GIT_COMMITER_NAME`, `HGUSER`, `C9_USER`, `git`, `wmic` or `osascript`
  * Attributes declared inside the vscode-settings (see [Settings](#settings))

### Date-Formatting
`Date`-attributes are being formatted by default. `MarkdownConverter` allows you to customize the format of every individual date.

You can format an individual date by using the `FormatDate`-helper like this:

***Example:***
```md
# Test-Document
This is a test.

This document has been created by {{ Author }} at {{ FormatDate ChangeDate "HH:mm:ss" }}
```

You can override the default date-format for a document by adding a `DateFormat` attribute:

***Example:***
```md
---
DateFormat: dd mmmm yyyy
---
The current date is {{ CurrentDate }}
```

#### Custom Date-Formats
There are two predefined date-formats, namely `Default` and `FullDate`, which represent date-formats for your current locale.

If you use a specific date-format repeatedly you might want to specify a custom date-format using the `markdownConverter.DateFormats` setting (see [Settings](#settings)):

***settings.json***
```jsonc
{
  "markdownConverter.DateFormats": {
    "iso": "yyyy-MM-dd"
  }
}
```

***Example***
```
{{ FormatDate CurrentDate "iso" }}
```

## Headers and Footers
The `markdownConverter.Document.HeaderFooterEnabled`-setting allows you to enable or disable headers or footers. By default, the header and footer contains three sections: The left, the right and the centered section.

You can set the content of these sections using the `markdownConverter.Document.HeaderContent` and `markdownConverter.Document.FooterContent` options:

```json
{
  "markdownConverter.Document.HeaderContent": {
    "Left": "{{ Company }}",
    "Center": "{{ Author }}",
    "Right": "{{ FormatDate CurrentDate \"hh:mm:ss\" }}"
  },
  "markdownConverter.Document.FooterContent": {
    "Center": "<span class=\"pageNumber\"></span>/<span class=\"totalPages\"></span>"
  }
}
```

If you'd like to have more control on how your headers and footers look like, you might want to adjust the `markdownConverter.Document.HeaderTemplate` and `markdownConverter.Document.FooterTemplate` options.

## Including Table of Contents
The `MarkdownConverter` provides the functionality to create a table of contents at runtime.  
Set the `markdownConverter.Parser.Toc.Enabled` to `true` to enable the creation of a table of contents.

By default, the `markdown-it-table-of-contents` plugin looks for a line starting with `[[toc]]` and replaces it with a table of contents. You might want to set the `markdownConverter.Parser.Toc.Indicator` to a custom regular expression if you want to have something else replaced with the table of contents.

You can set the class of the table of contents list by setting the `markdownConverter.Parser.Toc.Class`. The `markdownConverter.Parser.Toc.ListType` allows you to set whether the table of contents should be rendered as a numbered list (`ol` => ordered list) or an unordered list (`ul`).

Furthermore, the `markdownConverter.Parser.Toc.Levels` allows you to choose which levels to include in the table of contents.

```json
{
  "markdownConverter.Parser.Toc.Enabled": true,
  "markdownConverter.Parser.Toc.Indicator": "\\[\\[\\s*MyToc\\s*\\]\\]",
  "markdownConverter.Parser.Toc.Class": "toc",
  "markdownConverter.Parser.Toc.ListType": "ol",
  "markdownConverter.Parser.Toc.Levels": "2-6"
}
```

## Settings
This is a list of the most important settings. To see all of them, install the extension and have a look into the settings-dialogue of vscode.

  - `markdownConverter.ChromiumArgs`:  
    Allows you to pass specific arguments to chromium for the conversion (such as `--no-sandbox` or `--disable-gpu`).
  - `markdownConverter.DestinationPattern`:  
    Allows you to specify a pattern for resolving the destination-path. Following variables are substituted:
    - `${workspaceFolder}`: Either the path to the `workspace` or the directory which contains the document.
    - `${dirname}` The relative path from the `${workspaceFolder}` to the directory which contains the document.
    - `${basename}`: The name of the document-file without extension.
    - `${extension}`: The file-extension of the destination-datatype.
    - `${filename}`: The name of the document-file.
  - `markdownConverter.ConversionType`:  
    The types to convert the markdown-document to.
  - `markdownConverter.DefaultDateFormat`:  
    The date-format to apply to all dates by default.
  - `markdownConverter.DateFormats`:  
    A set of names and their corresponding custom date-format.
  - `markdownConverter.Parser.SystemParserEnabled`:  
    This setting allows you to enable or disable the usage of `vscode`s internal markdown-parser. Using the internal markdown-parser might be very useful to you as it grants you access to all markdown-plugin extensions installed to your vscode.
  - `markdownConverter.Parser.Toc.Enabled`:  
    Allows you to automatically include a table-of-contents for your document in your converted files.
  - `markdownConverter.Document.Attributes`:  
    Using this setting you can specify default attributes which are applied to all your documents.
  - `markdownConverter.HeaderTemplate` and `markdownConverter.FooterTemplate`:  
    The html-sourcecode of the header- and footer-section. Variable-substituion is supported here as well. Page-numbers and similar information can be included as described in the [puppeteer docs](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagepdfoptions).
  - `markdownConverter.DefaultStyles`:  
    Allows you to disable the default styles. This might be useful if you want to create your own stylesheet from scratch.
  - `markdownConverter.StyleSheets`:  
    A set of stylesheets to include in your document.

<!--- References -->
[vscode]: https://github.com/microsoft/vscode
[Handlebars]: https://handlebarsjs.com/
