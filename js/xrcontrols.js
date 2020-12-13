
// About the objectsToIntersectWith: the first argument must be the maze's walls, the rest possible surface to teleport on, such as floors.
var XRControls = function( game, objectsToIntersectWith ) {
    
    this.g = game;
    this.activeControllers = [];
    
    this.geom = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -1 ) ] );
    
    // TODO: Create pretty thick line, and a small line, and toggle when something interesting is possible(i.e. teleport)
    
    this.objectsToIntersectWith = objectsToIntersectWith;
    
    this.controllerToCheck = 0;
};


XRControls.prototype.init = function() {
    
    
    var controllerMesh = new THREE.Mesh(
        new THREE.CubeGeometry( 0.04, 0.04, 0.08 ),
        new THREE.MeshBasicMaterial( { wireframe: true } )
    );
    
    
    var self = this;
    
    var selectstart = function( evnt ) {
        
    };
    
    var selectend = function( evnt ) {
        
        self.attemptTeleport( evnt.target );
        
    };
    
    // children[ 0 ] = "controller" mesh
    // children[ 1 ] = line
    
    var conn = function( evnt ) {
        
        this.add( controllerMesh.clone() );
        
        
        var line = new THREE.Line( self.geom );
    
        line.scale.z = 0;
        line.scale.y = .2;
        line.scale.x = .2;
        
        this.add( line );
            
        self.activeControllers.push( this );
        
    };
    
    var disconn = function( evnt ) {
        
        this.remove( this.children[ 1 ] );
        this.remove( this.children[ 0 ] );
        
        var controller = this;
        
        self.activeControllers.splice( self.activeControllers.findIndex( j => j.uuid === controller.uuid ), 1 );
        
    };
    
    for ( var i = 0; i < 2; i++ ) {
        
        var c = renderer.xr.getController( i );
        
        c.raycaster = new THREE.Raycaster();
        c.raycaster.near = 0.1;
        
        c.addEventListener( "connected", conn );
        c.addEventListener( "disconnect", disconn );
        
        c.addEventListener( "selectstart", selectstart );
        c.addEventListener( "selectend", selectend );
        
        
        this.g.dolly.add( c );
        this.g.controllers.push( c );
        
    }
    
};

XRControls.prototype.attemptTeleport = function( c ) {
    
    var ints = this.getIntersections( c, this.objectsToIntersectWith );
        
    if ( ints.length === 0 || ints[ 0 ].distance < 0.25 ||
        ints[ 0 ].object.uuid === this.objectsToIntersectWith[ 0 ].uuid ) {
        
        return false;
    }
    
    var headPosition = this.g.player.position;
    
    var diff = ints[ 0 ].point.clone().sub( headPosition );
    diff.y = 0; // don't move the y of the head
    
    this.g.player.position.add( diff );
    
    
};

XRControls.prototype.getIntersections = function( c, mesh  ) {
    
    // no idea how this works
    var mat = new THREE.Matrix4().identity().extractRotation( c.matrixWorld );
    
    
    c.raycaster.ray.origin.setFromMatrixPosition( c.matrixWorld );
    c.raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( mat );
    
    if ( Array.isArray( mesh ) ) {
        
        return c.raycaster.intersectObjects( mesh );
        
    } else {
        
        return c.raycaster.intersectObject( mesh );
        
    }
    
};

XRControls.prototype.update = function( delta ) {
    
    if ( this.activeControllers.length === 0 ) return;
    
    var c = this.activeControllers[ this.controllerToCheck ];
    
    var ints = this.getIntersections( c, this.objectsToIntersectWith );
    
    // If you update this condition, don't forget to update it as well in attemptTeleport()!
    if ( ints.length === 0 || ints[ 0 ].distance < 0.25 ||
        ints[ 0 ].object.uuid === this.objectsToIntersectWith[ 0 ].uuid ) {
        
        // "disabled" state: no interesections, too close, or pointing at surface unable to tp on
        
        c.children[ 1 ].scale.z = 0;
        c.children[ 0 ].material.color.setHex( 0xffffff );
        
    } else {
        
        // enabled state
    
        c.children[ 1 ].scale.z = ints[ 0 ].distance;
        c.children[ 0 ].material.color.setHex( 0x88ff88 );
        
    }
    
    // Don't check every controller on each frame, instead do just one, as the player won't notice anything and it is less expensive
    if ( ++this.controllerToCheck >= this.activeControllers.length ) {
        
        this.controllerToCheck = 0;
        
    }
    
};
