/*
 * Add pointerlock to teh geams!
 * Args: object
 *      sensitivity: Custom sensitivity of the mouse.
 */
var PointerLock = function( args )
{
    var scope = this;
    if ( !args ) args = {};
    this.sensitivity = args.sensitivity || 0.002;

    pointerLockActive = false;

    var onMouseMove = function( event )
    {
        if ( pointerLockActive === false ) return;

        var movementX = event.movementX || event.mozMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || 0;

        g.player.theta -= movementX * scope.sensitivity;
        g.player.phi -= movementY * scope.sensitivity;

        g.player.phi = Math.constrainRadius( g.player.phi, Math.TAU / 4 );
    }

    document.addEventListener( "mousemove", onMouseMove, false );
};

var hasBrowserPointerlock = function()
{
    return  'pointerLockElement' in document
            || 'mozPointerLockElement' in document
            || 'webkitPointerLockElement' in document;
}

var requestPointerLock = function()
{
    var element = document.body;

    if ( hasBrowserPointerlock() )
    {
    	var pointerlockchange = function( event )
        {
    		if (document.pointerLockElement === element ||
    			document.mozPointerLockElement === element ||
    			document.webkitPointerLockElement === element )
            {
    			pointerLockActive = true;
    		}
    		else
            {
                pointerLockActive = false;
    		}
    	};

    	var pointerlockerror = function( event )
        {
            console.warn("Mysterious pointerlock error! :(");
            console.log( event );
            pointerLockActive = false;
    	};

    	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    	var requestPointerLock = function( event )
        {
    		element.requestPointerLock = element.requestPointerLock
                || element.mozRequestPointerLock
                || element.webkitRequestPointerLock;

    		element.requestPointerLock();
    	};

    	element.addEventListener( 'click', requestPointerLock, false );
        return true;
    }
    else
    {
        console.log("Upgrade your browser! Please! I can't use pointerlock!"); //element.innerHTML = 'Bad browser; No pointer lock';
        return false;
    }
}
