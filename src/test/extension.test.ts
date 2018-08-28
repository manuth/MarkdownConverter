import * as assert from "assert";
import * as Dedent from "dedent";
import * as MarkdownIt from "markdown-it";
import { Utilities } from "../System/Utilities";

// Defines a Mocha test suite to group tests of similar kind together
suite("MarkdownConverter", () =>
{
    /**
     * Clones the parser provided by VSCode and verifies whether mutations affect VSCode's parser.
     */
    test("Clone VSCodeParser", () =>
    {
        let text = "<b>Hello World</b>";
        let code = Dedent(`
            \`\`\`cs
            Console.WriteLine("Hello World");
            \`\`\``);
        let codeResult = "<pre>cs</pre>";
        Utilities.VSCodeParser = new MarkdownIt({ highlight: (subjectr, language) => `<pre>${language}</pre>` });
        let parser1 = Utilities.VSCodeParser;
        parser1.set({ html: false });

        let parser2 = Utilities.VSCodeParser;
        parser2.set({ html: true });
        assert.equal(parser1.render(code).trim(), codeResult);
        assert.equal(parser2.render(code).trim(), codeResult);
        assert.notEqual(parser1.render(text), parser2.render(text));
    });
});