function MaterialLibrary() {
	this.shadersEnabled = true;
	this.materials = {};
}

MaterialLibrary.getInstance = function() {
	if (!MaterialLibrary.instance) {
		MaterialLibrary.instance = new MaterialLibrary();
	}
	return MaterialLibrary.instance;
};

MaterialLibrary.prototype.disableShaders = function() {
	this.shadersEnabled = false;
	this.materials = {};
};

MaterialLibrary.prototype.enableShaders = function() {
	this.shadersEnabled = true;
	this.materials = {};
};

MaterialLibrary.prototype.getExplosion = function() {
	if (!this.materials.explosion) {

		if (this.shadersEnabled) {
			this.materials.explosion = new THREE.ShaderMaterial( {
		        uniforms: {
		            tExplosion: {
		                type: "t",
		                value: THREE.ImageUtils.loadTexture( 'images/explosion.png' )
		            },
		            time: { // float initialized to 0
		                type: "f",
		                value: 0.5
		            }
		        },
		        vertexShader: document.getElementById( 'explosionVertexShader' ).textContent,
		        fragmentShader: document.getElementById( 'explosionFragmentShader' ).textContent,
		        transparent: true, opacity: 0.9
		    } );	
		}
		else {
			this.materials.explosion = new THREE.MeshLambertMaterial({color : 0xFF0000});
		}
	}
	return this.materials.explosion;
};


