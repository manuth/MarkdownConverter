import { createRequire } from "module";
import { Patcher } from "./Patcher.js";

const require = createRequire(import.meta.url);
Patcher.Patch();
require("vsce/out/main.js")(process.argv);
