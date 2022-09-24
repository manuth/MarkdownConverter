import { join } from "path";
import { CultureInfo } from "@manuth/resource-manager";
import dependencyPath from "dependency-package-path";
import { ensureDir, pathExists, remove } from "fs-extra";
import puppeteer, { PuppeteerNode } from "puppeteer-core";
import { createSandbox, SinonSandbox } from "sinon";
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
import { SuiteVarName } from "./SuiteVarName";

/**
 * Registers common configuration-interceptions.
 *
 * @returns
 * The test-context.
 */
export function CommonHooks(): ITestContext<ISettings>
{
    let originalCulture: CultureInfo;
    let sandbox: SinonSandbox;
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
            let puppeteerInstance: PuppeteerNode;
            let puppeteerRoot = join(dependencyPath("puppeteer-core", __dirname), process.env[SuiteVarName]);
            sandbox = createSandbox();
            await ensureDir(puppeteerRoot);

            puppeteerInstance = new (puppeteer.constructor as any)(
                {
                    projectRoot: puppeteerRoot
                });

            sandbox.replaceGetter(Constants, "Puppeteer", () => puppeteerInstance);
            await cleanSettings();
            await extensions.getExtension(new Extension(TestConstants.PackageMetadata).FullName).activate();

            if (!await pathExists(puppeteerInstance.executablePath()))
            {
                await puppeteerInstance.createBrowserFetcher({}).download(TestConstants.Extension.ChromiumRevision);
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
