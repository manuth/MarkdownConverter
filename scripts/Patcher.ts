import { createRequire } from "module";
import { join } from "path";
import { fileURLToPath } from "url";
import { Package } from "@manuth/package-json-editor";
import fs from "fs-extra";
import { createSandbox, SinonSandbox } from "sinon";

const { readJSONSync } = fs;
const require = createRequire(import.meta.url);
const dirName = fileURLToPath(new URL(".", import.meta.url));

/**
 * Provides the functionality to patch the `vsce package` command.
 */
export class Patcher
{
    /**
     * A component for handling mocks.
     */
    private static sandbox: SinonSandbox = null;

    /**
     * Gets a component for handling mocks.
     */
    protected static get Sandbox(): SinonSandbox
    {
        if (this.sandbox === null)
        {
            this.sandbox = createSandbox();
        }

        return this.sandbox;
    }

    /**
     * Patches the `vsce package` command to allow `.cjs` entry points.
     */
    public static Patch(): void
    {
        let sandbox = createSandbox();

        let processorClass = (
            require("vsce/out/package").createDefaultProcessors(
                readJSONSync(join(dirName, "..", Package.FileName)), {}) as object[]).find(
                    (processor) =>
                    {
                        return /EntryPoint/i.test(processor.constructor.name);
                    })?.constructor;

        sandbox.replace(processorClass?.prototype, "appendJSExt", (filePath: string) => filePath);

        process.on(
            "beforeExit",
            () =>
            {
                sandbox.restore();
            });
    }
}
