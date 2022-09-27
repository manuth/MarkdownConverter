# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## MarkdownConverter [Unreleased]
### Fixed
  - Windows compatiblility issues

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v5.2.0...dev)

## MarkdownConverter v5.2.0
### Fixed
  - Broken extension build
  - Incorrect code snippets in `README.md` (as indicated in [#174](https://github.com/manuth/MarkdownConverter/issues/174))  
    Thanks [@karmeye](https://github.com/karmeye)
  - `ConversionRunner`s behavior which caused Chromium instances to sometimes not close properly (as indicated in [#188](https://github.com/manuth/MarkdownConverter/issues/188))  
    Thanks [@nixtar](https://github.com/)

### Updated
  - Unit tests in order to improve stability
  - The extension's source code to the `ESModule` format
  - All dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v5.1.3...v5.2.0)

## MarkdownConverter v5.1.3
### Updated
  - All dependencies
  - Drone CI configuration for improving automated publishing
  - Deprecated `vscode-test` package
  - `tsconfig.json` files to improve development experience

### Removed
  - Dependabot workflows

### Added
  - Support for running unit-tests using the `Mocha Test Explorer`

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v5.1.2...v5.1.3)

## MarkdownConverter v5.1.2
### Fixed
  - Error preventing the extension from running at all  
    Thanks to [@DaveyJH](https://github.com/DaveyJH) for reporting

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v5.1.1...v5.1.2)

## MarkdownConverter v5.1.1
### Added
  - Support for including foreign markdown files using the `markdown-it-include` plugin ([#132](https://github.com/manuth/MarkdownConverter/pull/132))  
    Thanks a ton to [Felix Lehoux](https://github.com/L3houx)
  - Support for applying classes to document sections using the `markdown-it-container` plugin ([#132](https://github.com/manuth/MarkdownConverter/pull/132))  
    Once more thanks to [Felix Lehoux](https://github.com/L3houx)

### Fixed
  - Broken anchor creation
  - Vulnerabilities in dependencies

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v5.0.1...v5.1.1)

## MarkdownConverter v5.0.1
### Updated
  - The internal slugifier to make anchors look like the ones produced by GitHub  
    Once more, thanks to [@Postur](https://github.com/Postur) for pointing this out!

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v5.0.0...v5.0.1)

## MarkdownConverter v5.0.0
### Breaking
  - Renamed a few settings  
    Have a look at this table to see what the new settings are called like now:
    | Old Name                                                | New Name                                       |
    | ------------------------------------------------------- | ---------------------------------------------- |
    | `markdownConverter.Document.Design.Template`            | `markdownConverter.Document.Template`          |
    | `markdownConverter.Document.Design.DefaultStyles`       | `markdownConverter.Document.DefaultStyles`     |
    | `markdownConverter.Document.Design.HighlightStyle`      | `markdownConverter.Document.HighlightStyle`    |
    | `markdownConverter.Document.Design.StyleSheetInsertion` | `markdownConverter.Assets.StyleSheetInsertion` |
    | `markdownConverter.Document.Design.StyleSheets`         | `markdownConverter.Assets.StyleSheets`         |
    | `markdownConverter.Document.Design.ScriptInsertion`     | `markdownConverter.Assets.ScriptInsertion`     |
    | `markdownConverter.Document.Design.Scripts`             | `markdownConverter.Assets.Scripts`             |
    Sorry for the inconvenience - I just really wanted the `Design`-category to go away.

### Fixed
  - Broken webpack settings
  - Broken permalink-creator for anchors and the infamous table of contents creator
  - Vulnerabilities in dependencies

### Added
  - Added support for inserting pictures using Base64-encoding - a huge thanks to @Postur for helping me implementing this feature!  
    Use the `markdownConverter.Assets.PictureInsertion` to control whether to insert pictures in `<img>`-tags based on their paths. This works for the document's body as well as running blocks (the header and the footer)

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v4.0.3...v5.0.0)

## MarkdownConverter v4.0.3
### Fixed
  - An error in the `Converter` class which prevented users from converting documents located at paths containing a space or documents with a space in their file-name

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v4.0.2...v4.0.3)

## MarkdownConverter v4.0.2
### Updated
  - The release-scripts to ignore non-zero exit-codes when publishing extensions

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v4.0.1...v4.0.2)

## MarkdownConverter v4.0.1
### Fixed
  - Broken `Include`-insertion

### Added
  - A missing dependency

### Updated
  - The `README`-file
  - All dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v4.0.0...v4.0.1)

## MarkdownConverter v4.0.0
Hello Everyone Who Still Sticks to MarkdownConverter!

Thank you so much for being patient for such a long time.
I finally managed it to fix all issues and add all features people asked for since the last version.

This here is another new major version which introduces a few breaking changes.

You can now control how assets are inserted, headers and footers are arranged correctly now.
Also, you can now set the content of the header and footer's sections easily through the settings.

### Fixed
  - Broken asset-insertion  
    This change fixes issue [#60](https://github.com/manuth/MarkdownConverter/issues/60) - Thanks to [@SjoerdV](https://github.com/SjoerdV) and [@malustewart](https://github.com/malustewart)
  - Broken dependabot-settings
  - Broken release-notes creation
  - Drone pipeline-steps for multi-digit version-numbers
  - Vulnerabilities in dependencies
  - The Converter's handling of files containing accent letters  
    This change fixes issue [#61](https://github.com/manuth/MarkdownConverter/issues/61) - Thanks to [@HughxDev](https://github.com/HughxDev) and [@damgot](https://github.com/damgot)
  - The use of assets indicated with relative paths

### Added
  - The extension to the [Open VSX Registry](https://open-vsx.org/)
  - Support for loading the `HeaderTemplate` and the `FooterTemplate` from files by specifying a file-path as `HeaderTemplate` and `FooterTemplate`-attributes or `markdownConverter.Document.HeaderTemplate` and `markdownConverter.Document.FooterTemplate` settings
  - Support for specifying a metadata-template using the `MetaTemplate`-attribute or the `markdownConverter.Document.MetaTemplate`-setting
  - Support for overriding the document-title using the `Title`-attribute  
    This change fixes issue [#63](https://github.com/manuth/MarkdownConverter/issues/63) - Thanks to [@orschiro](https://github.com/orschiro)
  - Support for parallel step-execution in drone-pipelines
  - A workflow for merging dependabot-PRs automatically
  - A workflow for analyzing the source-code
  - Support for the `ts-nameof` plugin
  - Support for printing error-messages to the converted document if an error occurred
  - A setting `markdownConverter.Document.Design.Scripts` for adding scripts to the document
  - Support for specifying a custom chromium executable-path using the `markdownConverter.ChromiumExecutablePath`-setting  
    This change fixes issue [#74](https://github.com/manuth/MarkdownConverter/issues/74) - Thanks to [@tik9](https://github.com/tik9) and [@orgwem](https://github.com/orgwem)
  - Support for specifying insertion-types for individual assets and specific link-types using the `markdownConverter.Document.Design.StyleSheetInsertion`, the `markdownConverter.Document.Design.StyleSheets`, the `markdownConverter.Document.Design.ScriptInsertion` and the `markdownConverter.Document.Design.Scripts` settings  
    This change fixes issue [#75](https://github.com/manuth/MarkdownConverter/issues/75) - Thanks to [@richardy706](https://github.com/richardy706)
  - Support for setting the content of individual header- and footer-sections using the `markdownConverter.Document.HeaderContent` and the `markdownConverter.Document.FooterContent` settings and the `Header` and the `Footer` attributes  
    This change fixes issue [#57](https://github.com/manuth/MarkdownConverter/issues/57) - A huge thanks to [@GGillan](https://github.com/GGillan) for the suggestion
  - Support for formatting date-values shorthand using code-snippets such as `{{ CurrentDate "HH:mm:ss" }}`
  - An error-message if no conversion-type (the `markdownConverter.ConversionType`-setting) is selected
  - Further paper-formats: `A0`, `A1`, `A2`, `A6` and `Ledger`

### Updated
  - Drone pipeline-steps to use smaller docker-images
  - The chromium-revision to `901912`
  - All dependencies
  - Settings-schema for the better use in the settings-editor
  - The placement of header- and footer-items  
    This change fixes issue [#56](https://github.com/manuth/MarkdownConverter/issues/56) - Thanks to [@GGillan](https://github.com/GGillan)
  - The descriptions of settings for better understanding
  - The README for better understanding  
    This change fixes [#68](https://github.com/manuth/MarkdownConverter/issues/68) - Thanks to [@RoneoOrg](https://github.com/RoneoOrg)
  - The `ChainTask` to add page-breaks between each chained document

### Removed
  - Type-declarations (`.d.ts`-files) from release-builds

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v3.1.2...v4.0.0)

## MarkdownConverter v3.1.2
### Added
  - The webpack-configuration to the excluded files

### Fixed
  - Broken release-creation

### Updated
  - The conversion-process
  - All dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v3.1.1...v3.1.2)

## MarkdownConverter v3.1.1
  - Fix broken Drone CI script

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v3.1.0...v3.1.1)

## MarkdownConverter v3.1.0
  - Moved from `gulp` and `browserify` to `webpack`
  - Moved from `mustache` to `handlebars` in order to allow curly braces to be escaped

### Updated
  - The development environment
  - The directory structure for improving the development-experience
  - The unit-tests
  - All dependencies
  - The conversion-process for better extensibility

### Added
  - Support for passing arguments to the `vscode-test` instance
  - A component for intercepting vscode-settings
  - Cancellation-support for all tasks
  - A helper for formatting dates  
    Dates can now be formatted with a custom format-string using this pattern: `{{ FormatDate CreationDate "dd. MMMM yyyy" }}`
  - Support for setting the document-wide date-format using the `DateFormat` attribute
  - Support for specifying custom date-formats using the `markdownConverter.DateFormats` option
  - A `ChangeDate` attribute for determining the date of the last change of the markdown-file
  - A `CurrentDate` attribute for determining the date of the conversion

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v3.0.2...v3.1.0)

## MarkdownConverter v3.0.2
  - Fix issue #42 reported by @damgot
    - The conversion-process is now prevented from failing silently
  - Update all packages
  - Fix dependency-error
  - Improve the debug-experience
    - Source-maps now point to the correct source-files

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v3.0.1...v3.0.2)

## MarkdownConverter v3.0.1
  - Drop any non-browserifiable dependency
  - Improve the build automation

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v3.0.0...v3.0.1)

## MarkdownConverter v3.0.0
### General
Hey Guys!

It's time for another big update once more, because I finally managed it to stuff all features I ever wanted into MarkdownConverter!  
Though I'm still not that satisfied about the document-chaining feature but I'll find a way to improve this feature for sure.

Lots of things have changed in background. First I set up my own [Drone CI Server](https://drone.nuth.ch) which allows me to automatically check, test and also publish my projects.

MarkdownConverter is the very first project I'm trying to run using my CI-Server so please don't be mad if anything fails or something. 😅

Thanks to @damgot it's now possible to override the `markdownConverter.Document.HeaderTemplate` and `markdownConverter.Document.FooterTemplate`-settings by setting the `HeaderTemplate` and/or `FooterTemplate` front-matter attribute to a path to a file to load the template from.

The path is either relative to the workspace-folder, if present, or to the directory containing the document.

Another change is that my project now is compressed and merged into nearly a single file using [`browserify`](https://npmjs.com/package/browserify). This might make my extension run even faster.

### Changes
  - Provide the functionality to override the header- and footer-template
  - Fix a few issues
    - The margin- and toc-settings are now loaded correctly
    - Self-contained html-files now can be converted on single-threaded environments
  - Improve performance
    - MarkdownConverter is now compressed using browserify.
  - Improve developer experience
    - The project is now built using gulp
  - The project is now automatically tested on [manuth's Drone CI](https://drone.nuth.ch/manuth/MarkdownConverter/)
  - Update all dependencies

[Show differences](https://github.com/manuth/MarkdownConverter/compare/v2.0.2...v3.0.0)

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
