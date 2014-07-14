function World(audioMixer) {
    this.audioMixer = audioMixer;
	this.clock = new THREE.Clock;
	this.renderer = new THREE.WebGLRenderer();
	
	this.renderer.setSize( 1024, 600 );
    $('#container').append( this.renderer.domElement );

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
        70,             // Field of view
        1024 / 600,      // Aspect ratio
        0.1,            // Near plane
        10000           // Far plane
    );
    
    this.objects = [];
    
    var light = new THREE.PointLight( 0xFFFFFF );
    light.position.set( 10, 700, -300 );
    
    this.scene.add( light );

    var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
    this.scene.add( ambient );
    
    //Wrap the render function so that it is called as a method when it is used in requestAnimationFrame:
    var self = this;
    this.renderFunction = function() {
    	self.render();
    }
    
    this.landscape = new game.scenery.Landscape();
    console.log("Now terraforming.. ");
    this.landscape.terraform();
    console.log(".. terraforming done. ");
    
    var landscapeModel = new THREE.Object3D();
    landscapeModel.add(this.landscape.getMesh());
    this.scene.add( landscapeModel );
    
    var tank = new Tank(10, 200, this.landscape, audioMixer);
    this.addObject(tank);
    this.scene.updateMatrixWorld(true);
    
    this.controls = new Controls(this.camera, this.renderer.domElement);
    this.controls.selectUnit(tank);
    
    this.scene.add(this.controls.getObject());

    window.setTimeout(this.renderFunction, 1);
}

World.prototype.render = function() {
    var delta = this.clock.getDelta();

    for (var i=0; i<this.objects.length; i++) {
    	this.objects[i].step(delta);
    }
    
    this.controls.step(delta);

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.renderFunction);
};

World.prototype.addObject = function(object) {
	this.scene.add(object.container);
    this.objects.push(object);
};

World.prototype.removeObject = function(object) {
    var index = this.objects.indexOf(object);

    if (index > -1) {
        this.objects.splice(index, 1);
        this.scene.remove(object.container);
    }
};

//Global functions:
World.create = function(audioMixer) {
	window.addEventListener("load", function() {
		window.world = new World(audioMixer);
	});
};

//in lieu of proper events:
World.addObject = function(object) {
	world.addObject(object);
};

World.removeObject = function(object) {
	world.removeObject(object);
};
