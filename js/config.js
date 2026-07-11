/* =========================================================
   config.js
   Velocity Runner: Rise of Bharat

   Global game constants
========================================================= */

/* Three running lanes */

var lanes = [-3, 0, 3];


/* Road configuration */

var TILE_DEPTH = 8;

var ROAD_TILE_COUNT = 34;

var ROAD_LOOP_DISTANCE =
  TILE_DEPTH * ROAD_TILE_COUNT;


/* Combat configuration */

var SHOOT_COOLDOWN_MAX = 38;


/* Movement configuration */

var START_SPEED = 0.34;

var GRAVITY = -0.035;


/* Boss configuration */

var BOSS_DISTANCE_GAP = 1000;


/* Leaderboard configuration */

var LEADERBOARD_KEY =
  "velocityRunnerLeaderboard";

var LEADERBOARD_LIMIT = 5;


/* Confirm that config.js loaded */

console.log(
  "Velocity Runner config loaded",
  {
    START_SPEED: START_SPEED,
    LEADERBOARD_KEY: LEADERBOARD_KEY
  }
);
