function Tank() {

    var material = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
    var gunTipMaterial = new THREE.MeshLambertMaterial( { color: 0x404040 } );

    this.parts = {};
    this.parts.base = new THREE.Object3D();
    var baseBox = new THREE.BoxGeometry( 5, 2, 4 );
    var mesh = new THREE.Mesh( baseBox, material );
    this.parts.base.add(mesh);

    this.parts.turret = new THREE.Object3D();
    var turretBox = new THREE.BoxGeometry( 2, 2, 2 );
    var mesh = new THREE.Mesh( turretBox, material );
    this.parts.turret.add(mesh);
    this.parts.turret.position.y = 2;

    this.parts.gun = new THREE.Object3D();
    var gunBox = new THREE.BoxGeometry( 4, 0.4, 0.4 );
    var mesh = new THREE.Mesh( gunBox, material );
    this.parts.gunMesh = mesh;
    this.parts.gun.add(mesh);

    mesh.applyMatrix( new THREE.Matrix4().makeTranslation(2, 0, 0) );

    this.parts.gunTip = new THREE.Object3D();
    var gunTipBox = new THREE.BoxGeometry(0.1,0.4,0.4);
    var gunTipMesh = new THREE.Mesh(gunTipBox, gunTipMaterial);
    this.parts.gunTipMesh = gunTipMesh;
    this.parts.gunTip.add(gunTipMesh);
    gunTipMesh.applyMatrix(new THREE.Matrix4().makeTranslation(4,0,0));


    this.parts.gun.add(this.parts.gunTip);
    this.parts.turret.add(this.parts.gun);

    this.parts.leftTrack = new THREE.Object3D();
    var leftTrackBox = new THREE.BoxGeometry( 5.5, 1, 0.5 );
    var mesh = new THREE.Mesh( leftTrackBox, material );
    this.parts.leftTrack.add(mesh);
    this.parts.leftTrack.position.z = 2.5;
    this.parts.leftTrack.position.y = -0.5;

    this.parts.rightTrack = new THREE.Object3D();
    var rightTrackBox = new THREE.BoxGeometry( 5.5, 1, 0.5 );
    var mesh = new THREE.Mesh( rightTrackBox, material );
    this.parts.rightTrack.add(mesh);
    this.parts.rightTrack.position.z = -2.5;
    this.parts.rightTrack.position.y = -0.5;

    this.container = new THREE.Object3D();
    this.container.add(this.parts.base);
    this.container.add(this.parts.turret);
    this.container.add(this.parts.leftTrack);
    this.container.add(this.parts.rightTrack);

    this.keys = {};
    var self = this;
    window.addEventListener("keydown", function(event) {
        if (event.keyCode == 40) {
            self.keys.down = true;
        }
        else if (event.keyCode == 38) {
            self.keys.up = true;
        }
        else if (event.keyCode == 37) {
            self.keys.left = true;
        }
        else if (event.keyCode == 39) {
            self.keys.right = true;
        }
    });

    window.addEventListener("keyup", function(event) {
        if (event.keyCode == 40) {
            self.keys.down = false;
        }
        else if (event.keyCode == 38) {
            self.keys.up = false;
        }
        else if (event.keyCode == 37) {
            self.keys.left = false;
        }
        else if (event.keyCode == 39) {
            self.keys.right = false;
        }
        else if (event.keyCode == 70) {
            self.fire();
        }
    });

}

Tank.prototype.step = function(delta) {
    if (this.keys.up) {
        this.parts.gun.rotation.z += delta;
    }
    if (this.keys.down) {
        this.parts.gun.rotation.z -= delta;
    }
    if (this.keys.left) {
        this.parts.turret.rotation.y += delta;
    }
    if (this.keys.right) {
        this.parts.turret.rotation.y -= delta;
    }
    if (this.bomb) {
        this.bomb.step(delta);
    }
}

Tank.prototype.fire = function() {
    if (!this.bomb) {
        var position = new THREE.Vector3();
        this.parts.gunTipMesh.parent.updateMatrixWorld();
        position.setFromMatrixPosition( this.parts.gunTipMesh.matrixWorld );
        var yComponent = Math.cos(this.parts.gun.rotation.z);
        var velocity = 9.8;
        var vector = {};
        vector.x = (yComponent * Math.cos(this.parts.turret.rotation.y)) * velocity;
        vector.y = Math.sin(this.parts.gun.rotation.z) * velocity;
        vector.z = (yComponent * -Math.sin(this.parts.turret.rotation.y)) * velocity;
        World.addObject(new Bomb(position, vector));
    }
};

