# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## MarkdownConverter v2.0.2
  - Fix malworking setting-parser

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v2.0.1...v2.0.2)

## MarkdownConverter v2.0.1
  - Added missing dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v2.0.0...v2.0.1)

## MarkdownConverter v2.0.0
### General
It's about time to publish another more verbose release.
This time I put lots of effort into `MarkdownConverter` to finish some features I wanted to add for a long time.

One of the most notable things I think you might find very useful is
that the destination-path is now fully customizable using the `DestinationPattern`-option.
The `DestinationPath` and `DestinationOrigin`-options have been dropped in favor of said option.

You might want to set the `DestinationPattern` to whatever pattern to save your documents to, like, for example:
```json
{
  "markdownConverter.DestinationPattern": "${workspaceFolder}/output/${dirname}/${basename}.${extension}"
}
```

Also, I finally added an option for converting all files at once and one for chaining all documents together.
These features make great use of the `DestinationPattern`-option as this makes very clear where to store converted files.

Another pretty nice thing is that now every single command reports each progress that's made.
This makes it easier to you to check whether the conversion's still running or what's causing trouble.

Continue reading to see what else changed.

Thank you guys for using `MarkdownConverter` and for keeping me motivated!
You guys are the best! 🎉

### Breaking Changes
  - Added the `DestinationPattern`-option for specifying a pattern for resolving the destination-path  
    You can use following epressions in the `DestinationPattern`:
    - `${workspaceFolder}`:  
      Either the path to the `workspace`, if any, or the directory which contains the document.
    - `${dirname}`:  
      The relative path from the `${workspaceFolder}` to the directory which contains the document.
    - `${basename}`:  
      The name of the document-file without extension.
    - `${extension}`:  
      The file-extension of the destination-datatype.
    - `${filename}`:  
      The name of the document-file with its original extension.
  - Dropped `DestinationPath` and `DestinationOrigin` in favor of `DestinationPattern`

### Other Changes
  - Prevented port-collisions when converting multiple files at once
  - Fixed the threading-issues by automatically disabling sandboxed mode if it fails  
    Special thanks to [@jkhsjdhjs](https://github.com/jkhsjdhjs) for reporting and also fixing this issue
  - Improved the exception-handling
  - Improved the stability of the code
  - Added a command `Convert All Documents` for converting all markdown-documents in the current workspace at once
  - Added a command `Chain All Documents` for chaining all markdown-documents in the current workspace and convert them afterwards
  - Added a fix for loading the VSCodes `markdown-it`-instance  
    Sadly VSCodes `markdown-it`-parser can only be loaded once a markdown-file has been opened.
    Thus a temporary, empty markdown-file will be opened once a conversion has started
    if the VSCode-parser has not been loaded yet.
  - Provided the functionality to convert to self-contained html-files
  - Added progress-report to every command

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v1.1.2...v2.0.0)

## MarkdownConverter v1.1.2
  - Implemented a clean way to handle files outside of the current workspace  
    Thanks to [@jkhsjdhjs](https://github.com/jkhsjdhjs) for reporting the issue

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v1.1.1...v1.1.2)

## MarkdownConverter v1.1.1
  - Fixed absolute path handling  
    Thanks to [@007pig](https://github.com/007pig) for reporting the issue

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v1.1.0...v1.1.1)

## MarkdownConverter v1.1.0
### Breaking Changes
  - The `OutDir`-setting is now called `DestinationPath`
  - The `DestinationPath` is considered relative to the `DestinationOrigin`

### Other
  - Documents located in sub-directories are now converted correctly  
    Thanks to [@mjwsteenbergen](https://github.com/mjwsteenbergen) for reporting the issue
  - People can now choose whether to consider the `DestinationPath` relative to the `WorkspaceFolder` or relative to the directory of the document-file.
  - Added a prompt for specifying a `DestinationPath` which is displayed when `MarkdownConverter` the `DestinationPath`, none or more than 1 workspace-folders are opened and the name of the file is untitled

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v1.0.0...v1.1.0)

## MarkdownConverter v1.0.1
  - Allowed users to enable the default parser rather than the default stylesheets  
    Thanks to [@mjwsteenbergen](https://github.com/mjwsteenbergen) for his contribution
  - Renamed some settings
    - `markdownConverter.Document.Design.SystemStylesEnabled` => `markdownConverter.Parser.SystemParserEnabled`
    - `markdownConverter.Document.EmojiType` => `markdownConverter.Parser.EmojiType`
    - `markdownConverter.Document.Toc` => `markdownConverter.Parser.Toc`

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v1.0.0...v1.0.1)

## MarkdownConverter v1.0.0
  - Replace [PhantomJS](http://phantomjs.org/) by [puppeteer](https://github.com/GoogleChrome/puppeteer)
  - Provide the functionality to render local files
  - Provide the functionality to 
  - Reworked the path-handling of the settings
  - Reworked the code for better readability

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.13...v1.0.0)

## MarkdownConverter v0.0.13
  - Reworked the system-stylesheet

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.12...v0.0.13)

## MarkdownConverter v0.0.12
  - Cleaned up all settings
  - Fixed extension-provides styles
  - Improved path-handling for untitled files
  - Implemented localization using [`localizable-resources`](https://npmjs.org/package/localizable-resources)

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.11...v0.0.12)

## Markdown Converter v0.0.11
- Renamed `MarkdownConverter` to `Markdown Converter`
- Fixed Multi-Workspacefolder support

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.10...v0.0.11)

## MakrdownConverter v0.0.10
- Added support for Chinese headings
- Disabled markdown-it's link policy

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.9...v0.0.10)

## MarkdownConverter v0.0.9
  - Made the rebuild-process platform-independent
  - Adjusted the way to open up files
  - Updated the sync-request-module
  - Added "table of content"-feature

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.8...v0.0.9)

## MarkdownConverter v0.0.8
  - Reworked the PhantomJS-process [#1](https://github.com/manuth/MarkdownConverter/issues/1)
  - Adjusted the way to handle templates [#6](https://github.com/manuth/MarkdownConverter/issues/6)
  - Provided the functionallity to choose whether to embed or link certain css-files [#4](https://github.com/manuth/MarkdownConverter/issues/4)
  - Patched missleading error-messages [#7](https://github.com/manuth/MarkdownConverter/issues/7)

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.7...v0.0.8)

## MarkdownConverter v0.0.7
  - Adjusted the version-numbers
  - Improved the date-test for security-reasons
  - Added TypeScript-definitions
  - Added PhantomJS-rebuild functionallity in order to build PhantomJS for the propper os. [#2](https://github.com/manuth/MarkdownConverter/issues/2)

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.6...v0.0.7)

## MarkdownConverter v0.0.6
  - Added malformated FrontMatter-Recognition
  - Improved the MarkDown-document-detection
  - Added JavaScript-logic-variables
  - Fixed the broken PageNumber and PageCount-variables

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.5...v0.0.6)

## MarkdownConverter v0.0.5
  - Reworked the error-messages

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.4...v0.0.5)

## MarkdownConverter v0.0.4
  - Added a new Icon
  - Reworked the README
  - Added [Checkbox-Support](https://www.npmjs.com/package/markdown-it-checkbox)

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.2...v0.0.4)

## MarkdownConverter v0.0.2
  - Improved the error-handling
  - Improved the stability of the code

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v0.0.1...v0.0.2)

## MarkdownConverter v0.0.1
  - Initial release

[Show differences](https://github.com/manuth/MarkdownConverter/compare/97826ca...v0.0.1)