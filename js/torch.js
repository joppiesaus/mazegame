var TorchBuilder =
{
    mesh: null,
    light: null,

    init: function()
    {
        // Too much hard-coded. It depends on the cube sizes, too.
        var geometry = new THREE.BoxGeometry( 0.07, 0.35, 0.07 );
        var material = new THREE.MeshNormalMaterial();

        this.mesh = new THREE.Mesh( geometry, material );
        this.light = new THREE.PointLight( 0xFF6600, 1, 3 );
    },
};

// A torch!
var Torch = function( pos, angle )
{
    var torchPos = new THREE.Vector3( 0.45, 0.18, 0 );
    var lightPos = new THREE.Vector3( 0.37, 0.18 + 0.2, 0 );
    var rotationVec = new THREE.Vector3( 0, 0, 0.39 );

    torchPos.rotateToY( angle );
    lightPos.rotateToY( angle );
    rotationVec.rotateY( angle );

    torchPos.add( pos );
    lightPos.add( pos );

    this.torch = TorchBuilder.mesh.clone();
    this.torch.position.copy( torchPos );
    this.torch.rotation.setFromVector3( rotationVec );
    scene.add( this.torch );

    this.light = TorchBuilder.light.clone();
    this.light.position.copy( lightPos );
    scene.add( this.light );

    /*var pointLightHelper = new THREE.PointLightHelper( this.light, 0.01 );
    scene.add( pointLightHelper );*/
};

/*Torch.prototype.update = function( delta )
{
    this.light.intensity = rnd( 90, 100 ) / 100.0;
};*/
