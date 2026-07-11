/* =========================================================
   balance.js
   Velocity Runner: Rise of Bharat

   Gameplay balancing system:
   - Smooth difficulty progression
   - Fair obstacle lane selection
   - Reduced repeated obstacle patterns
   - Power-up pity system
   - Balanced damage values
========================================================= */


/* =========================================================
   BALANCE STATE
========================================================= */

var balanceState = {
  lastObstacleLane: -1,
  sameLaneStreak: 0,

  lastObstacleType: "",
  sameTypeStreak: 0,

  framesWithoutPowerUp: 0
};


/* =========================================================
   RESET BALANCE STATE
========================================================= */

function resetBalanceState() {
  balanceState.lastObstacleLane = -1;
  balanceState.sameLaneStreak = 0;

  balanceState.lastObstacleType = "";
  balanceState.sameTypeStreak = 0;

  balanceState.framesWithoutPowerUp = 0;
}


/* =========================================================
   DISTANCE-BASED PROGRESS
========================================================= */

function getBalanceProgress() {
  var safeDistance =
    typeof distance === "number"
      ? Math.max(0, distance)
      : 0;

  /*
    Difficulty reaches its maximum gradual value
    near 6000 metres.
  */

  return Math.min(
    1,
    safeDistance / 6000
  );
}


/* =========================================================
   OBSTACLE SPAWN INTERVAL
========================================================= */

function getBalancedObstacleInterval() {
  var progress =
    getBalanceProgress();

  var startingInterval = 80;
  var minimumInterval = 38;

  if (selectedDifficulty === "easy") {
    startingInterval = 98;
    minimumInterval = 52;
  } else if (
    selectedDifficulty === "hard"
  ) {
    startingInterval = 68;
    minimumInterval = 30;
  }

  var interval =
    startingInterval -
    (
      startingInterval -
      minimumInterval
    ) *
    progress;

  return Math.max(
    minimumInterval,
    Math.round(interval)
  );
}


/* =========================================================
   SHARD SPAWN INTERVAL
========================================================= */

function getBalancedShardInterval() {
  var progress =
    getBalanceProgress();

  var startingInterval = 48;
  var minimumInterval = 29;

  if (selectedDifficulty === "easy") {
    startingInterval = 43;
    minimumInterval = 25;
  } else if (
    selectedDifficulty === "hard"
  ) {
    startingInterval = 52;
    minimumInterval = 32;
  }

  var interval =
    startingInterval -
    (
      startingInterval -
      minimumInterval
    ) *
    progress;

  return Math.max(
    minimumInterval,
    Math.round(interval)
  );
}


/* =========================================================
   POWER-UP SPAWN INTERVAL
========================================================= */

function getBalancedPowerUpInterval() {
  var baseInterval = 390;

  if (selectedDifficulty === "easy") {
    baseInterval = 310;
  } else if (
    selectedDifficulty === "hard"
  ) {
    baseInterval = 460;
  }

  /*
    Give the player help when Core Health becomes low.
  */

  if (coreHealth <= 30) {
    return 150;
  }

  if (coreHealth <= 50) {
    return 220;
  }

  if (
    !shieldActive &&
    coreHealth <= 70
  ) {
    return 280;
  }

  return (
    baseInterval +
    Math.floor(
      Math.random() * 120
    )
  );
}


/* =========================================================
   POWER-UP PITY TIMER
========================================================= */

function updateBalanceFrame() {
  balanceState.framesWithoutPowerUp++;
}


function registerPowerUpSpawn() {
  balanceState.framesWithoutPowerUp = 0;
}


function shouldForcePowerUpSpawn() {
  /*
    Force a power-up if none has appeared for a long time.
  */

  if (
    balanceState.framesWithoutPowerUp >=
    950
  ) {
    return true;
  }

  /*
    Emergency help at very low health.
  */

  if (
    coreHealth <= 20 &&
    balanceState.framesWithoutPowerUp >=
      260
  ) {
    return true;
  }

  return false;
}


/* =========================================================
   FAIR OBSTACLE LANE
========================================================= */

function chooseBalancedObstacleLane() {
  var lane =
    Math.floor(
      Math.random() * 3
    );

  /*
    Do not place more than two consecutive obstacles
    in the same lane.
  */

  if (
    balanceState.sameLaneStreak >= 2 &&
    lane ===
      balanceState.lastObstacleLane
  ) {
    var alternativeLanes =
      [0, 1, 2].filter(
        function (laneIndex) {
          return (
            laneIndex !==
            balanceState
              .lastObstacleLane
          );
        }
      );

    lane =
      alternativeLanes[
        Math.floor(
          Math.random() *
          alternativeLanes.length
        )
      ];
  }

  if (
    lane ===
    balanceState.lastObstacleLane
  ) {
    balanceState.sameLaneStreak++;
  } else {
    balanceState.sameLaneStreak = 1;
  }

  balanceState.lastObstacleLane =
    lane;

  return lane;
}


/* =========================================================
   FAIR OBSTACLE TYPE
========================================================= */

function chooseBalancedObstacleType() {
  var randomValue =
    Math.random();

  var obstacleType;

  if (randomValue < 0.46) {
    obstacleType = "block";
  } else if (
    randomValue < 0.76
  ) {
    obstacleType = "low";
  } else {
    obstacleType = "slide";
  }

  /*
    Avoid three identical obstacle types in succession.
  */

  if (
    balanceState.sameTypeStreak >= 2 &&
    obstacleType ===
      balanceState.lastObstacleType
  ) {
    var alternativeTypes = [
      "block",
      "low",
      "slide"
    ].filter(
      function (type) {
        return (
          type !==
          balanceState
            .lastObstacleType
        );
      }
    );

    obstacleType =
      alternativeTypes[
        Math.floor(
          Math.random() *
          alternativeTypes.length
        )
      ];
  }

  if (
    obstacleType ===
    balanceState.lastObstacleType
  ) {
    balanceState.sameTypeStreak++;
  } else {
    balanceState.sameTypeStreak = 1;
  }

  balanceState.lastObstacleType =
    obstacleType;

  return obstacleType;
}


/* =========================================================
   DAMAGE BALANCING
========================================================= */

function getDroneHitDamage() {
  /*
    Each Trinetra Drone EMP removes exactly 10%.
  */

  return 10;
}


function getBossLaserDamage() {
  if (selectedDifficulty === "easy") {
    return 15;
  }

  if (selectedDifficulty === "hard") {
    return 25;
  }

  return 20;
}
