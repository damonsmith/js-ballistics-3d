GameRules = function(world) {
	
	this.world = world;
	
	this.tanks = [];
	
	this.selectedTank;
	
	this.startingPositions = [//all positions are + random() * 100.
	    {x: -200, z: -200},
	    {x: 100, z: 100},
	    {x: -200, z: 100},
	    {x: 100, z: -200},
	];
};

GameRules.prototype.setupGame = function(playerList) {
	var i, tank;
	for (i=0; i<playerList.length; i++) {
		var pos = this.startingPositions[i];
		tank = new Tank(pos.x + (Math.random() * 100), pos.z + (Math.random() * 100), this.world.landscape, this.world.audioMixer, playerList[i].name, playerList[i].color);
		this.tanks.push(tank);
		tank.setTankEventListener(this);
	    this.world.addObject(tank);
	}
	this.selectedTank = tank;
	this.nextTurn();
};


GameRules.prototype.nextTurn = function() {
	var currentPlayerNumber = this.tanks.indexOf(this.selectedTank);
	var nextPlayerNumber = (currentPlayerNumber+1)%this.tanks.length;
	this.selectedTank = this.tanks[nextPlayerNumber];
	this.world.controls.selectUnit(this.selectedTank);
	this.selectedTank.canFire = true;
	this.world.controls.setView("far");
};

GameRules.prototype.bombFired = function(tank, bomb) {
	tank.canFire = false;
	bomb.setBombEventListener(this);
};

GameRules.prototype.bombLanded = function(bomb) {
	this.nextTurn();
};

GameRules.prototype.tankDestroyed = function(tank) {
	
};
