import { createRequire } from "module";
import { join } from "path";
import { fileURLToPath } from "url";
import { Package } from "@manuth/package-json-editor";
import fs from "fs-extra";
import { createSandbox } from "sinon";

const { readJSONSync } = fs;
const require = createRequire(import.meta.url);
let dirName = fileURLToPath(new URL(".", import.meta.url));
let sandbox = createSandbox();

let processorClass = (
    require("vsce/out/package").createDefaultProcessors(
        readJSONSync(join(dirName, "..", Package.FileName)), {}) as object[]).find(
            (processor) =>
            {
                return /EntryPoint/i.test(processor.constructor.name);
            })?.constructor;

sandbox.replace(processorClass?.prototype, "appendJSExt", (filePath: string) => filePath);
require("vsce/out/main.js")(process.argv);
