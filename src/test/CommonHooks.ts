import { join } from "path";
import { CultureInfo } from "@manuth/resource-manager";
import { pathExists, remove } from "fs-extra";
import { extensions } from "vscode";
import { Constants } from "../Constants";
import { ISettings } from "../Properties/ISettings";
import { Resources } from "../Properties/Resources";
import { Settings } from "../Properties/Settings";
import { Extension } from "../System/Extensibility/Extension";
import { ConfigInterceptor } from "../tests/ConfigInterceptor";
import { ITestContext } from "../tests/ITestContext";
import { TestConstants } from "../tests/TestConstants";
import { ConfigStore } from "./ConfigStore";

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

    /**
     * Cleans the temporary settings.
     */
    async function cleanSettings(): Promise<void>
    {
        let tempSettingsPath = join(ConfigStore.SingleFilePath, ".vscode");

        if (await pathExists(tempSettingsPath))
        {
            await remove(tempSettingsPath);
        }
    }

    suiteSetup(
        async function()
        {
            this.timeout(30 * 1000);
            let puppeteer = Constants.Puppeteer;
            await cleanSettings();
            await extensions.getExtension(new Extension(TestConstants.PackageMetadata).FullName).activate();

            if (!await pathExists(puppeteer.executablePath()))
            {
                await puppeteer.createBrowserFetcher({}).download(TestConstants.Extension.ChromiumRevision);
            }
        });

    suiteTeardown(
        async () =>
        {
            await cleanSettings();
        });

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
