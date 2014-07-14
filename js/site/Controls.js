function Controls(camera, canvas) {
	this.selectedUnit = null;

	this.camera = camera;
	this.canvas = canvas;
	this.PI_2 = Math.PI / 2;
	this.fixedViews = {
		top : [ 0, 50, 0 ],
		far : [ -20, 50, 120 ],
		near : [ -10, 10, 12 ],
		side : [ 0, 0, 20 ],
		map : [ 0, 500, 0 ]
	};

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.moveUp = false;
	
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
		self.mouseDown = true;
	}, false);
	this.canvas.addEventListener('mouseup', function(e) {
		self.mouseDown = false;
	}, false);
	this.canvas.addEventListener('mouseout', function(e) {
		self.mouseDown = false;
	}, false);
	
}

Controls.prototype.getObject = function() {
	return this.yawObject;
};

Controls.prototype.step = function(delta) {
	this.velocity.x -= this.velocity.x * 10.0 * delta;
	this.velocity.z -= this.velocity.z * 10.0 * delta;

	//this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

	if (this.moveForward)
		this.velocity.z -= 400.0 * delta;
	if (this.moveBackward)
		this.velocity.z += 400.0 * delta;
	if (this.moveLeft)
		this.velocity.x -= 400.0 * delta;
	if (this.moveRight)
		this.velocity.x += 400.0 * delta;
	if (this.moveUp)
		this.yawObject.translateY(100 * delta);
	if (this.moveDown)
		this.yawObject.translateY(-100 * delta);

	this.yawObject.translateX(this.velocity.x * delta);
	this.yawObject.translateZ(this.velocity.z * delta);
	
};

Controls.prototype.unselectUnit = function() {
	this.stop();
	this.selectedUnit = null;
};

Controls.prototype.selectUnit = function(unit) {
	this.selectedUnit = unit;
};

Controls.prototype.stop = function(unit) {
	this.selectedUnit.actions = {};
};

Controls.prototype.rotateCamera = function(x, y) {
	this.camera.rotation.y -= x / 500;
	this.camera.rotation.x -= y / 500;
};

Controls.prototype.setView = function(name) {
	var view = this.fixedViews[name];
	if (this.selectedUnit) {
		var pos = this.selectedUnit.container.position;
		this.yawObject.position.set(view[0] + pos.x, view[1] + pos.y, view[2]
				+ pos.z);
	} else {
		this.yawObject.position.set(view[0], view[1], view[2]);
	}
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

	event.preventDefault();
};

Controls.prototype.handleKeyDown = function(event) {
	if (this.selectedUnit) {
		if (event.keyCode == 40) {
			this.selectedUnit.actions.down = true;
		} else if (event.keyCode == 38) {
			this.selectedUnit.actions.up = true;
		} else if (event.keyCode == 37) {
			this.selectedUnit.actions.left = true;
		} else if (event.keyCode == 39) {
			this.selectedUnit.actions.right = true;
		} 
	}
	if (event.keyCode == 87) {
		this.moveForward = true;
	} else if (event.keyCode == 65) {
		this.moveLeft = true;
	} else if (event.keyCode == 83) {
		this.moveBackward = true;
	} else if (event.keyCode == 68) {
		this.moveRight = true;
	} else if (event.keyCode == 32) {
		this.moveUp = true;
	} else if (event.keyCode == 16) {
		this.moveDown = true;
	}
};


Controls.prototype.handleKeyUp = function(event) {
	if (this.selectedUnit) {
		if (event.keyCode == 40) {
			this.selectedUnit.actions.down = false;
		} else if (event.keyCode == 38) {
			this.selectedUnit.actions.up = false;
		} else if (event.keyCode == 37) {
			this.selectedUnit.actions.left = false;
		} else if (event.keyCode == 39) {
			this.selectedUnit.actions.right = false;
		} else if (event.keyCode == 70) {
			this.selectedUnit.fire();
		}
	}
	if (event.keyCode == 87) {
		this.moveForward = false;
	} else if (event.keyCode == 65) {
		this.moveLeft = false;
	} else if (event.keyCode == 83) {
		this.moveBackward = false;
	} else if (event.keyCode == 68) {
		this.moveRight = false;
	} else if (event.keyCode == 32) {
		this.moveUp = false;
	} else if (event.keyCode == 16) {
		this.moveDown = false;
	}
};


