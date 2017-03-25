export class Base
{
    public CloneTo(obj) : any
    {
        for (var key in this) {
            obj[key] = this[key];
        }
        return obj;
    }
}