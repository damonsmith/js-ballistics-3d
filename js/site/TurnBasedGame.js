TurnBasedGame = function() {
	
	this.tanks = [];
	
	this.selectedTank;
	
	this.playerList = [ //all positions are + random() * 100.
         {name: "Player 1", color: "red", x: -200, z: -200},                   
         {name: "Player 2", color: "yellow", x: 100, z: 100},
         {name: "Player 3", color: "green", x: -200, z: 100},
         {name: "Player 4", color: "blue", x: 100, z: -200}
 	];
	
	document.getElementById("gameInfo").style.display = "block";
};

TurnBasedGame.prototype.setupGame = function() {
	
	var numberOfPlayers = document.getElementById("numberOfPlayers").value;
	
	this.world = new World();
	
	this.turnEnded = true;
	
	var i, tank;
	for (i=0; i<numberOfPlayers; i++) {
		var player = this.playerList[i];
		
		tank = new Tank(
				player.x + (Math.random() * 100), 
				player.z + (Math.random() * 100), 
				this.world, 
				this.world.audioMixer, 
				player.name, 
				player.color);
		
		this.tanks.push(tank);
		tank.setTankEventListener(this);
	    this.world.addObject(tank);
	}
	this.selectedTank = tank;
	document.getElementById("gameInfo").style.display = "none";
	this.endTurn();
};

TurnBasedGame.prototype.endTurn = function() {
	this.turnEnded = true;
	var nextPlayer = this.playerList[this.getNextPlayerNumber()];
	document.getElementById("next-turn-unit-name").innerHTML = nextPlayer.name;
	document.getElementById("turn-unit-color").style.backgroundColor = nextPlayer.color;
	document.getElementById("turnInfo").style.display = "block";
};

TurnBasedGame.prototype.getNextPlayerNumber = function() {
	var currentPlayerNumber = this.tanks.indexOf(this.selectedTank);
	return (currentPlayerNumber+1)%this.tanks.length;
};

TurnBasedGame.prototype.startNextTurn = function() {
	if (this.turnEnded) {
		var nextPlayerNumber = this.getNextPlayerNumber();
		this.selectedTank = this.tanks[nextPlayerNumber];
		this.world.controls.selectUnit(this.selectedTank);
		this.selectedTank.canFire = true;
		this.world.controls.setView("far");
		document.getElementById("turnInfo").style.display = "none";
		this.turnEnded = false;
	}
};

TurnBasedGame.prototype.bombFired = function(tank, bomb) {
	tank.canFire = false;
	bomb.setBombEventListener(this);
};

TurnBasedGame.prototype.bombLanded = function(bomb) {
	this.endTurn();
};

TurnBasedGame.prototype.tankDestroyed = function(tank) {
	
};

TurnBasedGame.create = function() {
	window.addEventListener("load", function() {
		TurnBasedGame.instance = new TurnBasedGame();
	});
};

//in lieu of proper events:
TurnBasedGame.addObject = function(object) {
	TurnBasedGame.instance.world.addObject(object);
};

TurnBasedGame.removeObject = function(object) {
	TurnBasedGame.instance.world.removeObject(object);
};
