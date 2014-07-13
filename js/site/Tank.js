function Tank(xPos, zPos, landscape, audioMixer) {
    this.audioMixer = audioMixer;

    this.fireSample = window['assets/samples/tank-fire-mono-s16-44100.raw'];

	this.landscape = landscape;
	
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

    this.container.position.x = xPos;
    this.container.position.z = zPos;
    this.container.position.y = this.landscape.getAltitude(xPos, zPos);
    
    this.actions = {};
}

Tank.prototype.step = function(delta) {
    if (this.actions.up) {
        this.parts.gun.rotation.z += delta;
    }
    if (this.actions.down) {
        this.parts.gun.rotation.z -= delta;
    }
    if (this.actions.left) {
        this.parts.turret.rotation.y += delta;
    }
    if (this.actions.right) {
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
        var velocity = 30;
//        var velocity = 9.8;
        var vector = {};
        vector.x = (yComponent * Math.cos(this.parts.turret.rotation.y)) * velocity;
        vector.y = Math.sin(this.parts.gun.rotation.z) * velocity;
        vector.z = (yComponent * -Math.sin(this.parts.turret.rotation.y)) * velocity;
        World.addObject(new Bomb(position, vector, this.audioMixer));
        this.audioMixer.triggerSample(0, this.fireSample, 44100);
    }
};

