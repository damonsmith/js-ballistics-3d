function Smoke(xPos, zPos, world) {
    this.smokeParticles = new THREE.Geometry();
    for (var i = 0; i < 300; i++) {
        var particle = new THREE.Vector3(Math.random() * 32 - 16, Math.random() * 230, Math.random() * 32 - 16);
        this.smokeParticles.vertices.push(particle);
    }
    THREE.ImageUtils.crossOrigin = 'anonymous';
    var smokeTexture = THREE.ImageUtils.loadTexture('./images/smoke.png');
    this.smokeMaterial = new THREE.ParticleBasicMaterial({ map: smokeTexture, transparent: true, blending: THREE.AdditiveBlending, size: 50, color: 0x222222 });
    this.container = new THREE.ParticleSystem(this.smokeParticles, this.smokeMaterial);
    this.container.sortParticles = true;
    this.container.position.x = xPos;
    this.container.position.z = zPos;
    this.container.position.y = 1 + world.landscape.getElevation(xPos, zPos);
}

Smoke.prototype.step = function(delta) {
    var particleCount = this.smokeParticles.vertices.length;
    while (particleCount--) {
        var particle = this.smokeParticles.vertices[particleCount];
        particle.y += delta * 50;
     
        if (particle.y >= 230) {
            particle.y = Math.random() * 16;
            particle.x = Math.random() * 32 - 16;
            particle.z = Math.random() * 32 - 16;
        }
    }
    this.smokeParticles.__dirtyVertices = true;
};