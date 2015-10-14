var Asset = {

    textures: [],

    texture: function( name )
    {
        if ( this.textures[ name ] )
        {
            return this.textures[ name ];
        }

        return this.textures[ name ] = THREE.ImageUtils.loadTexture(
            "res/" + name,
            null,
            function(){},
            function(){}
        );
    },

};
