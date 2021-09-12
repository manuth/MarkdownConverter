// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RunningBlock } from "../System/Documents/RunningBlock";

/**
 * Provides content for the different sections of a {@link RunningBlock `RunningBlock`}.
 */
export interface IRunningBlockContent
{
    /**
     * The content of the left part.
     */
    Left: string;

    /**
     * The content of the center part.
     */
    Center: string;

    /**
     * The content of the right part.
     */
    Right: string;
}
