(function ($, window) {
    "use strict";

    // var recordTexture =
    //     THREE.ImageUtils.loadTexture("./images/textures/vinyl/texture-512x512-vinyl-chuckrock.png",
    //         THREE.UVMapping,
    //         undefined,
    //         function(e) {
    //             console.log("Error",e);
    //         }
    //     );


    window.onload = function() {

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( 800, 600 );
        $('#container').append( renderer.domElement );

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(
            40,             // Field of view
            800 / 600,      // Aspect ratio
            0.1,            // Near plane
            10000           // Far plane
        );
        camera.position.set( 0, 50, 120 );
        camera.lookAt( scene.position );
        
        var tank = new Tank();
        tank.addToScene(scene);

        var light = new THREE.PointLight( 0xFFFFFF );
        light.position.set( 10, 7, 10 );
        scene.add( light );

        var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( ambient );

        var clock = new THREE.Clock;

        function render() {
            var delta = clock.getDelta();

            tank.step(delta);

            renderer.render(scene, camera);

            requestAnimationFrame(render);
        }

        render();
    };


})($, window);

