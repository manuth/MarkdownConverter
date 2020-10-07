import { workspace } from "vscode";
import { ISettings } from "../Properties/ISettings";
import { Settings } from "../Properties/Settings";
import { ConfigInterceptor } from "../tests/ConfigInterceptor";
import { ITestContext } from "../tests/ITestContext";

/**
 * Registers common configuration-interceptions.
 *
 * @returns
 * The test-context.
 */
export function CommonHooks(): ITestContext<ISettings>
{
    let interceptor = new ConfigInterceptor<ISettings>(Settings.ConfigKey);
    interceptor.Register();

    setup(
        () =>
        {
            interceptor.Settings = {};
            interceptor.Settings["Parser.SystemParserEnabled"] = false;
        });

    return interceptor.Context;
}
