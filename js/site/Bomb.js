function Bomb(position, vector) {

    this.vector = vector;

    var material = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );

    this.parts = {};
    this.parts.body = new THREE.Object3D();
    var bodyBox = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    var mesh = new THREE.Mesh( bodyBox, material );
    this.parts.body.add(mesh);

    this.container = new THREE.Object3D();
    this.container.add(this.parts.body);
    this.container.position.x = position.x + 2;
    this.container.position.y = position.y + 4;
    this.container.position.z = position.z;
}


Bomb.prototype.step = function(delta) {
    this.container.position.x += delta * this.vector.x;
    this.container.position.y += delta * this.vector.y;
    this.container.position.y += delta * this.vector.z;
};

Bomb.prototype.addToScene = function(scene) {
    scene.add(this.container);
    this.scene = scene;
};

