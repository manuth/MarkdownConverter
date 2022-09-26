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

    let extensionFilePath = join(sourceRoot, "MarkdownConverterExtension.ts");

    let entryPoints: string[] = [
        extensionFilePath,
        ...(
            argv.mode === "development" ?
                [
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
        externals,
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
            externals: {
                ...externals,
                [puppeteerModuleName]: `import ${puppeteerModuleName}`
            },
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
                index: {
                    import: join(sourceRoot, "index.cts"),
                    filename: "[name].cjs",
                    library: {
                        type: "commonjs2"
                    }
                }
            },
            output: {
                ...configBase.output,
                libraryTarget: "commonjs2"
            },
            externals: [
                async function({ context, request, getResolve }, _): Promise<string | void>
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

                            if (normalize(filePath) === normalize(extensionFilePath))
                            {
                                result = `import ${request}`;
                            }
                        }
                        catch
                        { }
                    }

                    return result;
                }
            ]
        },
        {
            ...configBase,
            entry: {
                "test/index": {
                    import: join(sourceRoot, "test", "index.cts"),
                    filename: "[name].cjs",
                    library: {
                        type: "commonjs2"
                    }
                }
            },
            output: {
                ...configBase.output,
                libraryTarget: "commonjs2"
            }
        }
    ];
};
