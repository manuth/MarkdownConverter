export default interface IMark
{
    name: string;
    buffer: Buffer;
    position: number;
    line: number;
    column: number;

    getSnippet(indent?: number, maxLength?: number): string;
    toString(compact?: boolean): string;
}