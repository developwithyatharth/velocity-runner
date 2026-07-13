/* =========================================================
   obstaclePatterns.js
   Velocity Runner: Rise of Bharat

   Phase R4A:
   - Intelligent obstacle formations
   - Difficulty-aware patterns
   - Guaranteed playable routes
   - Mobile-safe obstacle limits
========================================================= */


/* =========================================================
   KEEP THE OLD SINGLE-SPAWN FUNCTION AS A FALLBACK
========================================================= */

var velocityOriginalSpawnObstacle =
  typeof spawnObstacle === "function"
    ? spawnObstacle
    : null;


/* =========================================================
   FORMATION STATE
========================================================= */

var velocityLastObstaclePattern = "";
var velocityObstacleFormationId = 0;


/* =========================================================
   DIFFICULTY DETECTION
========================================================= */

function getObstaclePatternDifficulty() {
  var possibleValues = [
    window.currentDifficulty,
    window.selectedDifficulty,
    window.gameDifficulty,
    window.difficulty
  ];

  for (
    var valueIndex = 0;
    valueIndex < possibleValues.length;
    valueIndex++
  ) {
    var value =
      possibleValues[valueIndex];

    if (
      typeof value !== "string"
    ) {
      continue;
    }

    var normalized =
      value.toLowerCase();

    if (
      normalized.indexOf("hard") !== -1 ||
      normalized.indexOf("legend") !== -1
    ) {
      return "hard";
    }

    if (
      normalized.indexOf("easy") !== -1
    ) {
      return "easy";
    }

    if (
      normalized.indexOf("normal") !== -1 ||
      normalized.indexOf("medium") !== -1
    ) {
      return "normal";
    }
  }

  return "normal";
}


/* =========================================================
   RANDOM HELPERS
========================================================= */

function getRandomFormationLane() {
  return Math.floor(
    Math.random() * 3
  );
}


function getOtherFormationLanes(
  excludedLane
) {
  var availableLanes = [];

  for (
    var laneIndex = 0;
    laneIndex < 3;
    laneIndex++
  ) {
    if (
      laneIndex !== excludedLane
    ) {
      availableLanes.push(
        laneIndex
      );
    }
  }

  return availableLanes;
}


function shuffleFormationLanes(
  laneArray
) {
  var shuffled =
    laneArray.slice();

  for (
    var currentIndex =
      shuffled.length - 1;

    currentIndex > 0;

    currentIndex--
  ) {
    var randomIndex =
      Math.floor(
        Math.random() *
        (
          currentIndex + 1
        )
      );

    var temporaryValue =
      shuffled[currentIndex];

    shuffled[currentIndex] =
      shuffled[randomIndex];

    shuffled[randomIndex] =
      temporaryValue;
  }

  return shuffled;
}


/* =========================================================
   CREATE ONE REALISTIC PATTERN OBJECT
========================================================= */

function createObstaclePatternObject(
  obstacleType,
  laneIndex,
  zPosition,
  formationName,
  formationId
) {
  if (
    !obstacleGroup ||
    !Array.isArray(obstacles) ||
    !Array.isArray(lanes)
  ) {
    return null;
  }

  laneIndex =
    THREE.MathUtils.clamp(
      Number(laneIndex) || 0,
      0,
      2
    );

  var obstacle = null;

  if (
    obstacleType === "low" &&
    typeof createRealisticLowObstacle ===
      "function"
  ) {
    obstacle =
      createRealisticLowObstacle();
  } else if (
    obstacleType === "slide" &&
    typeof createRealisticSlideObstacle ===
      "function"
  ) {
    obstacle =
      createRealisticSlideObstacle();
  } else if (
    typeof createRealisticBlockObstacle ===
      "function"
  ) {
    obstacle =
      createRealisticBlockObstacle();

    obstacleType = "block";
  }

  if (!obstacle) {
    return null;
  }

  obstacle.userData.type =
    obstacleType;

  obstacle.userData.laneIndex =
    laneIndex;

  obstacle.userData.spawnTime =
    Date.now();

  obstacle.userData.animationPhase =
    Math.random() *
    Math.PI *
    2;

  obstacle.userData.formationName =
    formationName;

  obstacle.userData.formationId =
    formationId;

  obstacle.userData.hitHalfX =
    Number.isFinite(
      obstacle.userData.hitHalfX
    )
      ? obstacle.userData.hitHalfX
      : 0.84;

  obstacle.userData.hitHalfZ =
    Number.isFinite(
      obstacle.userData.hitHalfZ
    )
      ? obstacle.userData.hitHalfZ
      : 0.78;

  obstacle.position.set(
    lanes[laneIndex],
    0,
    zPosition
  );

  /*
   * A very small angle makes stopped road vehicles
   * look natural without hurting collision fairness.
   */

  if (
    obstacleType === "block"
  ) {
    obstacle.rotation.y =
      (
        Math.random() -
        0.5
      ) * 0.026;
  }

  obstacle.traverse(
    function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    }
  );

  if (
    typeof attachObstaclePresentation ===
      "function"
  ) {
    attachObstaclePresentation(
      obstacle
    );
  }

  obstacles.push(
    obstacle
  );

  obstacleGroup.add(
    obstacle
  );

  return obstacle;
}


/* =========================================================
   PATTERN 1
   SINGLE REALISTIC OBJECT
========================================================= */

function spawnSingleObstaclePattern(
  formationId
) {
  var lane =
    typeof chooseBalancedObstacleLane ===
      "function"
      ? chooseBalancedObstacleLane()
      : getRandomFormationLane();

  var obstacleType =
    typeof chooseBalancedObstacleType ===
      "function"
      ? chooseBalancedObstacleType()
      : "block";

  if (
    obstacleType === "high"
  ) {
    obstacleType = "slide";
  }

  if (
    obstacleType !== "block" &&
    obstacleType !== "low" &&
    obstacleType !== "slide"
  ) {
    obstacleType = "block";
  }

  createObstaclePatternObject(
    obstacleType,
    lane,
    -105,
    "single",
    formationId
  );
}


/* =========================================================
   PATTERN 2
   TWO-LANE VEHICLE BLOCKADE

   Two lanes are blocked.
   One lane always remains completely open.
========================================================= */

function spawnDoubleBlockPattern(
  formationId
) {
  var openLane =
    getRandomFormationLane();

  var blockedLanes =
    getOtherFormationLanes(
      openLane
    );

  createObstaclePatternObject(
    "block",
    blockedLanes[0],
    -105,
    "double-block",
    formationId
  );

  createObstaclePatternObject(
    "block",
    blockedLanes[1],
    -105,
    "double-block",
    formationId
  );
}


/* =========================================================
   PATTERN 3
   MIXED CHOICE

   One lane is blocked by a vehicle.
   One lane requires jumping or sliding.
   One lane remains open.
========================================================= */

function spawnMixedChoicePattern(
  formationId
) {
  var laneOrder =
    shuffleFormationLanes([
      0,
      1,
      2
    ]);

  var blockLane =
    laneOrder[0];

  var actionLane =
    laneOrder[1];

  var actionType =
    Math.random() < 0.58
      ? "low"
      : "slide";

  createObstaclePatternObject(
    "block",
    blockLane,
    -105,
    "mixed-choice",
    formationId
  );

  createObstaclePatternObject(
    actionType,
    actionLane,
    -105,
    "mixed-choice",
    formationId
  );

  /*
   * laneOrder[2] remains empty and safe.
   */
}


/* =========================================================
   PATTERN 4
   ACTION GATE

   Two lanes contain heavy vehicles.
   The remaining lane requires a jump or slide.

   Used mainly on higher difficulty.
========================================================= */

function spawnActionGatePattern(
  formationId
) {
  var actionLane =
    getRandomFormationLane();

  var blockedLanes =
    getOtherFormationLanes(
      actionLane
    );

  var actionType =
    Math.random() < 0.54
      ? "low"
      : "slide";

  createObstaclePatternObject(
    "block",
    blockedLanes[0],
    -105,
    "action-gate",
    formationId
  );

  createObstaclePatternObject(
    "block",
    blockedLanes[1],
    -105,
    "action-gate",
    formationId
  );

  createObstaclePatternObject(
    actionType,
    actionLane,
    -105,
    "action-gate",
    formationId
  );
}


/* =========================================================
   PATTERN 5
   STAGGERED TRAFFIC

   Vehicles appear at different distances.
   At least two lanes remain available at every row.
========================================================= */

function spawnStaggeredTrafficPattern(
  formationId
) {
  var laneOrder =
    shuffleFormationLanes([
      0,
      1,
      2
    ]);

  createObstaclePatternObject(
    "block",
    laneOrder[0],
    -105,
    "staggered-traffic",
    formationId
  );

  createObstaclePatternObject(
    "block",
    laneOrder[1],
    -120,
    "staggered-traffic",
    formationId
  );

  var finalType =
    Math.random() < 0.5
      ? "low"
      : "slide";

  createObstaclePatternObject(
    finalType,
    laneOrder[2],
    -136,
    "staggered-traffic",
    formationId
  );
}


/* =========================================================
   CHOOSE A FAIR PATTERN
========================================================= */

function chooseObstacleFormationPattern() {
  var difficulty =
    getObstaclePatternDifficulty();

  var randomValue =
    Math.random();

  var patternName =
    "single";

  if (
    difficulty === "easy"
  ) {
    if (randomValue < 0.76) {
      patternName = "single";
    } else if (
      randomValue < 0.94
    ) {
      patternName =
        "double-block";
    } else {
      patternName =
        "mixed-choice";
    }
  } else if (
    difficulty === "hard"
  ) {
    if (randomValue < 0.34) {
      patternName = "single";
    } else if (
      randomValue < 0.55
    ) {
      patternName =
        "double-block";
    } else if (
      randomValue < 0.75
    ) {
      patternName =
        "mixed-choice";
    } else if (
      randomValue < 0.9
    ) {
      patternName =
        "staggered-traffic";
    } else {
      patternName =
        "action-gate";
    }
  } else {
    if (randomValue < 0.52) {
      patternName = "single";
    } else if (
      randomValue < 0.75
    ) {
      patternName =
        "double-block";
    } else if (
      randomValue < 0.91
    ) {
      patternName =
        "mixed-choice";
    } else {
      patternName =
        "staggered-traffic";
    }
  }

  /*
   * Do not repeat the same complex formation twice.
   */

  if (
    patternName ===
      velocityLastObstaclePattern &&
    patternName !== "single"
  ) {
    patternName =
      Math.random() < 0.56
        ? "single"
        : "double-block";
  }

  velocityLastObstaclePattern =
    patternName;

  return patternName;
}


/* =========================================================
   OVERRIDE SPAWNOBSTACLE
========================================================= */

function spawnObstacle() {
  if (
    !obstacleGroup ||
    !Array.isArray(obstacles) ||
    !Array.isArray(lanes)
  ) {
    if (
      typeof velocityOriginalSpawnObstacle ===
        "function"
    ) {
      velocityOriginalSpawnObstacle();
    }

    return;
  }

  /*
   * Procedural obstacle models contain many separate
   * meshes. Limit the number of active root objects.
   */

  if (
    obstacles.length >= 10
  ) {
    return;
  }

  velocityObstacleFormationId += 1;

  var formationId =
    velocityObstacleFormationId;

  var patternName =
    chooseObstacleFormationPattern();

  if (
    patternName ===
    "double-block"
  ) {
    spawnDoubleBlockPattern(
      formationId
    );
  } else if (
    patternName ===
    "mixed-choice"
  ) {
    spawnMixedChoicePattern(
      formationId
    );
  } else if (
    patternName ===
    "action-gate"
  ) {
    spawnActionGatePattern(
      formationId
    );
  } else if (
    patternName ===
    "staggered-traffic"
  ) {
    spawnStaggeredTrafficPattern(
      formationId
    );
  } else {
    spawnSingleObstaclePattern(
      formationId
    );
  }
}


window.velocityObstaclePatternsReady =
  true;

console.log(
  "Velocity Runner R4A intelligent obstacle formations loaded."
);
