# MarkdownConverter
A markdown-converter for [vscode][vscode]

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
    ```
 3. Open up the command pallet (<kbd>Ctrl</kbd>, <kbd>Shift</kbd>+<kbd>P</kbd>) and search one of these commands:
    - `Markdown: Convert Document` (`Markdown: Dokument Konvertieren` in German) or `mco` (`mk` in German) for short
    - `Markdown: Convert all Documents` (`Markdown: Alle Dokumente konvertieren`) or `mcd` (`madk` in German) for short
    - `Markdown: Chain all Documents` (`Markdown: Alle Dokumente verketten`) or `mcad` (`madv` in German) for short 
 4. Press enter and wait for the process to finish

## Variable Substitution
Before the conversion, the markdown-file is preprocessed using [`Handlebars`][Handlebars]. Variables (such as `{{ Author }}`) are automatically replaced with the corresponding attribute-value.

***Example:***
```md
---
Title: "Test"
Author: "John Doe"
---

## {{ Title }}
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

## Date-Formatting
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

### Custom Date-Formats
There are two predefined date-formats, namely `Default` and `FullDate`, which represent date-formats for your current locale.

If you use a specific date-format repeatedly you might want to specify a custom date-format using the `markdownConverter.DateFormats` setting (see [Settings][#settings]):

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
