(function (window, THREE) {
    "use strict";
    window.game = window.game || {};
    window.game.scenery = window.game.scenery || {};

    var DEFAULT_POWER = 9;  /* 2^9 = 512, approx 500*500m grid */
    var DEFAULT_CORNER_HEIGHT = 0;
    var START_VARIANCE = 300.0;

    window.game.scenery.Landscape = function(power) {
        var dimension = (1 << (power || DEFAULT_POWER)) + 1;
        this.xpoints = dimension;
        this.ypoints = dimension;
        this.points = this.initialisePoints();
    }

    window.game.scenery.Landscape.prototype.initialisePoints = function() {
        var result = new Array(this.xpoints);
        for (var x = 0; x < this.xpoints; x++) {
            result[x] = new Array(this.ypoints);
            for (var y = 0; y < this.ypoints; y++) {
                result[x][y]=0.0;
            }
        }
        /* start by setting the four outer points to be 250.0 - approximate half height of 500m */
        result[0][0]=DEFAULT_CORNER_HEIGHT;
        result[0][this.ypoints-1]=DEFAULT_CORNER_HEIGHT;
        result[this.xpoints-1][0]=DEFAULT_CORNER_HEIGHT;
        result[this.xpoints-1][this.ypoints-1]=DEFAULT_CORNER_HEIGHT;
        return result;
    }


    window.game.scenery.Landscape.prototype.terraform = function() {
        this.diamondSquare(0,0,this.xpoints,this.ypoints,START_VARIANCE,Math.floor(this.xpoints / 2));
    }

    window.game.scenery.Landscape.prototype.diamondSquare = function(x1,y1,x2,y2,variance,level) {
        var a, b, c, d, e, f, g, i, j, l2 = Math.floor(level/2);
        if (level < 1) return;

        // diamonds
        for (i = x1 + level; i < x2; i += level) {
            for (j = y1 + level; j < y2; j += level) {
                a = this.points[i - level][j - level];
                b = this.points[i][j - level];
                c = this.points[i - level][j];
                d = this.points[i][j];
                this.points[i - l2][j - l2] = (a + b + c + d) / 4 + ((Math.random()-0.5) * variance);
            }
        }

        // squares
        for (i = x1 + 2 * level; i < x2; i += level) {
            for (j = y1 + 2 * level; j < y2; j += level) {
                a = this.points[i - level][j - level];
                b = this.points[i][j - level];
                c = this.points[i - level][j];
                d = this.points[i][j];
                e = this.points[i - l2][j - l2];

                this.points[i - level][j - l2] = (a + c + e + this.points[i - 3 * l2][j - l2]) / 4 + ((Math.random()-0.5) * variance);
                this.points[i - l2][j - level] = (a + b + e + this.points[i - l2][j - 3 * l2]) / 4 + ((Math.random()-0.5) * variance);
            }
        }

        this.diamondSquare(x1, y1, x2, y2, variance / 2, l2);
    }

    window.game.scenery.Landscape.prototype.getMesh = function() {
        /* landscape gets built on the XZ plane, with Y corresponding to height */
        var surfaceGeometry = new THREE.Geometry();
        for (var x = 0 ; x < this.xpoints; x++) {
            for (var y = 0; y < this.ypoints; y++) {
                var height = this.points[x][y];
                if (height < 0) {
                    height = 0;
                }
                surfaceGeometry.vertices.push(new THREE.Vector3(x,height,y));
                /* surfaceGeometry.faceVertexUvs[0].push([new THREE.Vector2(x/this.xpoints, y/this.ypoints)]); */
            }
        }
        for (var x = 0 ; x < (this.xpoints-1); x++) {
            for (var y = 0; y < (this.ypoints-1); y++) {
                var xy = (y*this.xpoints)+x;
                surfaceGeometry.faces.push(new THREE.Face3(xy,xy+1,xy+1+this.xpoints));
                surfaceGeometry.faces.push(new THREE.Face3(xy,xy+1+this.xpoints,xy+this.xpoints));
            }
        }
        surfaceGeometry.computeFaceNormals();
        surfaceGeometry.computeVertexNormals();
        var material = new THREE.MeshPhongMaterial( { ambient: 0x403030, color: 0xdddddd, specular: 0x262320, shininess: 5, shading: THREE.SmoothShading });
//        var material = new THREE.MeshLambertMaterial({color:0x63605a});
        var mesh = new THREE.Mesh( surfaceGeometry, material );
        mesh.position.x = -(this.xpoints/2);
        mesh.position.z = -(this.ypoints/2);
        mesh.position.y = 0;
        return mesh;
    }
    
    window.game.scenery.Landscape.prototype.getAltitude = function(x, y) {
        return this.points[x][y];
    }
    
})(window, THREE);
