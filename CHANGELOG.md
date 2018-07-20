# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## MarkdownConverter v1.0.0 [Unreleased]
### Changed
  - Replace [PhantomJS](http://phantomjs.org/) by [puppeteer](https://github.com/GoogleChrome/puppeteer)
  - Provide the functionality to render local files
  - Provide the functionality to 
  - Rework the path-handling of the settings
  - Rework the code for better readability

## MarkdownConverter v0.0.13
### Changed
  - Beautify the system-stylesheet

## MarkdownConverter v0.0.12
### Changed
  - Rework the settings and remove unnecessary settings
  - Fix extension-provided styles
  - Improve path-handling for untitled files
  - Implement localization using [`localizable-resources`](https://npmjs.org/package/localizable-resources)

## MarkdownConverter v0.0.11
### Changed
  - Rename `MarkdownConverter` to `Markdown Converter`
  - Fix Multi-Workspacefolder support

## MarkdownConverter v0.0.10
### Added
  - Add support for Chinese headings

### Changed
  - Disable `markdown-it`'s link policy

## MarkdownConverter v0.0.9
## Added
  - Provide "table of content"-feature

## Changed
  - Make the rebuild-process platform-independent
  - Adjust the way to open up files
  - Update the sync-request-module

## MarkdownConverter v0.0.8
## Added
  - Provided the functionallity to choose whether to embed or link certain css-files [#4](https://github.com/manuth/MarkdownConverter/issues/4)

### Changed
  - Rework the PhantomJS-process [#1](https://github.com/manuth/MarkdownConverter/issues/1)
  - Adjust the way to handle templates [#6](https://github.com/manuth/MarkdownConverter/issues/6)
  - Change missleading error-messages [#7](https://github.com/manuth/MarkdownConverter/issues/7)

## MarkdownConverter v0.0.7
### Added
  - Add TypeScript-definitions
  - Add PhantomJS-rebuild functionallity in order to build PhantomJS for the propper os. [#2](https://github.com/manuth/MarkdownConverter/issues/2)

### Changed
  - Adjust the version-numbers
  - Improve the date-test for security-reasons

## MarkdownConverter v0.0.6
### Added
  - Add FrontMatter-validation
  - Add JavaScript-logic-variables

### Changed
  - Improve the MarkDown-document-detection
  - Fix the broken PageNumber and PageCount-variables

## MarkdownConverter v0.0.5
### Changed
  - Rework the error-messages

## MarkdownConverter v0.0.4
### Changed
  - Remov test-code

## MarkdownConverter v0.0.3
## Added
  - Add a new Icon
  - Add [Checkbox-Support](https://www.npmjs.com/package/markdown-it-checkbox)

### Changed
  - Rework the README

## MarkdownConverter v0.0.2
  - First release