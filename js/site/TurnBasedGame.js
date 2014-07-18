TurnBasedGame = function() {
	
	this.turnNumber = 0;
	
	this.tanks = [];
	
	this.tanksDestroyedList = [];
	this.tanksDestroyed = {};
	
	this.tanksDestroyedThisTurn = [];
	
	this.selectedTank;
	
	this.availablePlayerList = [ //all positions are + random() * 100.
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
		var player = this.availablePlayerList[i];
		
		tank = new Tank(
				player.x + (Math.random() * 100),
				player.z + (Math.random() * 100), 
				this.world, 
				this.world.audioMixer, 
				player.name, 
				player.color);
		
		this.tanks.push(tank);
		tank.player = player;
		tank.setTankEventListener(this);
	    this.world.addObject(tank);
	}
	this.selectedTank = tank;
	document.getElementById("gameInfo").style.display = "none";
	this.endTurn();
};

TurnBasedGame.prototype.endTurn = function() {
	this.turnEnded = true;
	if (this.tanksDestroyedList.length >= this.tanks.length - 1) {
		this.endGame();
	}
	else {
		var nextPlayer = this.getNextTank().player;
		document.getElementById("next-turn-unit-name").innerHTML = nextPlayer.name;
		document.getElementById("turn-unit-color").style.backgroundColor = nextPlayer.color;
		document.getElementById("turnInfo").style.display = "block";	
	}
};

TurnBasedGame.prototype.endGame = function() {
	if (this.tanksDestroyedList.length === this.tanks.length - 1) {
		
		var i, winningTank;
		for (i=0; i<this.tanks.length; i++) {
			if (!this.tanks[i].destroyed) {
				winningTank = this.tanks[i];
				break;
			}
		}
		
		$("#winning-player").html(winningTank.name + " wins!");
		$(".winning-player-color")[0].style.backgroundColor = winningTank.player.color;
		$("#endGameInfo").show();
	}
	else if (this.tanksDestroyedList.length === this.tanks.length) {
		$("#winning-player").html("Draw, all tanks destroyed.");
		$("#endGameInfo").show();
	}
};

TurnBasedGame.prototype.getNextTank = function() {
	var i, nextTank, currentTankNumber = this.tanks.indexOf(this.selectedTank);
	for (i=currentTankNumber + 1; i<(currentTankNumber + this.tanks.length); i++) {
		nextTank = this.tanks[i%this.tanks.length];
		if (!nextTank.destroyed) {
			return nextTank;
		}
	}
	throw "Code error, can't find next tank.";
};

TurnBasedGame.prototype.startNextTurn = function() {
	if (this.turnEnded) {
		this.turnNumber++;
		this.tanksDestroyedThisTurn = [];
		this.selectedTank = this.getNextTank();
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
	this.tanksDestroyed[tank.name] = {destroyedBy: this.selectedTank, turnNumber: this.turnNumber};
	this.tanksDestroyedList.push(tank);
	this.tanksDestroyedThisTurn.push(tank);
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
