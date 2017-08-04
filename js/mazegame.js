var Game = function(args)
{
    this.hacks = !!args.hacks || false;
    this.player = { position: new THREE.Vector3( -1.5, 0.1, 1 ), theta: Math.PI * 1.5, phi: 0 };

    Asset.init();

    var light = new THREE.AmbientLight( 0x909090 );
    scene.add( light );

    // Add fullscreen key
    THREEx.FullScreen.bindKey( { charCode : 'f'.charCodeAt( 0 ) } );

    // init pointerlock
    if ( requestPointerLock() )
    {
        new PointerLock();
    }

    this.player.light = new THREE.PointLight( 0xF5D576, 0.5, 1.5899 );
    scene.add( this.player.light );

    // Euler rotation order for camera movement
    camera.rotation.order = "ZYX";
    this.player.update = function()
    {
        this.light.position.copy( this.position );
        camera.position.copy( this.position );

        camera.rotation.y = this.theta;
        camera.rotation.x = this.phi;
    };

    this.player.update();

    var maze = generateMaze( args.width, args.height );
    var mazeWalls = [];


    TorchBuilder.init();

    // Gaps
    var walls = [];
    for ( var x = 0; x < maze.width * 2 + 1; x++ )
    {
        walls[x] = [];
        if ( x % 2 === 0 )
        {
            for ( var y = 0 ; y < maze.height * 2 + 1; y++ )
            {
                walls[x].push( ( y % 2 === 0 || !( x > 0 && maze.vertical[ x / 2 - 1 ][ Math.floor( y / 2 ) ] ) ) );
            }
        }
        else
        {
            for ( var y = 0 ; y < maze.height * 2 + 1; y++ )
            {
                walls[x].push( ( y % 2 === 0 && !( y > 0 && maze.horizontal[ (x - 1) / 2 ][ y / 2 - 1 ] ) ) );
            }
        }
    }

    walls[ 0 ][ 1 ] = false; // start
    walls[ maze.width * 2 - 1 ][ maze.height * 2 ] = false; // finish

    // WARNING: Mutating maze dimensions!
    maze.width = walls.length;
    maze.height = walls[ 0 ].length;

    console.log( walls );

    // oh my the y and height was such a worse mistake

    // ! WALLS ARE Z, X !

    var xw = []; // walls along x axis, first dimension is x, second z
    var zw = []; // walls along z axis, first dimension is z, second x

    // additional + 1 is for ez culling
    for ( var x = 0; x < maze.width + 1; x++ )
    {
        xw.push( [] );
        for ( var z = 0; z < maze.height + 1 + 1; z++ )
        {
            xw[ x ].push( false );
        }
    }
    for ( var z = 0; z < maze.height + 1; z++ )
    {
        zw.push( [] );
        for ( var x = 0; x < maze.width + 1 + 1; x++ )
        {
            zw[ z ].push( false );
        }
    }

    for ( var x = 0; x < maze.width; x++ )
    {
        for ( var z = 0; z < maze.height; z++ )
        {
            if ( walls[ z ][ x ] )
            {
                // remove size conditions, replace by unrolled loop
                if ( z <= 0 || !walls[ z - 1 ][ x ] )
                {
                    // front
                    xw[ x ][ z ] = true;
                }
                if ( z >= maze.height - 1 || !walls[ z + 1 ][ x ] )
                {
                    // back
                    xw[ x ][ z + 1 ] = true;
                }
                if ( !walls[ z ][ x - 1 ] )
                {
                    // left
                    zw[ z ][ x ] = true;
                }
                if ( !walls[ z ][ x + 1 ] )
                {
                    // right
                    zw[ z ][ x + 1 ] = true;
                }
            }
        }
    }

    console.log( xw );
    console.log( zw );

    var matrix = new THREE.Matrix4();
    var tmpgeom = new THREE.Geometry();

    var wgeom, wbgeom;

    var length;
    for ( var z = 0; z <  xw[ 0 ].length; z++ )
    {
        length = 0;
        for ( var x = 0; x < xw.length; x++ )
        {
            if ( xw[ x ][ z ] )
            {
                length++;
            }
            else if ( length > 0 )
            {
                xbgeom = new THREE.PlaneBufferGeometry( 1 * length, 1 );
                xbgeom.rotateY( Math.TAU / 4 );
                xbgeom.translate( - 1 / 2, 0, - 1 / 2 );

                xgeom = new THREE.Geometry().fromBufferGeometry( xbgeom );

                matrix.makeTranslation(
                    z,
                    0,
                    x - length / 2
                );

                tmpgeom.merge( xgeom, matrix );
                length = 0;
            }
        }
    }

    for ( var x = 0; x < zw[ 0 ].length; x++ )
    {
        length = 0;
        for ( var z = 0; z < zw.length; z++ )
        {
            if ( zw[ z ][ x ] )
            {
                length++;
            }
            else if ( length > 0 )
            {
                xbgeom = new THREE.PlaneBufferGeometry( 1 * length, 1 );
                xbgeom.translate( - 1 / 2, 0, - 1 / 2 );

                xgeom = new THREE.Geometry().fromBufferGeometry( xbgeom );

                matrix.makeTranslation(
                    z - length / 2,
                    0,
                    x
                );

                tmpgeom.merge( xgeom, matrix );
                length = 0;
            }
        }
    }

    var geom = new THREE.BufferGeometry().fromGeometry( tmpgeom );
    geom.computeBoundingSphere();


    var CubeBumpMap = Asset.texture( "bump.png" );
    CubeBumpMap.wrapT = CubeBumpMap.wrapS = THREE.RepeatWrapping;
    CubeBumpMap.offset.set( 0, 0 );
    CubeBumpMap.repeat.set( 1, 1 ); // TODO: UV


    var CubeMaterial = new THREE.MeshPhongMaterial( {
        color: 0xaaaaaa,
        bumpMap: CubeBumpMap,
        bumpScale: 0.55,
        shininess: 12,
        side: THREE.DoubleSide
    } );
    CubeMaterial.displacementMap = CubeBumpMap;
    CubeMaterial.displacementScale = 23;


    var mesh = new THREE.Mesh(
        geom,
        //new THREE.MeshStandardMaterial( { color: 0xff0000, wireframe: true })
        CubeMaterial
    );
    scene.add( mesh );

    for ( var x = 0; x < walls.length; x++ )
    {
        for ( var y = 0; y < walls[ x ].length; y++ )
        {
            if ( walls[ x ][ y ] ) undefined;
            else if ( rnd( 20 ) === 0 )
            {
                // Add random torches!
                var options = [];

                if ( x > 0  && walls[ x - 1 ][ y ] )
                    options.push( Direction.West );
                if ( x < walls.length - 1 && walls[ x + 1 ][ y ] )
                    options.push( Direction.East );

                if ( y > 0  && walls[ x ][ y - 1 ] )
                    options.push( Direction.South );
                if ( y < walls[ x ].length - 1 && walls[ x ][ y + 1 ] )
                    options.push( Direction.North );

                // There's always a possibility, no need to check
                // TODO: torch optimizing(render distance)
                new Torch( x, 0, y, DirectionToAngle( options.randomElement() ) );
            }
        }
    }

    // Place a torch at the entrance of the maze
    new Torch( -1, 0, 0, DirectionToAngle( Direction.East ) );

    // TODO: Performance. Maybe chunks? Maybe different algorithm?
    mazeWalls.push( mesh );
    this.walls = mazeWalls;

    // I do not like this code
    var MazePlane = new THREE.PlaneGeometry( maze.width, maze.height );

    var CeilingBumpMap = Asset.texture( "ceiling_bump.png" );
    CeilingBumpMap.wrapT = CeilingBumpMap.wrapS = THREE.RepeatWrapping;
    CeilingBumpMap.repeat.set( maze.width, maze.height );

    var CeilingMaterial = new THREE.MeshPhongMaterial( {
        color: 0xaaaaaa,
        bumpMap: CeilingBumpMap,
        bumpScale: 0.4,
        shininess: 11
    } );

    var Ceiling = new THREE.Mesh( MazePlane, CeilingMaterial );
    Ceiling.position.set( maze.width / 2 - 1 / 2, 1 / 2, maze.height / 2 - 1 / 2 );
    Ceiling.rotation.x = Math.TAU / 4;
    scene.add( Ceiling );


    var FloorBumpMap = Asset.texture( "floor_bump.png" );
    FloorBumpMap.wrapT = FloorBumpMap.wrapS = THREE.RepeatWrapping;
    FloorBumpMap.repeat.set( maze.width, maze.height );

    var FloorMaterial = new THREE.MeshPhongMaterial( {
        color: 0xb0b0b0,
        bumpMap: FloorBumpMap,
        bumpScale: 0.64,
        shininess: 10
    } );

    var Floor = new THREE.Mesh( MazePlane, FloorMaterial );
    Floor.position.set( maze.width / 2 - 1 / 2, -1 / 2, maze.height / 2 - 1 / 2 );
    Floor.rotation.x = Math.TAU * 3 / 4;
    scene.add( Floor );

};

Game.prototype.playerCollides = function( dir, amount )
{
    var ray = new THREE.Raycaster( this.player.position, dir, 0, amount + 0.14 );

    var colliders = ray.intersectObjects( this.walls, false );

    return (colliders.length > 0 && colliders[0].distance - 0.5 < amount);
};

Game.prototype.update = function( delta )
{
    var MoveSpeed = 1.5 * delta;
    var KeyRotateSpeed = 1.4 * delta;

    // debux hax
    if ( InputManager.isKeyPressed( 113 /*f2*/ ) )
    {
        this.hacks ^= true;
    }

    if (this.hacks)
    {
        if ( InputManager.isKeyDown ( 16 /*shift*/ ) )
        {
            MoveSpeed *= 4; // Go faster!
        }

        if ( InputManager.isKeyDown( 32 /*space*/ ) )
        {
            this.player.position.y += MoveSpeed; // Go up
        }
        else if ( InputManager.isKeyDown( 17 /*ctrl*/ ) )
        {
            this.player.position.y -= MoveSpeed; // Go down
        }
    }



    if ( InputManager.isKeyDown( 81 /*q*/ ) )
    {
        this.player.theta += KeyRotateSpeed; /* turn left */
    }
    else if ( InputManager.isKeyDown( 69 /*e*/ ) )
    {
        this.player.theta -= KeyRotateSpeed; /* turn right */
    }

    this.player.theta = rotclamp( this.player.theta );

    var cTheta = Math.cos( this.player.theta );
    var sTheta = Math.sin( this.player.theta );

    var dir = new THREE.Vector3( -1.0 * sTheta, 0, -1.0 * cTheta );

    if ( InputManager.isKeyDown( 87 /*w*/ ) &&
         !this.playerCollides( dir, MoveSpeed ))
    {
        // Move forward
        this.player.position.x += dir.x * MoveSpeed;
        this.player.position.z += dir.z * MoveSpeed;
    }
    else if ( InputManager.isKeyDown( 83 /*s*/ ) &&
         !this.playerCollides( new THREE.Vector3( -dir.x, -dir.y, -dir.z ), MoveSpeed ))
    {
        // Move backward
        this.player.position.x -= dir.x * MoveSpeed;
        this.player.position.z -= dir.z * MoveSpeed;
    }

    var xProd = new THREE.Vector3();
    xProd.crossVectors( dir, new THREE.Vector3( 0, 1.0, 0 ) );

    if ( InputManager.isKeyDown( 65 /*a*/ ) &&
         !this.playerCollides(  new THREE.Vector3( -xProd.x, -xProd.y, -xProd.z ), MoveSpeed ) )
    {
        // Move left
        this.player.position.x -= xProd.x * MoveSpeed;
        this.player.position.z -= xProd.z * MoveSpeed;
    }
    else if ( InputManager.isKeyDown( 68 /*d*/ ) &&
              !this.playerCollides( xProd, MoveSpeed ) )
    {
        // Move right
        this.player.position.x += xProd.x * MoveSpeed;
        this.player.position.z += xProd.z * MoveSpeed;
    }

    /*torches.forEach( function( torch ) {
        torch.update( delta );
    } );*/
    this.player.update();

    InputManager.update();
};

Game.prototype.mustRender = function()
{
    return true; // huehuehue
};
