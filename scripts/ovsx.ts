import { createRequire } from "module";
import { Patcher } from "./Patcher.js";

const require = createRequire(import.meta.url);
Patcher.Patch();
require("ovsx/lib/main.js")(process.argv);
