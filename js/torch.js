// A torch!
var Torch = function( x, y, z, angle )
{
    // Too much hard-coded.
    var geometry = new THREE.BoxGeometry( 0.07, 0.35, 0.07 );
    var material = new THREE.MeshNormalMaterial();

    var torchPos = new THREE.Vector3( 0.45, 0.18, 0 );
    var lightPos = new THREE.Vector3( 0.37, 0.18 + 0.2, 0 );
    var rotationVec = new THREE.Vector3( 0, 0, 0.39 );

    var realPos = new THREE.Vector3( x, y, z );

    torchPos.rotateToY( angle );
    lightPos.rotateToY( angle );
    rotationVec.rotateY( angle );

    torchPos.add( realPos );
    lightPos.add( realPos );

    this.torch = new THREE.Mesh( geometry, material );
    this.torch.position.copy( torchPos );
    this.torch.rotation.setFromVector3( rotationVec );
    scene.add( this.torch );

    this.light = new THREE.PointLight( 0xFF6600, 1, 3 );
    this.light.position.copy( lightPos );
    scene.add( this.light );

    /*var pointLightHelper = new THREE.PointLightHelper( this.light, 0.01 );
    scene.add( pointLightHelper );*/
};

/*Torch.prototype.update = function( delta )
{
    this.light.intensity = rnd( 90, 100 ) / 100.0;
};*/
