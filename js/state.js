/* =========================================================
   state.js
   Velocity Runner: Rise of Bharat

   Global game state
========================================================= */


/* =========================================================
   THREE.JS OBJECTS
========================================================= */

var scene = null;
var camera = null;
var renderer = null;

var player = null;
var suryaCore = null;
var drone = null;
var boss = null;


/* =========================================================
   THREE.JS GROUPS
========================================================= */

var roadGroup = null;
var obstacleGroup = null;
var shardGroup = null;
var cityGroup = null;
var rainGroup = null;
var bulletGroup = null;
var empGroup = null;


/* =========================================================
   GAME STATUS
========================================================= */

var gameRunning = false;
var gamePaused = false;
var gameOver = false;

var animationId = null;


/* =========================================================
   PLAYER INFORMATION
========================================================= */

var runnerName = "Aarav Astra";

var selectedDifficulty = "normal";

var difficultySettings = {
  startSpeed: START_SPEED,
  obstacleMultiplier: 1,
  droneAttackMultiplier: 1,
  bossAttackMultiplier: 1
};


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

var currentLane = 1;

var playerY = 1;

var velocityY = 0;

var gravity = GRAVITY;

var isJumping = false;

var isSliding = false;

var slideTimer = 0;


/* =========================================================
   SCORE AND GAME PROGRESS
========================================================= */

var speed = START_SPEED;

var distance = 0;

var shards = 0;

var highScore = Number(
  localStorage.getItem(
    "velocityRunnerHighScore"
  ) || 0
);


/* =========================================================
   PLAYER HEALTH AND ABILITIES
========================================================= */

var coreHealth = 100;

var invincibleTimer = 0;

var shieldActive = false;


/* =========================================================
   WORLD OBJECT ARRAYS
========================================================= */

var obstacles = [];

var shardItems = [];

var roadTiles = [];

var buildings = [];

var rainDrops = [];

var powerUps = [];


/* =========================================================
   COMBAT OBJECT ARRAYS
========================================================= */

var bullets = [];

var explosions = [];

var empShots = [];

var bossLasers = [];


/* =========================================================
   SPAWN TIMERS
========================================================= */

var spawnTimer = 0;

var shardTimer = 0;

var powerUpTimer = 0;


/* =========================================================
   DRONE STATE
========================================================= */

var droneAlive = true;

var droneRespawnTimer = 0;

var dronesDestroyed = 0;

var droneShootTimer = 130;


/* =========================================================
   BOSS STATE
========================================================= */

var bossActive = false;

var bossHealth = 100;

var bossMaxHealth = 100;

var nextBossDistance =
  BOSS_DISTANCE_GAP;

var bossAttackTimer = 90;


/* =========================================================
   SHOOTING AND UI STATE
========================================================= */

var shootCooldown = 0;

var messageTimer = 0;


/* Confirm that state.js loaded */

console.log(
  "Velocity Runner state loaded",
  {
    gameRunning: gameRunning,
    speed: speed
  }
);
