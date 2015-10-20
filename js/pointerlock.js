// TODO: Fix
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
    }
    
    document.addEventListener( "mousemove", onMouseMove, false );
};

// TODO: Improve, make optional and get a different mouse cause the one I use is broken.
function hasBrowserPointerlock() {

	return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

}

function initPointerLock() {

	var element = document.body;

	if ( hasBrowserPointerlock() ) {

		var pointerlockchange = function( event ) {
			
			if (	document.pointerLockElement === element ||
					document.mozPointerLockElement === element ||
					document.webkitPointerLockElement === element ) {
							
				pointerLockActive = true;
						
			}
			else {
							
				pointerLockActive = false;
						
			}
		
		};

		var pointerlockerror = function( event ) {
			
                        console.alert("Myseterious pointerlock error!");
                        pointerLockActive = false;
		
		};

		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		var requestPointerLock = function( event ) {
			
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		
		};

		element.addEventListener( 'click', requestPointerLock, false );
	
	}
	else {
		
		console.log("Upgrade your browser! Please! I can't use pointerlock!"); //element.innerHTML = 'Bad browser; No pointer lock';
	
	}

}