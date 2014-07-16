function Tank(xPos, zPos, landscape, audioMixer, name, color) {

	this.name = name;
	
	this.canFire = false;

	this.maxPower = 150;
	
	this.eventListener = null;
	
	this.audioMixer = audioMixer;

	this.fireSample = window['assets/samples/tank-fire-mono-s16-44100.raw'];

	this.firingPower = 10;

	this.controlPanel = {};
	this.controlPanel.selectedUnitName = $("#selected-unit-name");
	this.controlPanel.unitColor = $("#unit-color");
	this.controlPanel.firingPower = $("#unit-info-firing-power");
	this.controlPanel.weaponType = $("#unit-info-weapon-type");

	this.landscape = landscape;

	this.tankColors = {
		red : {
			body : "FF0000",
			gunTip : "404040"
		},
		green : {
			body : "00FF00",
			gunTip : "404040"
		},
		blue : {
			body : "0000FF",
			gunTip : "404040"
		},
		yellow : {
			body : "FFFF00",
			gunTip : "404040"
		}
	};

	this.colorScheme = this.tankColors[color];

	var material = new THREE.MeshLambertMaterial({
		color : parseInt(this.colorScheme.body, 16)
	});
	var gunTipMaterial = new THREE.MeshLambertMaterial({
		color : parseInt(this.colorScheme.gunTip, 16)
	});

	this.parts = {};
	this.parts.base = new THREE.Object3D();
	var baseBox = new THREE.BoxGeometry(5, 2, 4);
	var mesh = new THREE.Mesh(baseBox, material);
	this.parts.base.add(mesh);

	this.parts.turret = new THREE.Object3D();
	var turretBox = new THREE.BoxGeometry(2, 2, 2);
	var mesh = new THREE.Mesh(turretBox, material);
	this.parts.turret.add(mesh);
	this.parts.turret.position.y = 2;

	this.parts.gun = new THREE.Object3D();
	var gunBox = new THREE.BoxGeometry(4, 0.4, 0.4);
	var mesh = new THREE.Mesh(gunBox, material);
	this.parts.gunMesh = mesh;
	this.parts.gun.add(mesh);

	mesh.applyMatrix(new THREE.Matrix4().makeTranslation(2, 0, 0));

	this.parts.gunTip = new THREE.Object3D();
	var gunTipBox = new THREE.BoxGeometry(0.1, 0.4, 0.4);
	var gunTipMesh = new THREE.Mesh(gunTipBox, gunTipMaterial);
	this.parts.gunTipMesh = gunTipMesh;
	this.parts.gunTip.add(gunTipMesh);
	gunTipMesh.applyMatrix(new THREE.Matrix4().makeTranslation(4, 0, 0));

	this.parts.gun.add(this.parts.gunTip);
	this.parts.turret.add(this.parts.gun);

	this.parts.leftTrack = new THREE.Object3D();
	var leftTrackBox = new THREE.BoxGeometry(5.5, 1, 0.5);
	var mesh = new THREE.Mesh(leftTrackBox, material);
	this.parts.leftTrack.add(mesh);
	this.parts.leftTrack.position.z = 2.5;
	this.parts.leftTrack.position.y = -0.5;

	this.parts.rightTrack = new THREE.Object3D();
	var rightTrackBox = new THREE.BoxGeometry(5.5, 1, 0.5);
	var mesh = new THREE.Mesh(rightTrackBox, material);
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
	this.container.position.y = 1 + this.landscape.getAltitude(xPos, zPos);

	this.actions = {
		up : false,
		down : false,
		left : false,
		right : false,
		powerUp : false,
		powerDown : false
	};
}

Tank.prototype.beginAction = function(name) {
	if (name !== "fire") {
		this.actions[name] = true;
	}
};

Tank.prototype.endAction = function(name) {
	if (name === "fire") {
		this.fire();
	} else {
		this.actions[name] = false;
	}
};

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
	if (this.actions.powerUp) {
		if (this.firingPower < this.maxPower) {
			this.firingPower++;
			this.controlPanel.firingPower[0].innerHTML = this.firingPower;
		}
	}
	if (this.actions.powerDown) {
		if (this.firingPower > 1) {
			this.firingPower--;
			this.controlPanel.firingPower[0].innerHTML = this.firingPower;
		}
	}
}

Tank.prototype.radToDeg = function(radians) {
	return (radians * (180 / Math.PI)).toFixed(1);
};

Tank.prototype.setSelected = function() {
	this.controlPanel.selectedUnitName[0].innerHTML = this.name;
	this.controlPanel.unitColor[0].style.backgroundColor = "#" + this.colorScheme.body;
	this.controlPanel.firingPower[0].innerHTML = this.firingPower;
};

Tank.prototype.setTankEventListener = function(listener) {
	this.eventListener = listener;
};

Tank.prototype.fire = function() {
	if (this.canFire) {
		var position = new THREE.Vector3();
		this.parts.gunTipMesh.parent.updateMatrixWorld();
		position.setFromMatrixPosition(this.parts.gunTipMesh.matrixWorld);
		var yComponent = Math.cos(this.parts.gun.rotation.z);
		var vector = {};
		vector.x = (yComponent * Math.cos(this.parts.turret.rotation.y)) * this.firingPower;
		vector.y = Math.sin(this.parts.gun.rotation.z) * this.firingPower;
		vector.z = (yComponent * -Math.sin(this.parts.turret.rotation.y)) * this.firingPower;
		var bomb = new Bomb(position, vector, this.audioMixer);
		World.addObject(bomb);
		this.audioMixer.triggerSample(0, this.fireSample, 44100);
		if (this.eventListener) {
			this.eventListener.bombFired(this, bomb);
		}
	}
};
