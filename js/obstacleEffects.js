/* =========================================================
   obstacleEffects.js
   Velocity Runner: Rise of Bharat

   Phase R3C:
   - Reflective road warnings
   - Vehicle contact marks
   - Ground dust
   - Impact debris
   - Dash destruction
   - Cinematic collision response
========================================================= */


/* =========================================================
   EFFECT SYSTEM STATE
========================================================= */

var obstacleEffectsScene = null;
var obstacleEffectsGroup = null;

var obstacleDustParticles = [];
var obstacleDebrisParticles = [];

var obstacleImpactLock = false;


/* =========================================================
   EFFECT SYSTEM INITIALIZATION
========================================================= */

function ensureObstacleEffectsSystem() {
  if (
    !scene ||
    typeof THREE === "undefined"
  ) {
    return false;
  }

  var requiresNewSystem =
    obstacleEffectsScene !== scene ||
    !obstacleEffectsGroup ||
    obstacleEffectsGroup.parent !==
      scene;

  if (requiresNewSystem) {
    obstacleEffectsScene = scene;

    obstacleEffectsGroup =
      new THREE.Group();

    obstacleEffectsGroup.name =
      "Obstacle Effects";

    scene.add(
      obstacleEffectsGroup
    );

    obstacleDustParticles = [];
    obstacleDebrisParticles = [];

    obstacleImpactLock = false;
  }

  return true;
}


/* =========================================================
   ROAD WARNING MATERIAL
========================================================= */

function createObstacleReflectorMaterial(
  color
) {
  return new THREE.MeshStandardMaterial({
    color: color || 0xe2a73a,

    roughness: 0.44,
    metalness: 0.16,

    emissive: 0x5b2900,
    emissiveIntensity: 0.14,

    transparent: true,
    opacity: 0.58,

    depthWrite: false
  });
}


/* =========================================================
   ROAD WARNING BAR
========================================================= */

function addObstacleRoadBar(
  parent,
  width,
  depth,
  x,
  z,
  rotationY,
  material
) {
  var bar = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      0.025,
      depth
    ),
    material
  );

  bar.position.set(
    x || 0,
    0.038,
    z || 0
  );

  bar.rotation.y =
    rotationY || 0;

  bar.castShadow = false;
  bar.receiveShadow = true;

  parent.add(bar);

  return bar;
}


/* =========================================================
   BLOCK WARNING
   Large X road marking
========================================================= */

function createBlockRoadWarning(
  parent,
  material
) {
  var warningGroup =
    new THREE.Group();

  warningGroup.name =
    "Lane Change Warning";

  parent.add(
    warningGroup
  );

  addObstacleRoadBar(
    warningGroup,
    1.35,
    0.11,
    0,
    5.3,
    0.66,
    material
  );

  addObstacleRoadBar(
    warningGroup,
    1.35,
    0.11,
    0,
    5.3,
    -0.66,
    material
  );

  addObstacleRoadBar(
    warningGroup,
    1.05,
    0.09,
    0,
    4.65,
    0.66,
    material
  );

  addObstacleRoadBar(
    warningGroup,
    1.05,
    0.09,
    0,
    4.65,
    -0.66,
    material
  );

  return warningGroup;
}


/* =========================================================
   JUMP WARNING
   Three forward chevrons
========================================================= */

function createJumpRoadWarning(
  parent,
  material
) {
  var warningGroup =
    new THREE.Group();

  warningGroup.name =
    "Jump Warning";

  parent.add(
    warningGroup
  );

  for (
    var rowIndex = 0;
    rowIndex < 3;
    rowIndex++
  ) {
    var warningZ =
      4.45 +
      rowIndex * 0.46;

    addObstacleRoadBar(
      warningGroup,
      0.72,
      0.09,
      -0.27,
      warningZ,
      -0.5,
      material
    );

    addObstacleRoadBar(
      warningGroup,
      0.72,
      0.09,
      0.27,
      warningZ,
      0.5,
      material
    );
  }

  return warningGroup;
}


/* =========================================================
   SLIDE WARNING
   Low-clearance road stripes
========================================================= */

function createSlideRoadWarning(
  parent,
  material
) {
  var warningGroup =
    new THREE.Group();

  warningGroup.name =
    "Slide Warning";

  parent.add(
    warningGroup
  );

  for (
    var stripeIndex = 0;
    stripeIndex < 3;
    stripeIndex++
  ) {
    addObstacleRoadBar(
      warningGroup,
      1.22,
      0.1,
      0,
      4.55 +
        stripeIndex * 0.43,
      0,
      material
    );
  }

  addObstacleRoadBar(
    warningGroup,
    0.1,
    1.04,
    -0.64,
    5,
    0,
    material
  );

  addObstacleRoadBar(
    warningGroup,
    0.1,
    1.04,
    0.64,
    5,
    0,
    material
  );

  return warningGroup;
}


/* =========================================================
   VEHICLE TYRE-CONTACT MARKS
========================================================= */

function addVehicleContactMarks(
  obstacle
) {
  var contactMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x171614,

      transparent: true,
      opacity: 0.24,

      depthWrite: false
    });

  var leftMark =
    addObstacleRoadBar(
      obstacle,
      0.18,
      1.58,
      -0.48,
      -0.16,
      0,
      contactMaterial
    );

  var rightMark =
    addObstacleRoadBar(
      obstacle,
      0.18,
      1.58,
      0.48,
      -0.16,
      0,
      contactMaterial
    );

  leftMark.position.y = 0.018;
  rightMark.position.y = 0.018;
}


/* =========================================================
   ATTACH OBSTACLE PRESENTATION
========================================================= */

function attachObstaclePresentation(
  obstacle
) {
  if (
    !obstacle ||
    !obstacle.userData ||
    obstacle.userData
      .presentationAttached
  ) {
    return;
  }

  obstacle.userData
    .presentationAttached = true;

  var obstacleType =
    obstacle.userData.type ||
    "block";

  var warningColor =
    obstacleType === "slide"
      ? 0xd8b44b
      : obstacleType === "low"
        ? 0xe2a13a
        : 0xd97732;

  var warningMaterial =
    createObstacleReflectorMaterial(
      warningColor
    );

  var warningGroup;

  if (obstacleType === "low") {
    warningGroup =
      createJumpRoadWarning(
        obstacle,
        warningMaterial
      );
  } else if (
    obstacleType === "slide"
  ) {
    warningGroup =
      createSlideRoadWarning(
        obstacle,
        warningMaterial
      );
  } else {
    warningGroup =
      createBlockRoadWarning(
        obstacle,
        warningMaterial
      );
  }

  obstacle.userData.warningGroup =
    warningGroup;

  obstacle.userData.warningMaterials = [
    warningMaterial
  ];

  obstacle.userData.lastDustTime = 0;

  obstacle.userData.emitDust =
    obstacleType !== "slide";

  var objectName =
    obstacle.userData.objectName ||
    "";

  var isVehicle =
    objectName.indexOf(
      "Rickshaw"
    ) !== -1 ||
    objectName.indexOf(
      "Van"
    ) !== -1;

  if (isVehicle) {
    addVehicleContactMarks(
      obstacle
    );

    obstacle.userData
      .vehicleObstacle = true;
  }
}


/* =========================================================
   DUST PARTICLE POOL
========================================================= */

function acquireObstacleDustParticle() {
  if (
    !ensureObstacleEffectsSystem()
  ) {
    return null;
  }

  for (
    var particleIndex = 0;
    particleIndex <
      obstacleDustParticles.length;
    particleIndex++
  ) {
    if (
      !obstacleDustParticles[
        particleIndex
      ].active
    ) {
      return obstacleDustParticles[
        particleIndex
      ];
    }
  }

  /*
   * Hard particle limit protects mobile performance.
   */

  if (
    obstacleDustParticles.length >=
    30
  ) {
    return null;
  }

  var dustMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xb9ab91,

      transparent: true,
      opacity: 0,

      depthWrite: false
    });

  var dustMesh =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.13,
        6,
        4
      ),
      dustMaterial
    );

  dustMesh.visible = false;

  obstacleEffectsGroup.add(
    dustMesh
  );

  var particle = {
    mesh: dustMesh,

    active: false,
    life: 0,

    velocity:
      new THREE.Vector3()
  };

  obstacleDustParticles.push(
    particle
  );

  return particle;
}


/* =========================================================
   SPAWN OBSTACLE DUST
========================================================= */

function spawnObstacleDust(
  obstacle,
  amount
) {
  if (
    !obstacle ||
    !ensureObstacleEffectsSystem()
  ) {
    return;
  }

  var worldPosition =
    new THREE.Vector3();

  obstacle.getWorldPosition(
    worldPosition
  );

  var particleAmount =
    Math.max(
      1,
      amount || 1
    );

  for (
    var dustIndex = 0;
    dustIndex < particleAmount;
    dustIndex++
  ) {
    var particle =
      acquireObstacleDustParticle();

    if (!particle) {
      return;
    }

    particle.active = true;
    particle.life = 1;

    particle.mesh.visible = true;

    particle.mesh.position.set(
      worldPosition.x +
        (
          Math.random() -
          0.5
        ) * 1.1,

      0.08 +
        Math.random() * 0.12,

      worldPosition.z +
        (
          Math.random() -
          0.5
        ) * 0.7
    );

    var initialScale =
      0.45 +
      Math.random() * 0.5;

    particle.mesh.scale.setScalar(
      initialScale
    );

    particle.mesh.material.opacity =
      0.16 +
      Math.random() * 0.12;

    particle.velocity.set(
      (
        Math.random() -
        0.5
      ) * 0.018,

      0.006 +
        Math.random() * 0.009,

      0.008 +
        Math.random() * 0.018
    );
  }
}


/* =========================================================
   DEBRIS PARTICLE POOL
========================================================= */

function acquireObstacleDebrisParticle() {
  if (
    !ensureObstacleEffectsSystem()
  ) {
    return null;
  }

  for (
    var particleIndex = 0;
    particleIndex <
      obstacleDebrisParticles.length;
    particleIndex++
  ) {
    if (
      !obstacleDebrisParticles[
        particleIndex
      ].active
    ) {
      return obstacleDebrisParticles[
        particleIndex
      ];
    }
  }

  if (
    obstacleDebrisParticles.length >=
    24
  ) {
    return null;
  }

  var debrisMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x777777,

      roughness: 0.72,
      metalness: 0.18
    });

  var debrisMesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.14,
        0.1,
        0.12
      ),
      debrisMaterial
    );

  debrisMesh.visible = false;
  debrisMesh.castShadow = true;

  obstacleEffectsGroup.add(
    debrisMesh
  );

  var particle = {
    mesh: debrisMesh,

    active: false,
    life: 0,

    velocity:
      new THREE.Vector3(),

    angularVelocity:
      new THREE.Vector3()
  };

  obstacleDebrisParticles.push(
    particle
  );

  return particle;
}


/* =========================================================
   IMPACT DEBRIS
========================================================= */

function emitObstacleImpactDebris(
  obstacle,
  mode
) {
  if (
    !obstacle ||
    !ensureObstacleEffectsSystem()
  ) {
    return;
  }

  var worldPosition =
    new THREE.Vector3();

  obstacle.getWorldPosition(
    worldPosition
  );

  var obstacleType =
    obstacle.userData.type ||
    "block";

  var debrisColor =
    obstacleType === "low"
      ? 0x9b8059
      : obstacleType === "slide"
        ? 0x596269
        : 0x727a7d;

  if (mode === "dash") {
    debrisColor = 0xc9973d;
  }

  var debrisAmount =
    mode === "dash"
      ? 13
      : 17;

  for (
    var debrisIndex = 0;
    debrisIndex < debrisAmount;
    debrisIndex++
  ) {
    var particle =
      acquireObstacleDebrisParticle();

    if (!particle) {
      break;
    }

    particle.active = true;

    particle.life =
      0.72 +
      Math.random() * 0.28;

    particle.mesh.visible = true;

    particle.mesh.material.color.setHex(
      debrisColor
    );

    particle.mesh.position.set(
      worldPosition.x +
        (
          Math.random() -
          0.5
        ) * 0.9,

      worldPosition.y +
        0.45 +
        Math.random() * 0.7,

      worldPosition.z +
        (
          Math.random() -
          0.5
        ) * 0.5
    );

    particle.mesh.scale.set(
      0.55 +
        Math.random() * 0.75,

      0.55 +
        Math.random() * 0.65,

      0.55 +
        Math.random() * 0.75
    );

    particle.velocity.set(
      (
        Math.random() -
        0.5
      ) * 0.24,

      0.09 +
        Math.random() * 0.18,

      0.04 +
        Math.random() * 0.19
    );

    particle.angularVelocity.set(
      (
        Math.random() -
        0.5
      ) * 0.28,

      (
        Math.random() -
        0.5
      ) * 0.28,

      (
        Math.random() -
        0.5
      ) * 0.28
    );
  }

  spawnObstacleDust(
    obstacle,
    mode === "dash"
      ? 7
      : 5
  );
}


/* =========================================================
   SCREEN IMPACT FLASH
========================================================= */

function triggerObstacleScreenFlash(
  mode
) {
  var flash =
    document.getElementById(
      "obstacleImpactFlash"
    );

  if (!flash) {
    flash =
      document.createElement(
        "div"
      );

    flash.id =
      "obstacleImpactFlash";

    flash.style.position =
      "fixed";

    flash.style.inset = "0";

    flash.style.pointerEvents =
      "none";

    flash.style.zIndex = "80";

    flash.style.opacity = "0";

    flash.style.transition =
      "opacity 180ms ease-out";

    document.body.appendChild(
      flash
    );
  }

  flash.style.background =
    mode === "dash"
      ? "rgba(255, 174, 52, 0.34)"
      : "rgba(255, 235, 215, 0.48)";

  flash.style.opacity =
    mode === "dash"
      ? "0.72"
      : "0.88";

  window.requestAnimationFrame(
    function () {
      flash.style.opacity = "0";
    }
  );
}


/* =========================================================
   UPDATE WARNING AND DUST
========================================================= */

function updateObstaclePresentation(
  obstacle,
  currentTime
) {
  if (
    !obstacle ||
    !obstacle.userData
  ) {
    return;
  }

  if (
    !obstacle.userData
      .presentationAttached
  ) {
    attachObstaclePresentation(
      obstacle
    );
  }

  var warningGroup =
    obstacle.userData.warningGroup;

  if (
    warningGroup &&
    player
  ) {
    var distanceToPlayer =
      Math.abs(
        obstacle.position.z -
        player.position.z
      );

    var approaching =
      obstacle.position.z < 4 &&
      distanceToPlayer < 62;

    warningGroup.visible =
      approaching;

    if (approaching) {
      var visibilityStrength =
        THREE.MathUtils.clamp(
          (
            62 -
            distanceToPlayer
          ) / 54,
          0,
          1
        );

      var warningOpacity =
        0.2 +
        visibilityStrength * 0.5;

      var warningMaterials =
        obstacle.userData
          .warningMaterials || [];

      warningMaterials.forEach(
        function (material) {
          material.opacity =
            warningOpacity;

          material.emissiveIntensity =
            0.1 +
            visibilityStrength * 0.13;
        }
      );

      var pulse =
        1 +
        Math.sin(
          currentTime * 0.006 +
          (
            obstacle.userData
              .animationPhase ||
            0
          )
        ) * 0.035;

      warningGroup.scale.set(
        pulse,
        1,
        pulse
      );
    }
  }

  var currentSpeed =
    typeof speed === "number"
      ? speed
      : 0;

  if (
    obstacle.userData.emitDust &&
    currentSpeed > 0.24 &&
    obstacle.position.z > -42 &&
    obstacle.position.z < 7 &&
    currentTime -
      obstacle.userData.lastDustTime >
      135
  ) {
    obstacle.userData.lastDustTime =
      currentTime;

    spawnObstacleDust(
      obstacle,
      obstacle.userData
        .vehicleObstacle
        ? 2
        : 1
    );
  }
}


/* =========================================================
   UPDATE ALL PARTICLES
========================================================= */

function updateObstacleEffects() {
  if (
    !ensureObstacleEffectsSystem()
  ) {
    return;
  }

  var currentSpeed =
    typeof speed === "number"
      ? speed
      : 0.3;

  obstacleDustParticles.forEach(
    function (particle) {
      if (!particle.active) {
        return;
      }

      particle.life -= 0.035;

      if (particle.life <= 0) {
        particle.active = false;
        particle.mesh.visible = false;
        return;
      }

      particle.mesh.position.x +=
        particle.velocity.x;

      particle.mesh.position.y +=
        particle.velocity.y;

      particle.mesh.position.z +=
        particle.velocity.z +
        currentSpeed * 0.52;

      particle.velocity.y +=
        0.0008;

      particle.mesh.scale.multiplyScalar(
        1.024
      );

      particle.mesh.material.opacity =
        particle.life * 0.22;
    }
  );

  obstacleDebrisParticles.forEach(
    function (particle) {
      if (!particle.active) {
        return;
      }

      particle.life -= 0.043;

      if (particle.life <= 0) {
        particle.active = false;
        particle.mesh.visible = false;
        return;
      }

      particle.velocity.y -=
        0.015;

      particle.mesh.position.add(
        particle.velocity
      );

      particle.mesh.rotation.x +=
        particle.angularVelocity.x;

      particle.mesh.rotation.y +=
        particle.angularVelocity.y;

      particle.mesh.rotation.z +=
        particle.angularVelocity.z;

      if (
        particle.mesh.position.y <
        0.06
      ) {
        particle.mesh.position.y =
          0.06;

        particle.velocity.y =
          Math.abs(
            particle.velocity.y
          ) * 0.24;

        particle.velocity.x *= 0.8;
        particle.velocity.z *= 0.8;
      }
    }
  );
}


/* =========================================================
   SURYA DASH CHECK
========================================================= */

function isSuryaDashObstacleActive() {
  return (
    typeof dashTrailTimer ===
      "number" &&
    dashTrailTimer > 0
  );
}


/* =========================================================
   DESTROY LIGHT OBSTACLE WITH DASH
========================================================= */

function destroyObstacleWithDash(
  obstacle,
  obstacleIndex
) {
  if (
    !obstacle ||
    !obstacle.userData ||
    !obstacle.userData
      .breakableByDash ||
    !isSuryaDashObstacleActive()
  ) {
    return false;
  }

  emitObstacleImpactDebris(
    obstacle,
    "dash"
  );

  triggerObstacleScreenFlash(
    "dash"
  );

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(
      0.16
    );
  }

  if (
    typeof playGameTone ===
    "function"
  ) {
    playGameTone({
      frequency: 190,
      endFrequency: 420,
      duration: 0.18,
      volume: 0.07,
      type: "sawtooth"
    });
  }

  if (
    typeof shards === "number"
  ) {
    shards += 1;
  }

  if (
    typeof setMission ===
    "function"
  ) {
    setMission(
      "Surya Dash destroyed " +
        (
          obstacle.userData
            .objectName ||
          "the barricade"
        ) +
        " · +1 Shard",
      95
    );
  }

  if (
    typeof removeObstacle ===
    "function"
  ) {
    removeObstacle(
      obstacle,
      obstacleIndex
    );
  }

  return true;
}


/* =========================================================
   FATAL COLLISION EFFECT
========================================================= */

function triggerFatalObstacleImpact(
  obstacle
) {
  if (
    obstacleImpactLock ||
    !obstacle
  ) {
    return false;
  }

  obstacleImpactLock = true;

  emitObstacleImpactDebris(
    obstacle,
    "crash"
  );

  triggerObstacleScreenFlash(
    "crash"
  );

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(
      0.26
    );
  }

  if (
    typeof playGameTone ===
    "function"
  ) {
    playGameTone({
      frequency: 110,
      endFrequency: 42,
      duration: 0.3,
      volume: 0.09,
      type: "sawtooth"
    });
  }

  if (
    typeof setMission ===
    "function"
  ) {
    setMission(
      "Impact: " +
        (
          obstacle.userData
            .objectName ||
          "road obstacle"
        ),
      85
    );
  }

  /*
   * Very short delay lets the collision particles
   * render before the normal game-over screen opens.
   */

  window.setTimeout(
    function () {
      if (
        typeof endGame ===
          "function" &&
        typeof gameOver !==
          "undefined" &&
        !gameOver
      ) {
        endGame();
      }
    },
    180
  );

  return true;
}


window
  .velocityObstacleEffectsReady =
  true;

console.log(
  "Velocity Runner R3C obstacle effects loaded."
);
