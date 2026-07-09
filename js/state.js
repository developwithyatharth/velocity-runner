/* state.js
   Global game variables
*/

let scene, camera, renderer;
let player, suryaCore, drone, boss;

let roadGroup;
let obstacleGroup;
let shardGroup;
let cityGroup;
let rainGroup;
let bulletGroup;
let empGroup;

let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let animationId = null;

let runnerName = "Aarav Astra";

let selectedDifficulty = "normal";
let difficultySettings = {
  startSpeed: START_SPEED,
  obstacleMultiplier: 1,
  droneAttackMultiplier: 1,
  bossAttackMultiplier: 1
};

let currentLane = 1;

let playerY = 1;
let velocityY = 0;
let gravity = GRAVITY;
let isJumping = false;
let isSliding = false;
let slideTimer = 0;

let speed = START_SPEED;
let distance = 0;
let shards = 0;
let highScore = Number(localStorage.getItem("velocityRunnerHighScore") || 0);

let coreHealth = 100;
let invincibleTimer = 0;
let shieldActive = false;

let obstacles = [];
let shardItems = [];
let roadTiles = [];
let buildings = [];
let rainDrops = [];
let bullets = [];
let explosions = [];
let empShots = [];
let bossLasers = [];
let powerUps = [];

let spawnTimer = 0;
let shardTimer = 0;
let powerUpTimer = 0;

let droneAlive = true;
let droneRespawnTimer = 0;
let dronesDestroyed = 0;
let droneShootTimer = 130;

let bossActive = false;
let bossHealth = 100;
let bossMaxHealth = 100;
let nextBossDistance = BOSS_DISTANCE_GAP;
let bossAttackTimer = 90;

let shootCooldown = 0;
let messageTimer = 0;
