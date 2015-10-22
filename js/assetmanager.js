var Asset = {

    textures: [],

    init: function()
    {
        this.textureLoader = new THREE.TextureLoader();
    },

    texture: function( name )
    {
        return this.textures[ name ] = this.textures[ name ] || this.textureLoader.load(
            "res/" + name,
            function( texture ) {},
            function( xhr ) {},
            function( xhr )
            {
                console.warn( "Couldn't load " + name + "!" );
            }
        );
    },

};
