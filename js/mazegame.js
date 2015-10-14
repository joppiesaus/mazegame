var Game = function(args)
{
    this.hacks = false;
    this.player = { position: new THREE.Vector3( -1.5, 0, 1 ), theta: Math.PI * 1.5, phi: 0 };

    var light = new THREE.AmbientLight( 0x909090 );
    scene.add( light );

    this.player.light = new THREE.PointLight( 0xF5D576, 0.5, 1.5899 );
    scene.add( this.player.light );

    this.player.update = function()
    {
        this.light.position.set( this.position.x, this.position.y, this.position.z );
        camera.position.set( this.position.x, this.position.y, this.position.z );
        camera.rotation.y = this.theta;
        camera.rotation.x = this.phi;
    };

    this.player.update();

    var maze = generateMaze( args.width, args.height );
    var mazeWalls = [];

    // TODO: Make pretty cubes.
    // I mean walls. With textures and bump maps, and lighting and such.
    var generateCube = function( x, y )
    {
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshPhongMaterial( {
            color: 0xaaaaaa,
            bumpMap: Asset.texture( "bump.png" ),
            bumpScale: 0.55,
            shininess: 12,
        } );
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set( x, 0, y );

        mazeWalls.push( cube );
        scene.add( cube );
    };

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

    for ( var x = 0; x < walls.length; x++ )
    {
        for ( var y = 0; y < walls[ x ].length; y++ )
        {
            if ( walls[ x ][ y ] ) generateCube( x, y );
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
                new Torch( x, 0, y, DirectionToAngle( options.randomElement() ) );
            }
        }
    }

    // Place a torch at the entrance of the maze
    new Torch( -1, 0, 0, DirectionToAngle( Direction.East ) );

    this.walls = mazeWalls;
};

Game.prototype.playerCollides = function( dir, amount )
{
    var ray = new THREE.Raycaster( this.player.position, dir, 0, amount + 0.14 );

    var colliders = ray.intersectObjects( this.walls, false );

    return (colliders.length > 0 && colliders[0].distance - 0.5 < amount);
};

Game.prototype.update = function( delta )
{
    // TODO: Pointerlock!
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
