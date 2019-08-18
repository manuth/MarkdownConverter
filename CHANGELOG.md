# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## MarkdownConverter Unreleased
  - Prevented port-collisions when converting multiple files at once

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v1.1.2...v1.2.0)

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

## Other
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