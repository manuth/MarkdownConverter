# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [MarkdownConverter v1.1.0]
### Breaking Changes
  - The `OutDir`-setting is now called `DestinationPath`
  - The `DestinationPath` is considered relative to the `DestinationOrigin`

## Changes
  - Documents located in sub-directories are now converted correctly  
    Thanks to [@mjwsteenbergen](https://github.com/mjwsteenbergen) for reporting the issue
  - People can now choose whether to consider the `DestinationPath` relative to the `WorkspaceFolder` or relative to the directory of the document-file.
  - Added a prompt for specifying a `DestinationPath` which is displayed when `MarkdownConverter` the `DestinationPath`, none or more than 1 workspace-folders are opened and the name of the file is untitled

## [MarkdownConverter v1.0.1]
### Changes
  - Allowed users to enable the default parser rather than the default stylesheets  
    Thanks to [@mjwsteenbergen](https://github.com/mjwsteenbergen) for his contribution
  - Renamed some settings
    - `markdownConverter.Document.Design.SystemStylesEnabled` => `markdownConverter.Parser.SystemParserEnabled`
    - `markdownConverter.Document.EmojiType` => `markdownConverter.Parser.EmojiType`
    - `markdownConverter.Document.Toc` => `markdownConverter.Parser.Toc`

## [MarkdownConverter v1.0.0]
### Changes
  - Replaced [PhantomJS](http://phantomjs.org/) by [puppeteer](https://github.com/GoogleChrome/puppeteer)
  - Provided the functionality to render local files
  - Provided the functionality to 
  - Reworked the path-handling of the settings
  - Reworked the code for better readability

## [MarkdownConverter v0.0.13]
### Changes
  - Beautified the system-stylesheet

## [MarkdownConverter v0.0.12]
### Changes
  - Reworked the settings and remove unnecessary settings
  - Fixed extension-provided styles
  - Improved path-handling for untitled files
  - Implemented localization using [`localizable-resources`](https://npmjs.org/package/localizable-resources)

## [MarkdownConverter v0.0.11]
### Changes
  - Renamed `MarkdownConverter` to `Markdown Converter`
  - Fixed Multi-Workspacefolder support

## [MarkdownConverter v0.0.10]
### Additions
  - Added support for Chinese headings

### Changes
  - Disabled `markdown-it`'s link policy

## [MarkdownConverter v0.0.9]
## Additions
  - Provided "table of content"-feature

## Changes
  - Made the rebuild-process platform-independent
  - Adjusted the way to open up files
  - Updated the sync-request-module

## [MarkdownConverter v0.0.8]
## Addotopms
  - Provided the functionallity to choose whether to embed or link certain css-files [#4](https://github.com/manuth/MarkdownConverter/issues/4)

### Changes
  - Reworked the PhantomJS-process [#1](https://github.com/manuth/MarkdownConverter/issues/1)
  - Adjusted the way to handle templates [#6](https://github.com/manuth/MarkdownConverter/issues/6)
  - Changed missleading error-messages [#7](https://github.com/manuth/MarkdownConverter/issues/7)

## [MarkdownConverter v0.0.7]
### Additions
  - Added TypeScript-definitions
  - Added PhantomJS-rebuild functionallity in order to build PhantomJS for the propper os. [#2](https://github.com/manuth/MarkdownConverter/issues/2)

### Changes
  - Adjusted the version-numbers
  - Improved the date-test for security-reasons

## MarkdownConverter v0.0.6
### Additions
  - Added FrontMatter-validation
  - Added JavaScript-logic-variables

### Changes
  - Improved the MarkDown-document-detection
  - Fixed the broken PageNumber and PageCount-variables

## MarkdownConverter v0.0.5
### Changes
  - Reworked the error-messages

## MarkdownConverter v0.0.4
### Changes
  - Removed test-code

## MarkdownConverter v0.0.3
## Additions
  - Added a new Icon
  - Added [Checkbox-Support](https://www.npmjs.com/package/markdown-it-checkbox)

### Changes
  - Reworked the README

## MarkdownConverter v0.0.2
  - First release

<!--- References -->
[MarkdownConverter v1.1.0]: https://github.com/manuth/MarkdownConverter/compare/v1.0.1...v1.1.0
[MarkdownConverter v1.0.1]: https://github.com/manuth/MarkdownConverter/compare/v1.0.0...v1.0.1
[MarkdownConverter v1.0.0]: https://github.com/manuth/MarkdownConverter/compare/v0.0.13...v1.0.0
[MarkdownConverter v0.0.13]: https://github.com/manuth/MarkdownConverter/compare/v0.0.12...v0.0.13
[MarkdownConverter v0.0.12]: https://github.com/manuth/MarkdownConverter/compare/v0.0.11...v0.0.12
[MarkdownConverter v0.0.11]: https://github.com/manuth/MarkdownConverter/compare/v0.0.10...v0.0.11
[MarkdownConverter v0.0.10]: https://github.com/manuth/MarkdownConverter/compare/v0.0.9...v0.0.10
[MarkdownConverter v0.0.9]: https://github.com/manuth/MarkdownConverter/compare/v0.0.8...v0.0.9
[MarkdownConverter v0.0.8]: https://github.com/manuth/MarkdownConverter/compare/v0.0.7...v0.0.8
[MarkdownConverter v0.0.7]: https://github.com/manuth/MarkdownConverter/compare/v0.0.4...v0.0.7