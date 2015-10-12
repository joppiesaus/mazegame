var g;

var camera, scene, renderer, timer;

var ScreenWidth = 320, ScreenHeight = 200;

var init = function()
{
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerWidth, 0.1, 10000 );
    scene.add( camera );

    timer = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( ScreenWidth, ScreenHeight );
    document.body.appendChild(renderer.domElement);

    window.addEventListener( "resize", onWindowResize, false );
};

var onWindowResize = function()
{
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
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
