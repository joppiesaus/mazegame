var g;

var camera, scene, renderer, timer;

var WEBXR_PRESENT = false;



var init = function()
{
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    scene.add( camera );

    timer = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    window.addEventListener( "resize", onWindowResize, false );
    
    
    var urlParams = new URLSearchParams( window.location.search );
    var dimensionString = urlParams.get( "dimensions" );
    
    var width = 8;
    var height = 8;
    
    // Check if maze's dimensions have been specified in URL, if so apply them
    if ( /\d+/.test( dimensionString ) ) {
        
        // width * height format (ex. ?dimensions="5,9")
        if ( /\d+,\d+/.test( dimensionString ) ) {
        
            var arr = dimensionString.split( "," );
            
            width = parseInt( arr[ 0 ] );
            height = parseInt( arr[ 1 ] );
            
        } else {
            
            // single digit format, set it as width and height
            
            width = height = parseInt( dimensionString );
            
        }
        
    }
    
    var args = { width: width, height: height };
    
    var scaleString = urlParams.get( "scale" );
    
    // scale format: x,y,z
    if ( /\d+,\d+,\d+/.test( scaleString ) ) {
        
        var arr = scaleString.split( "," );
        
        args.scale = new THREE.Vector3(
            parseInt( arr[ 0 ] ),
            parseInt( arr[ 1 ] ),
            parseInt( arr[ 2 ] )
        );
    }
    
    
    g = new Game( args ); // TODO: Make difficulty selection
    
        
};

var postInit = function() {
    
    if ( 'xr' in navigator ) {

        navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {

            WEBXR_PRESENT = supported;
            
            import("../lib/VRButton.js")
                .then((module) => {
                    
                    document.body.appendChild( module.VRButton.createButton( renderer, g.onXRSessionChange ) );
                    
                    renderer.xr.enabled = true;
                    //renderer.xr.setReferenceSpaceType( "unbounded" );
                    renderer.xr.setReferenceSpaceType( "local" );
                    
                }
            );
            
            g.postXRInit();

        } );
    
    } else {
        
        g.postXRInit();
        
    }
    
};

var onWindowResize = function()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
};

var start = function()
{
    timer.start();
};

var animate = function()
{
    renderer.setAnimationLoop( function() {
        
        var delta = timer.getDelta();

        g.update(delta);

        if ( g.mustRender() )
        {
            renderer.render( scene, camera );
        }
        
    } );
    
};


init();
postInit();
start();
animate();
