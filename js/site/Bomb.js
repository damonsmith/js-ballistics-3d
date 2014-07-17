function Bomb(position, vector, world, audioMixer) {

	this.world = world;
	
	this.worldSize = 1000;
	
    this.vector = vector;

    var material = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );

    this.parts = {};
    this.parts.body = new THREE.Object3D();
    var bodyBox = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    var mesh = new THREE.Mesh( bodyBox, material );
    this.parts.body.add(mesh);

    this.container = new THREE.Object3D();
    this.container.add(this.parts.body);
    this.container.position.x = position.x;
    this.container.position.y = position.y;
    this.container.position.z = position.z;
    this.audioMixer = audioMixer;
    this.eventListener = null;
}


Bomb.prototype.step = function(delta) {
    this.container.position.x += delta * this.vector.x;
    this.container.position.y += delta * this.vector.y;
    this.container.position.z += delta * this.vector.z;

    this.container.rotation.x += delta;
    this.container.rotation.y += delta*2;

    this.vector.y -= delta * 9.8;
    
    if (this.container.position.x > 1000 ||
		this.container.position.y <0 || this.container.position.y > 1000 ||
		this.container.position.z > 1000) {
    	
    	this.explode();
    }
    
};

Bomb.prototype.addToScene = function(scene) {
    scene.add(this.container);
    this.scene = scene;
};

Bomb.prototype.setBombEventListener = function(listener) {
	this.eventListener = listener;
}

Bomb.prototype.explode = function() {
	this.eventListener.bombLanded(this);
	this.world.removeObject(this);
    this.audioMixer.triggerSample(1, window['assets/samples/explosion-mono-s16-44100.raw'], 44100);
    
};


