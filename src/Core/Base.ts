/**
 * Provides basic functionallities such as cloning or converting to JSON.
 */
export abstract class Base
{
    /**
     * Clones the values of the object to another object.
     * 
     * @param obj
     * The object to clone the values to.
     */
    public CloneTo(obj) : any
    {
        for (var key in this)
        {
            obj[key] = this[key];
        }
        return obj;
    }
    
    /**
     * Returns a JSON-string which represents the object.
     */
    public abstract toJSON() : string;

    /**
     * Returns an object which represents this object.
     */
    public toObject()
    {
        return JSON.parse(this.toJSON());
    }
}