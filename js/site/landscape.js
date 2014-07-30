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
    };

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
    };
    
    window.game.scenery.Landscape.prototype.terraform = function() {
        this.diamondSquare(0,0,this.xpoints,this.ypoints,START_VARIANCE,Math.floor(this.xpoints / 2));
    };

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
    };



    /* this function basically defines a hemispherical hole of radius sqrt(r2) - returning the depth at point (x,y) */
    window.game.scenery.Landscape.prototype.getIndentDepth = function(x,y,r2) {
        var craterDepthScale = 1.5;
        var t = x*x+y*y;
        if ((r2 - t) > 0) { /* inside circle */
            return Math.sqrt(r2 - t) * craterDepthScale;
        } else {
            return 0;
        }
    }

    window.game.scenery.Landscape.prototype.indent = function(x,y,radius) {
        var i, j, r2 = radius * radius;
        x = Math.floor(x);
        y = Math.floor(y);

        var realX = Math.floor(x + (this.xpoints /2));
        var realY = Math.floor(y + (this.ypoints /2));

        for (i=Math.floor(-radius); i<radius; i++) {
            for (j=Math.floor(-radius); j<radius; j++) {
                this.setElevation(x+i, y+j, this.getElevation(x+i,y+j) - this.getIndentDepth(i, j, r2));
                this.updateVerticeAt(realX+i,realY+j);
            }
        }
        this.surfaceGeometry.verticesNeedUpdate=true;
        this.surfaceGeometry.normalsNeedUpdate=true;
        this.surfaceGeometry.tangentsNeedUpdate = true;
        this.surfaceGeometry.dynamic=true;
    }

    window.game.scenery.Landscape.prototype.updateVerticeAt = function(x,z) {
        var height = this.points[x][z];
        this.surfaceGeometry.vertices[x*this.ypoints + z].y = (height < 0) ? 0 : height;
    }

    window.game.scenery.Landscape.prototype.setVerticeAt = function(x,z) {
        var height = this.points[x][z];
        if (height < 0) {
            height = 0;
        }
        this.surfaceGeometry.vertices[x*this.ypoints + z] =
            new THREE.Vector3(x-(this.xpoints/2),height,z-(this.ypoints/2));
    }

    window.game.scenery.Landscape.prototype.getMesh = function() {
        /* landscape gets built on the XZ plane, with Y corresponding to height */
        this.surfaceGeometry = new THREE.Geometry();
        this.surfaceGeometry.dynamic=true;
        for (var x = 0 ; x < this.xpoints; x++) {
            for (var y = 0; y < this.ypoints; y++) {
                this.setVerticeAt(x,y);
            }
        }
        
        
        for (var x = 0 ; x < (this.xpoints-1); x++) {
            for (var y = 0; y < (this.ypoints-1); y++) {
                var xy = (y*this.xpoints)+x;
                this.surfaceGeometry.faces.push(new THREE.Face3(xy,xy+1,xy+1+this.xpoints));
                this.surfaceGeometry.faces.push(new THREE.Face3(xy,xy+1+this.xpoints,xy+this.xpoints));
            }
        }
        this.surfaceGeometry.computeFaceNormals();
        this.surfaceGeometry.computeVertexNormals();
//        var material = new THREE.MeshPhongMaterial( { ambient: 0x403030, color: 0xdddddd, specular: 0x262320, shininess: 5, shading: THREE.SmoothShading });
        var material = new THREE.MeshLambertMaterial({color: 0xcccccc, ambient: 0x303030, emissive: 0x000200, shading: THREE.SmoothShading});
        var mesh = new THREE.Mesh( this.surfaceGeometry, material );
        mesh.geometry.dynamic = true;
        mesh.position.y = 0;	
		return mesh;        
    };
    
    window.game.scenery.Landscape.prototype.getElevation = function(x, z) {
    	var xPoints, altitude = 0;
    	xPoints = this.points[Math.floor(x + (this.xpoints /2))];
    	if (xPoints) {
    		altitude = xPoints[Math.floor(z + (this.ypoints / 2))];
    	}
        if (altitude < 0) {
            altitude = 0;
        }
        return altitude;
    };
    
    window.game.scenery.Landscape.prototype.setElevation = function(x, z, newElevation) {
    	var xPoints, altitude = 0;
    	xPoints = this.points[Math.floor(x + (this.xpoints /2))];
    	if (xPoints) {
    		xPoints[Math.floor(z + (this.ypoints / 2))] = Math.max(0, newElevation);
    	}
    };

    
    
})(window, THREE);
