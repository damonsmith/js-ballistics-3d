(function ($, window) {
    "use strict";

    var recordTexture =
        THREE.ImageUtils.loadTexture("./images/textures/vinyl/texture-512x512-vinyl-chuckrock.png",
            THREE.UVMapping,
            undefined,
            function(e) {
                console.log("Error",e);
            }
        );


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
        camera.position.set( -3, 3, 4 );
        camera.lookAt( scene.position );

        var combined = new THREE.Object3D();

        var recordCombined = new THREE.Object3D();
        recordCombined.add(base())
        combined.add(recordCombined);
        combined.rotation.y=0;

        scene.add( combined );

        var light = new THREE.PointLight( 0xFFFFFF );
        light.position.set( 10, 7, 10 );
        scene.add( light );

        var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( ambient );


        var clock = new THREE.Clock;

        function render() {
            recordCombined.rotation.y -= clock.getDelta();
            renderer.render(scene, camera);

            requestAnimationFrame(render);
        }

        render();
    };

    var baseHeight = 0.5, baseWidth = 5, baseDepth=3.5;

    var base = function() {
        var geometry = new THREE.CubeGeometry(baseWidth,baseHeight,baseDepth); /* 80cm x 50cm x 10cm */
        var material = new THREE.MeshLambertMaterial( { color: 0x808080 } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x=0.8;
        mesh.position.y = baseHeight/2;
        return mesh;
    }


})($, window);

