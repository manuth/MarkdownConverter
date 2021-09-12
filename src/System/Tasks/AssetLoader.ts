import { Asset } from "../Documents/Assets/Asset";
import { InsertionType } from "../Documents/Assets/InsertionType";

/**
 * Provides the functionality to load an asset.
 */
export type AssetLoader =
    /**
     * Loads the asset with the specified settings.
     *
     * @param path
     * The path of the asset to load.
     *
     * @param insertionType
     * The type of the insertion of the asset.
     */
    (path: string, insertionType: InsertionType) => Asset;
