var phantom = phantom;
var system = require('system');
var webpage = require('webpage');


try
{
    Main(system.args);
}
catch (e)
{
    if (e instanceof Error)
    {
        console.log(e);
        phantom.exit(1);
    }
}

{
    /**
     * 
     * @param args 
     */
    function Main(args) : void
    {
        var page = webpage.create();
        
        page.setContent(args.HTML, null);
        page.onLoadFinished = function(status)
        {
            RenderPage(page);
        }
    }

    /**
     * 
     * @param page 
     */
    function RenderPage(page)
    {
        page.paperSize = {
            header:
            {
            }
        }
        phantom.exit();
    }
}