import { CultureInfo } from "@manuth/resource-manager";
import { ISettings } from "../Properties/ISettings";
import { Resources } from "../Properties/Resources";
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
    let originalCulture: CultureInfo;
    let interceptor = new ConfigInterceptor<ISettings>(Settings.ConfigKey);
    interceptor.Register();

    setup(
        () =>
        {
            originalCulture = Resources.Resources.Locale;
            interceptor.Settings = {};
            interceptor.Settings["Parser.SystemParserEnabled"] = false;
        });

    teardown(
        async function()
        {
            this.timeout(5 * 1000);
            Resources.Culture = originalCulture;
            await interceptor.Context.CloseEditors();
        });

    return interceptor.Context;
}
