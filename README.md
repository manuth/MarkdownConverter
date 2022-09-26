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
  - [Including Markdown Fragment Files](#including-markdown-fragment-files)
  - [Creating Block-Level Custom Containers](#creating-block-level-custom-containers)
  - [Third Party Markdown Extensions](#third-party-markdown-extensions)
  - [Assets](#assets)
    - [CSS- and JavaScript-Files](#css--and-javascript-files)
      - [Insertion](#insertion)
    - [Pictures](#pictures)
  - [Settings](#settings)

## What is `MarkdownConverter`?
> MarkdownConverter is a Visual Studio Code-extension which allows you to export your Markdown-file as PDF-, HTML or Image-files.  
> It provides many features, such as DateTime-Formatting, configuring your own CSS-styles, custom JavaScript-files, setting Headers and Footers, FrontMatter and much more.

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
  * `Title`  
    Either the name of the document-file without extension or `Untitled`
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

Optionally, the `FormatDate` can be omitted:
```md
---
Date: 1291-08-01
---
Date taken from an attribute: {{ Date "dddd" }}

Predefined date: {{ CurrentDate "dddd" }}
```

By specifying the `markdownConverter.DefaultDateFormat`-setting, you can set the global default date-format which is applied to all documents by default:

```json
{
  "markdownConverter.DefaultDateFormat": "dddd, dd. MMMM yyyy"
}
```

You can override the default date-format for an individual document by adding a `DateFormat` attribute:

***Example:***
```md
---
DateFormat: dd. MMMM yyyy
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
    "Right": "{{ FormatDate CurrentDate \"HH:mm:ss\" }}"
  },
  "markdownConverter.Document.FooterContent": {
    "Center": "<span class=\"pageNumber\"></span>/<span class=\"totalPages\"></span>"
  }
}
```

The content of the individual header- and footer-sections can be overridden for an individual document using attributes:

```md
---
Header:
  Left: My Individual Company
  Right: John Doe
Footer:
  Center: {{ CurrentDate }}
---
# Test
This is a test.
```

If you'd like to have more control on what your headers and footers look like, you might want to adjust the `markdownConverter.Document.HeaderTemplate` and `markdownConverter.Document.FooterTemplate` options.

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

## Including Markdown Fragment Files
It is now possible to fragment the document in multiple sections and to merge them all into one. This way, it's possible to work on separate fragments at the same time without having to bear with conflicts during editing. Add fragments using this syntax:

```md
!!!include(file.md)!!!
```

## Creating Block-Level Custom Containers
MarkdownConverter allows you to apply CSS classes to specific parts of your document.
This feature can be used with the following syntax:

***Markdown file:***
```md
:::class

Text Here

:::
```

***CSS file:***
```css
div.class {
   // Custom CSS Here
}
```

## Third Party Markdown Extensions
If you want to use third party markdown-extensions in your documents (such as the [Markdown Preview Mermaid Support], [Markdown Footnote] or [Markdown Emoji]), you might want to install the extensions of your choice and enable the `markdownConverter.Parser.SystemParserEnabled` setting which makes `MarkdownConverter` use VSCode's built-in `markdown-it` parser with all markdown extensions enabled.

## Assets
### CSS- and JavaScript-Files
`MarkdownConverter` allows you to pass stylesheets and JavaScript-files which are added to the document.

Use the `markdownConverter.Assets.StyleSheets` and the `markdownConverter.Assets.Scripts` options for adding stylesheets and scripts.

You can choose the way to insert the stylesheet or script for each asset individually.

  * `Link` means adding a link to the asset
  * `Include` will copy the content of the asset into the document
  * `Default` will inherit the default behavior

```json
{
  "markdownConverter.Assets.StyleSheets": {
    "./css/styles.css": "Default",
    "/home/scott/styles.css": "Link",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css": "Include"
  },
  "markdownConverter.Assets.Scripts": {
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js": "Default"
  }
}
```

#### Insertion
Basically, there are two ways on how to add an asset to the document.
You can either add a link to the asset or have its content copied to the document.

You can choose how to treat assets by default based on their paths using the `markdownConverter.Assets.StyleInsertion` and the `markdownConverter.Assets.ScriptInsertion` options.

```json
{
  "markdownConverter.Assets.StyleInsertion": {
    "Link": "Link",
    "AbsolutePath": "Link",
    "RelativePath": "Include"
  },
  "markdownConverter.Assets.ScriptInsertion": {
    "Link": "Include",
    "AbsolutePath": "Include",
    "RelativePath": "Default"
  }
}
```

By default, `MarkdownConverter` will include assets located at absolute and relative paths and add links to assets located at URLs.

### Pictures
You might want to have pictures in `<img>`-tags included directly in your document using Base64-encoding.
The `markdownConverter.Assets.PictureInsertion`-option allows you to set whether to include pictures based on the nature of their paths:

```json
{
  "markdownConverter.Assets.PictureInsertion": {
    "Link": "Link",
    "AbsolutePath": "Include",
    "RelativePath": "Include"
  }
}
```

## Settings
This is a list of the most important settings. To see all of them, install the extension and have a look into the settings-dialogue of vscode.

  - `markdownConverter.ChromiumExecutablePath`:  
    Normally, `MarkdownConverter` will download a copy of Chromium. This option allows you to choose a custom chromium-executable instead.
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
  - `markdownConverter.Parser.Toc.Indicator`:  
    The regular expression to replace with the table of contents.
  - `markdownConverter.Document.Attributes`:  
    Using this setting you can specify default attributes which are applied to all your documents.
  - `markdownConverter.Document.HeaderContent` and `markdownConverter.Document.FooterContent`:  
    Allows you to set the content of the different sections of the header and the footer.
  - `markdownConverter.Document.HeaderTemplate` and `markdownConverter.Document.FooterTemplate`:  
    The html-sourcecode of the header and footer. Variable-substituion is supported here as well. Page-numbers and similar information can be included as described in the [puppeteer docs](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagepdfoptions).
  - `markdownConverter.Document.DefaultStyles`:  
    Allows you to disable the default styles. This might be useful if you want to create your own stylesheet from scratch.
  - `markdownConverter.Assets.StyleSheets`:  
    A set of stylesheets to include in your document.

<!--- References -->
[vscode]: https://github.com/microsoft/vscode
[Handlebars]: https://handlebarsjs.com/
[Markdown Preview Mermaid Support]: https://github.com/shd101wyy/vscode-markdown-preview-enhanced
[Markdown Footnote]: https://marketplace.visualstudio.com/items?itemName=houkanshan.vscode-markdown-footnote
[Markdown Emoji]: https://marketplace.visualstudio.com/items?itemName=bierner.markdown-emoji
