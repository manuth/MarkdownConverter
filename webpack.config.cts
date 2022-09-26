import { dirname, join, parse, relative, resolve } from "path";
import { normalize } from "upath";
import { Configuration, WatchIgnorePlugin } from "webpack";

export = (env: any, argv: any): Configuration[] =>
{
    let sourceRoot = join(__dirname, "src");
    let puppeteerModuleName = "puppeteer-core";

    let externalModules: string[] = [
        "mocha",
        "vscode"
    ];

    let commonTestAssets = [
        join(sourceRoot, "test", "SuiteVarName.ts"),
        join(sourceRoot, "test", "SuiteSet.ts"),
        join(sourceRoot, "test", "ConfigStore.ts")
    ];

    let entryPoints: string[] = [
        ...(
            argv.mode === "development" ?
                [
                    ...commonTestAssets,
                    join(sourceRoot, "test", "runTests.ts"),
                    join(sourceRoot, "test", "essentials.test.ts"),
                    join(sourceRoot, "test", "common.test.ts"),
                    join(sourceRoot, "test", "single-file.test.ts"),
                    join(sourceRoot, "test", "single-folder.test.ts"),
                    join(sourceRoot, "test", "workspace.test.ts")
                ] :
                []
        )
    ];

    let externals: Record<string, string> = {};
    let entry: Record<string, string> = {};

    for (let externalModule of externalModules)
    {
        externals[externalModule] = `node-commonjs ${externalModule}`;
    }

    for (let entryPoint of entryPoints)
    {
        entry[join(relative(sourceRoot, dirname(entryPoint)), parse(entryPoint).name)] = entryPoint;
    }

    /**
     * Creates an `externals` setting for lazy loading the specified {@link externalFiles `externalFiles`}.
     *
     * @param externalFiles
     * The files which should be lazy loaded.
     *
     * @returns
     * An object indicating the external sources.
     */
    let getExternalsResolver: (externalFiles: string[]) => Configuration["externals"] = (externalFiles) =>
    {
        return async ({ context, request, getResolve }, _) =>
        {
            let result: string;

            if (request in externals)
            {
                result = externals[request];
            }
            else
            {
                try
                {
                    let filePath: string = await getResolve()(context, request, undefined) as string;

                    if (
                        externalFiles.some(
                            (externalFile) =>
                            {
                                return normalize(filePath) === normalize(externalFile);
                            }))
                    {
                        result = `import ${request}`;
                    }
                }
                catch
                { }
            }

            return result;
        };
    };

    let configBase: Configuration = {
        target: "node",
        output: {
            path: resolve(__dirname, "lib"),
            filename: "[name].js",
            devtoolFallbackModuleFilenameTemplate: "../[resource-path]",
            hashFunction: "xxhash64",
            environment: {
                dynamicImport: true
            }
        },
        devtool: "source-map",
        externals: getExternalsResolver([]),
        resolve: {
            extensions: [
                ".ts",
                ".js",
                ".json"
            ],
            extensionAlias: {
                ".js": [
                    ".js",
                    ".ts"
                ],
                ".mjs": [
                    ".mjs",
                    ".mts"
                ],
                ".cjs": [
                    ".cjs",
                    ".cts"
                ]
            },
            alias: {
                [`${puppeteerModuleName}$`]: require.resolve(puppeteerModuleName)
            },
            mainFields: [
                "main",
                "module"
            ]
        },
        plugins: [
            new WatchIgnorePlugin(
                {
                    paths: [
                        /\.d\.ts$/
                    ]
                })
        ],
        module: {
            parser: {
                javascript: {
                    url: false
                }
            },
            rules: [
                {
                    test: /\.[cm]?tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                configFile: resolve(__dirname, "tsconfig.build.json"),
                                projectReferences: true,
                                compilerOptions: {
                                    outDir: resolve(__dirname, "lib", "temp")
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.json$/i,
                    exclude: /node_modules/,
                    loader: "json5-loader",
                    type: "javascript/auto",
                    options: {
                        esModule: false
                    }
                }
            ]
        },
        node: {
            __dirname: false,
            __filename: false
        },
        stats: {
            warnings: false
        }
    };

    return [
        {
            ...configBase,
            entry,
            output: {
                ...configBase.output,
                libraryTarget: "module",
                chunkFormat: "module"
            },
            experiments: {
                outputModule: true
            }
        },
        {
            ...configBase,
            entry: {
                index: join(sourceRoot, "index.cts")
            },
            output: {
                ...configBase.output,
                libraryTarget: "commonjs2",
                filename: "[name].cjs",
                environment: {
                    dynamicImport: false
                },
                chunkFilename: "[name].cjs"
            }
        },
        {
            ...configBase,
            entry: {
                "test/index": {
                    import: join(sourceRoot, "test", "index.cts"),
                    filename: "[name].cjs"
                }
            },
            externals: getExternalsResolver(commonTestAssets),
            output: {
                ...configBase.output,
                libraryTarget: "commonjs2",
                filename: "test/[name].js"
            }
        }
    ];
};
