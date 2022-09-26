import { createRequire } from "node:module";
import { join } from "node:path";
import { CultureInfo } from "@manuth/resource-manager";
import fs from "fs-extra";
import vscode from "vscode";
import { Constants } from "../Constants.js";
import { ISettings } from "../Properties/ISettings.js";
import { Resources } from "../Properties/Resources.js";
import { Settings } from "../Properties/Settings.js";
import { Extension } from "../System/Extensibility/Extension.js";
import { ConfigInterceptor } from "../tests/ConfigInterceptor.js";
import { ITestContext } from "../tests/ITestContext.js";
import { TestConstants } from "../tests/TestConstants.js";
import { ConfigStore } from "./ConfigStore.js";

const { pathExists, remove } = fs;
const { extensions } = createRequire(import.meta.url)("vscode") as typeof vscode;

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
            this.timeout(10 * 60 * 1000);
            await cleanSettings();
            await extensions.getExtension(new Extension(TestConstants.PackageMetadata).FullName).activate();

            if (!await pathExists(Constants.Puppeteer.executablePath()))
            {
                await Constants.Puppeteer.createBrowserFetcher({}).download(TestConstants.Extension.ChromiumRevision);
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
