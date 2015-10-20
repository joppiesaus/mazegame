var g;

var camera, scene, renderer, timer;

// TODO: Clean
var init = function()
{
    initPointerLock();
    THREEx.FullScreen.bindKey( { charCode : 'f'.charCodeAt( 0 ) } );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    scene.add( camera );
    //controls = new THREE.PointerLockControls( camera );
    //scene.add( controls.getObject() );
    
    
    timer = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    window.addEventListener( "resize", onWindowResize, false );
};

var onWindowResize = function()
{
    //controls.getObject().aspect = window.innerWidth / window.innerHeight;
    //controls.getObject().updateProjectionMatrix();

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
    requestAnimationFrame( animate );

    var delta = timer.getDelta();

    g.update(delta);

    if ( g.mustRender() )
    {
        renderer.render( scene, camera );
    }
};


init();
g = new Game( { width: 8, height: 8 } ); // TODO: Make difficulty selection
start();
animate();
