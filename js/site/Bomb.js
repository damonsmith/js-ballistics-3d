function Bomb(position, vector, landscape, audioMixer) {

	this.worldSize = 1000;
	
    this.vector = vector;

    var material = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );

    this.parts = {};
    this.parts.body = new THREE.Object3D();
    var bodyBox = new THREE.SphereGeometry( 0.3, 0.3, 0.3 );
    var mesh = new THREE.Mesh( bodyBox, material );
    this.parts.body.add(mesh);

    this.container = new THREE.Object3D();
    this.container.add(this.parts.body);
    this.container.position.x = position.x;
    this.container.position.y = position.y;
    this.container.position.z = position.z;
    this.audioMixer = audioMixer;
    this.landscape = landscape;
    
}


Bomb.prototype.step = function(delta) {
    this.container.position.x += delta * this.vector.x;
    this.container.position.y += delta * this.vector.y;
    this.container.position.z += delta * this.vector.z;

    this.container.rotation.x += delta;
    this.container.rotation.y += delta*2;

    this.vector.y -= delta * 9.8;

    var x= this.container.position.x;
    var y = this.container.position.y;
    var z = this.container.position.z;
    if ( (y < this.landscape.getAltitude(x, z)) || y > 1000
        || x > 1000 || x < -1000
		|| z > 1000 || z < -1000
       ) {
    	
    	World.removeObject(this);
        this.audioMixer.triggerSample(1, window['assets/samples/explosion-mono-s16-44100.raw'], 44100);
    }
    
};

Bomb.prototype.addToScene = function(scene) {
    scene.add(this.container);
    this.scene = scene;
};

