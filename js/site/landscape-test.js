(function ($, window) {
    "use strict";

    window.onload = function() {

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( 800, 600 );
        $('#container').append( renderer.domElement );

        var scene = new THREE.Scene();

        var landscape = new game.scenery.Landscape();
        console.log("Now terraforming.. ");
        landscape.terraform();
        console.log(".. terraforming done. ");

        var camera = new THREE.PerspectiveCamera(
            80,             // Field of view
            800 / 600,      // Aspect ratio
            0.1,            // Near plane
            10000           // Far plane
        );
        camera.position.set( 0, 2, -500 );
        camera.lookAt( scene.position );

        var combined = new THREE.Object3D();
        combined.add(landscape.getMesh());
        scene.add( combined );

        var light = new THREE.PointLight( 0xFFFFFF );
        light.position.set( 200, 700, 0 );
        scene.add( light );

        var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( ambient );

        var controls = new THREE.FirstPersonControls( camera, renderer.domElement );

        controls.movementSpeed = 70;
        controls.lookSpeed = 0.05;
        controls.noFly = true;
        controls.lookVertical = false;

        var clock = new THREE.Clock;

        function render() {
            renderer.render(scene, camera);
            controls.update(clock.getDelta());
            requestAnimationFrame(render);
        }

        render();

        //setupMouseListeners(renderer.domElement, combined)

    };

    var setupMouseListeners = function(canvas, sceneRoot) {
        var mouseDown = false,
            mouseX = 0,
            mouseY = 0;

        function onMouseMove(evt) {
            if (!mouseDown) {
                return;
            }

            evt.preventDefault();

            var deltaX = evt.clientX - mouseX,
                deltaY = evt.clientY - mouseY;
            mouseX = evt.clientX;
            mouseY = evt.clientY;
            rotateScene(deltaX, deltaY);
        }

        function onMouseDown(evt) {
            evt.preventDefault();

            mouseDown = true;
            mouseX = evt.clientX;
            mouseY = evt.clientY;
        }

        function onMouseUp(evt) {
            evt.preventDefault();

            mouseDown = false;
        }

        function addMouseHandler() {
            canvas.addEventListener('mousemove', function (e) {
                onMouseMove(e);
            }, false);
            canvas.addEventListener('mousedown', function (e) {
                onMouseDown(e);
            }, false);
            canvas.addEventListener('mouseup', function (e) {
                onMouseUp(e);
            }, false);
        }

        function rotateScene(deltaX, deltaY) {
            sceneRoot.rotation.x += deltaX / 100;
            sceneRoot.rotation.z += deltaY / 100;
        }

        addMouseHandler(canvas);
    }


})($, window);

