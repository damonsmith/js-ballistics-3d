function Controls(camera, canvas) {
	this.selectedUnit = null;

	this.camera = camera;
	this.canvas = canvas;
	
	//user can't control it when this is true.
	this.cameraIsInTransition = false;

	this.keyboardTankControls = {
		// Tank controls keys:
		40 : "down",
		38 : "up",
		37 : "left",
		39 : "right",
		33 : "powerUp",
		34 : "powerDown",
		70 : "fire",
	};
	this.keyboardCameraControls = {
		// Flying controls
		87 : "moveForward",
		65 : "moveLeft",
		83 : "moveBackward",
		68 : "moveRight",
		32 : "moveUp",
		16 : "moveDown"
	};

	// Set up pointerlock so that the mouse cursor is locked inside
	// the canvas while you are clicking to look around.
	this.canvas.requestPointerLock = canvas.requestPointerLock
			|| this.canvas.mozRequestPointerLock
			|| this.canvas.webkitRequestPointerLock;

	document.exitPointerLock = document.exitPointerLock
			|| document.mozExitPointerLock || document.webkitExitPointerLock;

	this.PI_2 = Math.PI / 2;
	this.fixedViews = {
		top : [ 0, 50, 0 ],
		far : [ -20, 50, 120 ],
		near : [ -10, 10, 12 ],
		side : [ 0, 0, 20 ],
		map : [ 0, 500, 0 ]
	};
	this.actions = {};
	this.actions.moveForward = false;
	this.actions.moveBackward = false;
	this.actions.moveLeft = false;
	this.actions.moveRight = false;
	this.actions.moveUp = false;

	var self = this;
	window.addEventListener("keydown", function(event) {
		self.handleKeyDown(event);
	});

	window.addEventListener("keyup", function(event) {
		self.handleKeyUp(event);
	});

	camera.rotation.set(0, 0, 0);
	this.mouseDown = false;

	this.pitchObject = new THREE.Object3D();
	this.pitchObject.add(camera);

	this.yawObject = new THREE.Object3D();
	this.yawObject.position.y = 50;
	this.yawObject.position.x = 0;
	this.yawObject.position.z = 0;
	this.yawObject.add(this.pitchObject);

	this.velocity = new THREE.Vector3();

	this.canvas.addEventListener('mousemove', function(e) {
		self.handleMouseMove(e);
	}, false);
	this.canvas.addEventListener('mousedown', function(e) {
		self.handleMouseDown(e);
	}, false);
	this.canvas.addEventListener('mouseup', function(e) {
		self.handleMouseUp(e);
	}, false);
	this.canvas.addEventListener('mouseout', function(e) {
		self.mouseDown = false;
	}, false);

}

Controls.prototype.getObject = function() {
	return this.yawObject;
};

Controls.prototype.step = function(delta) {
	if (!this.cameraIsInTransition) {
		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;

		if (this.actions.moveForward)
			this.velocity.z -= 400.0 * delta;
		if (this.actions.moveBackward)
			this.velocity.z += 400.0 * delta;
		if (this.actions.moveLeft)
			this.velocity.x -= 400.0 * delta;
		if (this.actions.moveRight)
			this.velocity.x += 400.0 * delta;
		if (this.actions.moveUp)
			this.yawObject.translateY(100 * delta);
		if (this.actions.moveDown)
			this.yawObject.translateY(-100 * delta);

		this.yawObject.translateX(this.velocity.x * delta);
		this.yawObject.translateZ(this.velocity.z * delta);
	}
};

Controls.prototype.unselectUnit = function() {
	this.stop();
	this.selectedUnit = null;
};

Controls.prototype.selectUnit = function(unit) {
	this.selectedUnit = unit;
	unit.setSelected();
};

Controls.prototype.stop = function(unit) {
	this.selectedUnit.actions = {};
};

//Moves the camera to a named view like "far" or "near" from the selected unit, and rotates
//the camera to look at that unit.
Controls.prototype.setView = function(viewName) {
	if (this.selectedUnit) {
		var pos = this.getPositionForView(this.selectedUnit.container.position, viewName);
		this.yawObject.position.set(pos.x, pos.y, pos.z);
		this.lookAt(this.selectedUnit.container);
	} else {
		var pos = this.getPositionForView({x: 0, y: 0, z: 0}, viewName);
		this.yawObject.position.set(pos.x, pos.y, pos.z);
		//TODO it should look at something here too.
	}
};

//Returns the x,y,z coordinates that the camera should be in to get a named view on a position.
Controls.prototype.getPositionForView = function(target, viewName) {
	var view = this.fixedViews[viewName];
	return {
		x: view[0] + target.x,
		y: view[1] + target.y,
		z: view[2] + target.z
	};
};

Controls.prototype.saveCameraView = function() {
	return {
		x: this.yawObject.position.x,
		z: this.yawObject.position.z,
		p: this.pitchObject.rotation.x,
		y: this.yawObject.rotation.y
	};
};

Controls.prototype.restoreCameraView = function(view) {
	this.yawObject.position.x = view.x;
	this.yawObject.position.z = view.z;
	this.pitchObject.rotation.x = view.p;
	this.yawObject.rotation.y = view.y;
};

Controls.prototype.lookAt = function(object) {
	var angles = this.getLookAtFromPosition(object,this.yawObject.position);
	this.yawObject.rotation.y = angles.y;
	this.pitchObject.rotation.x = angles.p;
};

//Returns the pitch and yaw required to look at the given object from
//the given position.
Controls.prototype.getLookAtFromPosition = function(object, position) {
	var dx = position.x - object.position.x;
	var dy = object.position.y - position.y;
	var dz = position.z - object.position.z;

	if (dx === 0) {
		dx = 0.001;
	}
	var yawLength = Math.sqrt((dz * dz) + (dx * dx));
	var newYaw = Math.atan(dx / dz);
	var newPitch = Math.atan(dy / yawLength);
	return {y: newYaw, p: newPitch};
}

Controls.prototype.handleMouseDown = function(event) {
	this.mouseDown = true;
	this.canvas.requestPointerLock();
};

Controls.prototype.handleMouseUp = function(event) {
	this.mouseDown = false;
	document.exitPointerLock();
};

Controls.prototype.handleMouseMove = function(event) {
	if (!this.mouseDown) {
		return;
	}

	var movementX = event.movementX || event.mozMovementX
			|| event.webkitMovementX || 0;
	var movementY = event.movementY || event.mozMovementY
			|| event.webkitMovementY || 0;

	this.yawObject.rotation.y -= movementX * 0.002;
	this.pitchObject.rotation.x -= movementY * 0.002;

	this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2,
	this.pitchObject.rotation.x));
};

Controls.prototype.handleKeyDown = function(event) {
	var action;
	var handled = false;
	
	if (this.selectedUnit) {
		action = this.keyboardTankControls[event.keyCode];
		if (action) {
			this.selectedUnit.beginAction(action);
			handled = true;
		}
	}
	
	action = this.keyboardCameraControls[event.keyCode];
	if (action) {
		this.actions[action] = true;
		handled = true;
	}
	
	if (handled) {
		event.preventDefault();
	}
};

Controls.prototype.handleKeyUp = function(event) {
	var action;
	var handled = false;
	
	if (this.selectedUnit) {
		action = this.keyboardTankControls[event.keyCode];
		if (action) {
			this.selectedUnit.endAction(action);
			handled = true;
		}
	}
	
	action = this.keyboardCameraControls[event.keyCode];
	if (action) {
		this.actions[action] = false;
		handled = true;
	}
	
	if (handled) {
		event.preventDefault();
	}
};
