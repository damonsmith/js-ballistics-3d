function Bomb(position, vector, world, audioMixer) {

	this.hasExploded = false;

	this.world = world;

	this.worldSize = 1000;

	this.vector = vector;

	this.explosionRadius = 15;
	this.explosionDamage = 400;
	this.explosionTime = 1;// seconds
	this.explosionElapsedTime = 0;// seconds

	var material = new THREE.MeshLambertMaterial({
		color : 0xFF0000
	});

	this.parts = {};
	this.parts.body = new THREE.Object3D();
	var bodyBox = new THREE.SphereGeometry(0.3, 0.3, 0.3);
	var mesh = new THREE.Mesh(bodyBox, material);
	this.parts.body.add(mesh);

	this.parts.explosion = new THREE.Object3D();
	var explosionMaterial = new THREE.MeshLambertMaterial({
		color : 0xFF0000, transparent: true, opacity: 0.5
	});
	var explosionSphere = new THREE.SphereGeometry(this.explosionRadius,
			this.explosionRadius, this.explosionRadius);
	var explosionMesh = new THREE.Mesh(explosionSphere, explosionMaterial);
	this.parts.explosion.add(explosionMesh);
	this.parts.explosion.scale.set(0, 0, 0);

	this.container = new THREE.Object3D();
	this.container.add(this.parts.body);
	this.container.position.x = position.x;
	this.container.position.y = position.y;
	this.container.position.z = position.z;
	this.audioMixer = audioMixer;
	this.eventListener = null;
}

Bomb.prototype.step = function(delta) {
	if (!this.hasExploded) {
		this.container.position.x += delta * this.vector.x;
		this.container.position.y += delta * this.vector.y;
		this.container.position.z += delta * this.vector.z;

		this.container.rotation.x += delta;
		this.container.rotation.y += delta * 2;

		this.vector.y -= delta * 9.8;

		var x = this.container.position.x;
		var y = this.container.position.y;
		var z = this.container.position.z;
		if ((y < this.world.landscape.getElevation(x, z)) || y > 5000 || x > 1000
				|| x < -1000 || z > 1000 || z < -1000) {

			this.explode();
		}
	}
	if (this.hasExploded) {
		this.explosionElapsedTime += delta;

		if (this.explosionElapsedTime > this.explosionTime) {
			this.applyDamage();
			this.eventListener.bombLanded(this, this.container.position.x,
					this.container.position.z, this.explosionRadius);
			this.world.removeObject(this);
		} else {
			// It's important here that the sphere is created at full size, then
			// scaled from 0 back up to
			// 1. If the sphere is created very small then it doesn't scale up
			// well.
			var howFarThrough = (this.explosionElapsedTime / this.explosionTime);
			this.parts.explosion.scale.set(howFarThrough, howFarThrough,
					howFarThrough);
		}
	}
};

Bomb.prototype.addToScene = function(scene) {
	scene.add(this.container);
	this.scene = scene;
};

Bomb.prototype.setBombEventListener = function(listener) {
	this.eventListener = listener;
};

Bomb.prototype.explode = function() {
	this.container.add(this.parts.explosion);
	this.audioMixer.triggerSample(1,
			window['assets/samples/explosion-mono-s16-44100.raw'], 44100);
	this.hasExploded = true;
};

Bomb.prototype.applyDamage = function() {
	var i, len, object, distance, damage, distanceVector = new THREE.Vector3(0, 0, 0);

	var x = this.container.position.x;
	var y = this.container.position.y;
	var z = this.container.position.z;

	for (i = 0, len = this.world.objects.length; i < len; i++) {
		object = this.world.objects[i];
		if (typeof (object.damage) == "function") {
			
			distanceVector.set(
					x - object.container.position.x, 
					y - object.container.position.y, 
					z - object.container.position.z);
			distance = distanceVector.length();

			if (distance < this.explosionRadius) {
				damage = Math.pow(((this.explosionRadius - distance) / this.explosionRadius),2)
						* this.explosionDamage;
				object.damage(damage);
			}
			
		}
	}
};
