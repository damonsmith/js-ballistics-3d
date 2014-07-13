function Controls(camera, canvas) {
	this.selectedUnit = null;

	this.camera = camera;
	this.canvas = canvas;

	this.fixedViews = {
    		top: [0,50,0],
    		far: [-20, 50, 120],
    		near: [-10, 10, 12],
    		side: [0, 0, 20],
    		map: [0, 500, 0]
    };
	
	var self = this;
	window.addEventListener("keydown", function(event) {

		if (self.selectedUnit) {
			if (event.keyCode == 40) {
				self.selectedUnit.actions.down = true;
			} else if (event.keyCode == 38) {
				self.selectedUnit.actions.up = true;
			} else if (event.keyCode == 37) {
				self.selectedUnit.actions.left = true;
			} else if (event.keyCode == 39) {
				self.selectedUnit.actions.right = true;
			}
		}
	});

	window.addEventListener("keyup", function(event) {
		if (self.selectedUnit) {
			if (event.keyCode == 40) {
				self.selectedUnit.actions.down = false;
			} else if (event.keyCode == 38) {
				self.selectedUnit.actions.up = false;
			} else if (event.keyCode == 37) {
				self.selectedUnit.actions.left = false;
			} else if (event.keyCode == 39) {
				self.selectedUnit.actions.right = false;
			} else if (event.keyCode == 70) {
				self.selectedUnit.fire();
			}
		}
	});
	
	this.setView("far");
	
	camera.rotation.set( 0, 0, 0 );	
	this.mouseDown = false, mouseX = 0, mouseY = 0;

	function onMouseDown(evt) {
		evt.preventDefault();
		mouseX = evt.clientX;
		mouseY = evt.clientY;
		self.mouseDown = true;
	}
	
	function onMouseUp(evt) {
		evt.preventDefault();
		mouseX = evt.clientX;
		mouseY = evt.clientY;
		self.mouseDown = false;
	}
	
	function onMouseMove(evt) {
		if (!self.mouseDown) {
			return;
		}

		evt.preventDefault();

		var deltaX = evt.clientX - mouseX, deltaY = evt.clientY - mouseY;
		mouseX = evt.clientX;
		mouseY = evt.clientY;
		self.rotateCamera(deltaX, deltaY);
	}
	
	this.canvas.addEventListener('mousemove', function (e) {
        onMouseMove(e);
    }, false);
	this.canvas.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
	this.canvas.addEventListener('mouseup', function (e) {
        onMouseUp(e);
    }, false);
	this.canvas.addEventListener('mouseout', function (e) {
        onMouseUp(e);
    }, false);

//	this.camControls = new THREE.FirstPersonControls( camera );
//	this.camControls.movementSpeed = 1;
//	this.camControls.lookSpeed = 1;
//	this.camControls.lookVertical = true;
	
	
}


Controls.prototype.step = function(delta) {
//	this.camControls.update(delta);
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
	this.camera.rotation.y -= x/500;
	this.camera.rotation.x -= y/500;
};

Controls.prototype.setView = function(name) {
	var view = this.fixedViews[name];
	if (this.selectedUnit) {
		var pos = this.selectedUnit.container.position;
		this.camera.position.set( view[0] + pos.x, view[1] + pos.y, view[2] + pos.z );
		this.camera.lookAt( pos );
	}
	else {
		this.camera.position.set( view[0], view[1], view[2] );	
		this.camera.lookAt( {x: 0, y: 0, z: 0} );
	}
	
	
};



