TurnBasedGame = function() {
	
	this.turnNumber = 0;
	this.tanks = [];
	this.tanksDestroyedList = [];
	this.tanksDestroyed = {};
	this.tanksDestroyedThisTurn = [];
	this.selectedTank;
	
	this.availablePlayerList = [ //all positions are + random() * 100.
         {name: "Player 1", color: "red", x: -200, z: -200, healthBarElement: $("#player-1-status .health-bar-cover")},                   
         {name: "Player 2", color: "yellow", x: 100, z: 100, healthBarElement: $("#player-2-status .health-bar-cover")},
         {name: "Player 3", color: "green", x: -200, z: 100, healthBarElement: $("#player-3-status .health-bar-cover")},
         {name: "Player 4", color: "blue", x: 100, z: -200, healthBarElement: $("#player-4-status .health-bar-cover")}
 	];
	
	this.controlPanel = {};
	this.controlPanel.selectedUnitName = $("#selected-unit-name");
	this.controlPanel.unitColor = $("#unit-color");
	this.controlPanel.firingPower = $("#unit-info-firing-power");
	this.controlPanel.weaponType = $("#unit-info-weapon-type");
	
	
	$("#gameInfo").show();
};

TurnBasedGame.prototype.setupGame = function() {
	
	this.turnNumber = 0;
	this.tanks = [];
	this.tanksDestroyedList = [];
	this.tanksDestroyed = {};
	this.tanksDestroyedThisTurn = [];
	this.selectedTank;
	
	var numberOfPlayers = document.getElementById("numberOfPlayers").value;
	if (!this.world) {
		this.world = new World();	
	}
	
	this.world.setupLandscape();
	
	this.turnEnded = true;
	
	var i, tank, smoke;
	for (i=0; i<numberOfPlayers; i++) {
		var player = this.availablePlayerList[i];
		var xPos = player.x + (Math.random() * 100);
		var zPos = player.z + (Math.random() * 100);
		
		tank = new Tank(
				xPos,
				zPos, 
				this.world, 
				this.world.audioMixer, 
				player.name, 
				player.color);
		
		this.tanks.push(tank);
		tank.player = player;
		tank.setTankEventListener(this);
	    this.world.addObject(tank);
	    this.tankDamageChanged(tank);
	}
	
	$("#gameInfo").hide();
	
	//Setup the first round:
	//	select the last tank so that it will roll to the first:
	this.selectedTank = tank;
	this.turnEnded = true;
	this.startNextTurn();
};

TurnBasedGame.prototype.endTurn = function() {
	this.turnEnded = true;
	if (this.tanksDestroyedList.length >= this.tanks.length - 1) {
		this.endGame();
	}
	else {
		this.selectedTank.player.currentView = this.world.controls.saveCameraView();
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

TurnBasedGame.prototype.restart = function() {
	$("#endGameInfo").hide();
	$("#gameInfo").show();
	
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
		
		if (this.selectedTank.player.currentView) {
			this.world.controls.restoreCameraView(this.selectedTank.player.currentView);
			this.selectedTank.player.currentView = null;
		}
		else {
			this.world.controls.setView("near");	
		}
		
		document.getElementById("turnInfo").style.display = "none";
		
		this.controlPanel.selectedUnitName[0].innerHTML = this.selectedTank.name;
		this.controlPanel.unitColor[0].style.backgroundColor = "#" + this.selectedTank.colorScheme.body;
		this.controlPanel.firingPower[0].innerHTML = this.selectedTank.firingPower;
		
		this.turnEnded = false;
	}
};

/** Tank event handlers **/
TurnBasedGame.prototype.bombFired = function(tank, bomb) {
	tank.canFire = false;
	bomb.setBombEventListener(this);
};

TurnBasedGame.prototype.tankDestroyed = function(tank) {
	this.tanksDestroyed[tank.name] = {destroyedBy: this.selectedTank, turnNumber: this.turnNumber};
	this.tanksDestroyedList.push(tank);
	this.tanksDestroyedThisTurn.push(tank);
	tank.player.healthBarElement.width("100%");
};

TurnBasedGame.prototype.tankDamageChanged = function(tank) {
	var percentageLost = (tank.currentDamage / tank.damageCapacity) * 100;
	tank.player.healthBarElement.width(Math.ceil(percentageLost) + "%");
};

TurnBasedGame.prototype.firingPowerChanged = function(power) {
	this.controlPanel.firingPower[0].innerHTML = power;
};

TurnBasedGame.prototype.xAngleChanged = function(angle) {
	
};

TurnBasedGame.prototype.yAngleChanged = function(angle) {
	
};

/** end Tank event handlers **/

/** Bomb event handlers **/
TurnBasedGame.prototype.bombLanded = function(bomb) {
	this.endTurn();
};

/** end Bomb event handlers **/


/** Global static functions **/

TurnBasedGame.create = function() {
	window.addEventListener("load", function() {
		TurnBasedGame.instance = new TurnBasedGame();
	});
};
