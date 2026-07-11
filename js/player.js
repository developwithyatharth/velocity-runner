/* =========================================================
   player.js
   Velocity Runner: Rise of Bharat

   Human Aarav Astra Upgrade
   - Athletic human proportions
   - Visible face and black hair
   - Futuristic fitted running suit
   - Natural arm and leg movement
   - Human jump and slide poses
   - Surya Core and energy trail
========================================================= */


/* =========================================================
   PLAYER ANIMATION STATE
========================================================= */

let playerRunClock = 0;

let playerTrailGroup = null;
let playerTrailSegments = [];

let dashTrailTimer = 0;


/* =========================================================
   CREATE HUMAN PLAYER
========================================================= */

function createPlayer() {
  /*
    Remove an older player if createPlayer() is called again.
  */

  if (player && scene) {
    scene.remove(player);
  }

  if (playerTrailGroup && scene) {
    scene.remove(playerTrailGroup);
  }

  playerTrailSegments = [];
  playerTrailGroup = null;

  player = new THREE.Group();

  const humanBody = new THREE.Group();
  player.add(humanBody);


  /* =====================================================
     MATERIALS
  ===================================================== */

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8754d,
    roughness: 0.72,
    metalness: 0
  });

  const skinLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8875d,
    roughness: 0.75,
    metalness: 0
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x111117,
    roughness: 0.9,
    metalness: 0
  });

  const suitMaterial = new THREE.MeshStandardMaterial({
    color: 0x071b38,
    roughness: 0.68,
    metalness: 0.08,
    emissive: 0x001a35,
    emissiveIntensity: 0.08
  });

  const secondarySuitMaterial = new THREE.MeshStandardMaterial({
    color: 0x102d54,
    roughness: 0.64,
    metalness: 0.1,
    emissive: 0x002349,
    emissiveIntensity: 0.06
  });

  const darkFabricMaterial = new THREE.MeshStandardMaterial({
    color: 0x040a16,
    roughness: 0.78,
    metalness: 0.04
  });

  const shoeMaterial = new THREE.MeshStandardMaterial({
    color: 0x071020,
    roughness: 0.55,
    metalness: 0.16
  });

  const cyanMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d9ef,
    transparent: true,
    opacity: 0.82
  });

  const goldMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2b544,
    transparent: true,
    opacity: 0.88
  });

  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x24140d,
    roughness: 0.7
  });

  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2eee6,
    roughness: 0.75
  });


  /* =====================================================
     HIPS AND WAIST
  ===================================================== */

  const hips = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.31,
      0.35,
      0.42,
      18
    ),
    suitMaterial
  );

  hips.position.y = 1.05;
  hips.scale.z = 0.82;
  hips.castShadow = true;

  humanBody.add(hips);


  const waist = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.29,
      0.31,
      0.28,
      18
    ),
    darkFabricMaterial
  );

  waist.position.y = 1.35;
  waist.scale.z = 0.82;

  humanBody.add(waist);


  const beltLine = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.56,
      0.055,
      0.39
    ),
    goldMaterial
  );

  beltLine.position.set(
    0,
    1.27,
    -0.02
  );

  humanBody.add(beltLine);


  /* =====================================================
     HUMAN TORSO
  ===================================================== */

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.43,
      0.3,
      1.05,
      20
    ),
    suitMaterial
  );

  torso.position.y = 1.86;
  torso.scale.z = 0.72;
  torso.castShadow = true;

  humanBody.add(torso);


  /*
    Soft chest shape to make the torso look less cylindrical.
  */

  const chestShape = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.42,
      22,
      18
    ),
    secondarySuitMaterial
  );

  chestShape.scale.set(
    1,
    0.62,
    0.68
  );

  chestShape.position.set(
    0,
    2.04,
    -0.02
  );

  chestShape.castShadow = true;
  humanBody.add(chestShape);


  const abdomen = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.3,
      0.28,
      0.48,
      18
    ),
    darkFabricMaterial
  );

  abdomen.position.y = 1.5;
  abdomen.scale.z = 0.78;

  humanBody.add(abdomen);


  /*
    Futuristic energy lines on clothing.
  */

  const chestLineLeft = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.045,
      0.64,
      0.035
    ),
    cyanMaterial
  );

  chestLineLeft.position.set(
    -0.18,
    1.9,
    -0.31
  );

  chestLineLeft.rotation.z = -0.18;

  humanBody.add(chestLineLeft);


  const chestLineRight = chestLineLeft.clone();

  chestLineRight.position.x = 0.18;
  chestLineRight.rotation.z = 0.18;

  humanBody.add(chestLineRight);


  /* =====================================================
     NECK
  ===================================================== */

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.13,
      0.15,
      0.28,
      16
    ),
    skinMaterial
  );

  neck.position.y = 2.48;
  neck.castShadow = true;

  humanBody.add(neck);


  /* =====================================================
     HUMAN HEAD
  ===================================================== */

  const headGroup = new THREE.Group();
  headGroup.position.y = 2.83;

  humanBody.add(headGroup);


  const head = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.29,
      26,
      22
    ),
    skinLightMaterial
  );

  head.scale.set(
    0.9,
    1.08,
    0.92
  );

  head.castShadow = true;
  headGroup.add(head);


  /*
    Hair cap.
  */

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.3,
      24,
      18,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.55
    ),
    hairMaterial
  );

  hairCap.scale.set(
    0.94,
    0.86,
    0.95
  );

  hairCap.position.y = 0.09;
  headGroup.add(hairCap);


  /*
    Front hair sections.
  */

  const hairFrontLeft = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.075,
      0.22,
      5
    ),
    hairMaterial
  );

  hairFrontLeft.position.set(
    -0.1,
    0.23,
    -0.23
  );

  hairFrontLeft.rotation.x = 0.6;
  hairFrontLeft.rotation.z = -0.18;

  headGroup.add(hairFrontLeft);


  const hairFrontRight = hairFrontLeft.clone();

  hairFrontRight.position.x = 0.08;
  hairFrontRight.rotation.z = 0.16;

  headGroup.add(hairFrontRight);


  /*
    Ears.
  */

  const leftEar = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.055,
      14,
      12
    ),
    skinMaterial
  );

  leftEar.scale.set(
    0.48,
    1,
    0.62
  );

  leftEar.position.set(
    -0.275,
    0,
    0
  );

  headGroup.add(leftEar);


  const rightEar = leftEar.clone();
  rightEar.position.x = 0.275;

  headGroup.add(rightEar);


  /*
    Face points toward the road: negative Z direction.
  */

  const leftEyeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.034,
      12,
      10
    ),
    whiteMaterial
  );

  leftEyeWhite.scale.set(
    1.25,
    0.65,
    0.38
  );

  leftEyeWhite.position.set(
    -0.09,
    0.045,
    -0.263
  );

  headGroup.add(leftEyeWhite);


  const rightEyeWhite = leftEyeWhite.clone();
  rightEyeWhite.position.x = 0.09;

  headGroup.add(rightEyeWhite);


  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.018,
      10,
      8
    ),
    eyeMaterial
  );

  leftEye.position.set(
    -0.09,
    0.045,
    -0.286
  );

  headGroup.add(leftEye);


  const rightEye = leftEye.clone();
  rightEye.position.x = 0.09;

  headGroup.add(rightEye);


  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.04,
      0.12,
      10
    ),
    skinMaterial
  );

  nose.position.set(
    0,
    -0.015,
    -0.304
  );

  nose.rotation.x = -Math.PI / 2;

  headGroup.add(nose);


  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.1,
      0.018,
      0.012
    ),
    new THREE.MeshBasicMaterial({
      color: 0x7b372d
    })
  );

  mouth.position.set(
    0,
    -0.12,
    -0.292
  );

  headGroup.add(mouth);


  /*
    Small cyan communication device near the ear.
  */

  const communicationDevice = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.045,
      0.13,
      0.07
    ),
    cyanMaterial
  );

  communicationDevice.position.set(
    0.29,
    -0.015,
    -0.02
  );

  headGroup.add(communicationDevice);


  /* =====================================================
     HUMAN ARMS
  ===================================================== */

  const leftArm = createHumanArm({
    side: -1,
    skinMaterial: skinMaterial,
    suitMaterial: secondarySuitMaterial,
    darkMaterial: darkFabricMaterial,
    glowMaterial: cyanMaterial
  });

  leftArm.position.set(
    -0.46,
    2.22,
    0
  );

  humanBody.add(leftArm);


  const rightArm = createHumanArm({
    side: 1,
    skinMaterial: skinMaterial,
    suitMaterial: secondarySuitMaterial,
    darkMaterial: darkFabricMaterial,
    glowMaterial: goldMaterial
  });

  rightArm.position.set(
    0.46,
    2.22,
    0
  );

  humanBody.add(rightArm);


  /* =====================================================
     HUMAN LEGS
  ===================================================== */

  const leftLeg = createHumanLeg({
    side: -1,
    suitMaterial: suitMaterial,
    darkMaterial: darkFabricMaterial,
    shoeMaterial: shoeMaterial,
    glowMaterial: cyanMaterial
  });

  leftLeg.position.set(
    -0.19,
    1.04,
    0
  );

  humanBody.add(leftLeg);


  const rightLeg = createHumanLeg({
    side: 1,
    suitMaterial: suitMaterial,
    darkMaterial: darkFabricMaterial,
    shoeMaterial: shoeMaterial,
    glowMaterial: goldMaterial
  });

  rightLeg.position.set(
    0.19,
    1.04,
    0
  );

  humanBody.add(rightLeg);


  /* =====================================================
     SURYA CORE
  ===================================================== */

  suryaCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(
      0.16,
      1
    ),
    goldMaterial
  );

  /*
    Negative Z is the front of the runner.
  */

  suryaCore.position.set(
    0,
    1.98,
    -0.34
  );

  humanBody.add(suryaCore);


  const coreFrame = new THREE.Mesh(
    new THREE.OctahedronGeometry(
      0.24,
      0
    ),
    new THREE.MeshBasicMaterial({
      color: 0x00d9ef,
      wireframe: true,
      transparent: true,
      opacity: 0.62
    })
  );

  coreFrame.position.copy(
    suryaCore.position
  );

  humanBody.add(coreFrame);


  const coreLight = new THREE.PointLight(
    0xf2b544,
    1.25,
    6
  );

  coreLight.position.set(
    0,
    1.98,
    -0.42
  );

  humanBody.add(coreLight);


  /*
    Small Bharat-inspired sun rays around the core.
  */

  const coreRayGroup = new THREE.Group();

  for (let rayIndex = 0; rayIndex < 8; rayIndex++) {
    const ray = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.035,
        0.11,
        0.025
      ),
      goldMaterial
    );

    ray.position.y = 0.27;

    const rayPivot = new THREE.Group();

    rayPivot.rotation.z =
      rayIndex * Math.PI / 4;

    rayPivot.add(ray);
    coreRayGroup.add(rayPivot);
  }

  coreRayGroup.position.copy(
    suryaCore.position
  );

  coreRayGroup.position.z -= 0.015;

  humanBody.add(coreRayGroup);


  /* =====================================================
     BACK ENERGY STRIP
  ===================================================== */

  const backStrip = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.11,
      0.75,
      0.035
    ),
    cyanMaterial
  );

  backStrip.position.set(
    0,
    1.89,
    0.31
  );

  humanBody.add(backStrip);


  /* =====================================================
     GROUND SHADOW
  ===================================================== */

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.32,
    depthWrite: false
  });

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(
      0.62,
      28
    ),
    shadowMaterial
  );

  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;

  player.add(shadow);


  /* =====================================================
     STORE HUMAN ANIMATION RIG
  ===================================================== */

  player.userData.rig = {
    humanBody: humanBody,

    hips: hips,
    torso: torso,
    chestShape: chestShape,
    headGroup: headGroup,

    leftArm: leftArm,
    rightArm: rightArm,

    leftForearm: leftArm.userData.forearmPivot,
    rightForearm: rightArm.userData.forearmPivot,

    leftLeg: leftLeg,
    rightLeg: rightLeg,

    leftLowerLeg: leftLeg.userData.lowerLegPivot,
    rightLowerLeg: rightLeg.userData.lowerLegPivot,

    leftFoot: leftLeg.userData.footPivot,
    rightFoot: rightLeg.userData.footPivot,

    coreFrame: coreFrame,
    coreRayGroup: coreRayGroup,
    coreLight: coreLight,

    shadow: shadow
  };


  player.userData.previousX =
    lanes[currentLane];


  player.position.set(
    lanes[currentLane],
    0,
    0
  );


  /*
    Slightly scale the character without making him bulky.
  */

  player.scale.set(
    1.03,
    1.03,
    1.03
  );


  scene.add(player);

  createPlayerEnergyTrail();
}


/* =========================================================
   CREATE HUMAN ARM
========================================================= */

function createHumanArm(options) {
  const armRoot = new THREE.Group();

  const side = options.side;


  /*
    Shoulder.
  */

  const shoulder = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.17,
      18,
      16
    ),
    options.suitMaterial
  );

  shoulder.scale.set(
    1,
    0.9,
    0.92
  );

  shoulder.castShadow = true;
  armRoot.add(shoulder);


  /*
    Lightweight shoulder protection.
  */

  const shoulderPad = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.19,
      16,
      12
    ),
    options.darkMaterial
  );

  shoulderPad.scale.set(
    1.05,
    0.55,
    0.9
  );

  shoulderPad.position.set(
    side * 0.025,
    0.035,
    0
  );

  armRoot.add(shoulderPad);


  /*
    Upper arm.
  */

  const upperArm = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.105,
      0.12,
      0.54,
      16
    ),
    options.suitMaterial
  );

  upperArm.position.y = -0.29;
  upperArm.castShadow = true;

  armRoot.add(upperArm);


  /*
    Elbow pivot.
  */

  const forearmPivot = new THREE.Group();
  forearmPivot.position.y = -0.57;

  armRoot.add(forearmPivot);


  const elbow = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.11,
      16,
      14
    ),
    options.darkMaterial
  );

  forearmPivot.add(elbow);


  const forearm = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.085,
      0.105,
      0.48,
      16
    ),
    options.darkMaterial
  );

  forearm.position.y = -0.27;
  forearm.castShadow = true;

  forearmPivot.add(forearm);


  /*
    Small energy strip on forearm.
  */

  const forearmGlow = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.035,
      0.31,
      0.025
    ),
    options.glowMaterial
  );

  forearmGlow.position.set(
    side * 0.085,
    -0.26,
    -0.07
  );

  forearmPivot.add(forearmGlow);


  /*
    Visible human hand.
  */

  const hand = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.1,
      16,
      14
    ),
    options.skinMaterial
  );

  hand.scale.set(
    0.78,
    1.05,
    0.72
  );

  hand.position.y = -0.55;
  hand.castShadow = true;

  forearmPivot.add(hand);


  armRoot.userData.forearmPivot =
    forearmPivot;

  return armRoot;
}


/* =========================================================
   CREATE HUMAN LEG
========================================================= */

function createHumanLeg(options) {
  const legRoot = new THREE.Group();


  /*
    Thigh.
  */

  const thigh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.145,
      0.17,
      0.68,
      18
    ),
    options.suitMaterial
  );

  thigh.position.y = -0.36;
  thigh.castShadow = true;

  legRoot.add(thigh);


  /*
    Knee and lower-leg pivot.
  */

  const lowerLegPivot = new THREE.Group();

  lowerLegPivot.position.y = -0.72;
  legRoot.add(lowerLegPivot);


  const knee = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.145,
      18,
      14
    ),
    options.darkMaterial
  );

  knee.scale.set(
    0.92,
    0.9,
    0.88
  );

  lowerLegPivot.add(knee);


  /*
    Small knee protection, not a robotic joint.
  */

  const kneeGuard = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.13,
      16,
      12
    ),
    options.darkMaterial
  );

  kneeGuard.scale.set(
    0.78,
    0.58,
    0.34
  );

  kneeGuard.position.z = -0.115;

  lowerLegPivot.add(kneeGuard);


  const lowerLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.105,
      0.135,
      0.64,
      18
    ),
    options.darkMaterial
  );

  lowerLeg.position.y = -0.36;
  lowerLeg.castShadow = true;

  lowerLegPivot.add(lowerLeg);


  const calfGlow = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.035,
      0.38,
      0.028
    ),
    options.glowMaterial
  );

  calfGlow.position.set(
    options.side * 0.105,
    -0.35,
    0.03
  );

  lowerLegPivot.add(calfGlow);


  /*
    Foot pivot.
  */

  const footPivot = new THREE.Group();

  footPivot.position.y = -0.69;
  lowerLegPivot.add(footPivot);


  const ankle = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.095,
      14,
      12
    ),
    options.darkMaterial
  );

  footPivot.add(ankle);


  /*
    Human-shaped running shoe.
  */

  const shoe = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.18,
      18,
      14
    ),
    options.shoeMaterial
  );

  shoe.scale.set(
    0.82,
    0.55,
    1.45
  );

  shoe.position.set(
    0,
    -0.1,
    -0.13
  );

  shoe.castShadow = true;
  footPivot.add(shoe);


  const shoeSole = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.25,
      0.055,
      0.47
    ),
    options.glowMaterial
  );

  shoeSole.position.set(
    0,
    -0.19,
    -0.13
  );

  footPivot.add(shoeSole);


  legRoot.userData.lowerLegPivot =
    lowerLegPivot;

  legRoot.userData.footPivot =
    footPivot;

  return legRoot;
}


/* =========================================================
   PLAYER ENERGY TRAIL
========================================================= */

function createPlayerEnergyTrail() {
  playerTrailSegments = [];

  playerTrailGroup =
    new THREE.Group();


  for (
    let segmentIndex = 0;
    segmentIndex < 12;
    segmentIndex++
  ) {
    const trailMaterial =
      new THREE.MeshBasicMaterial({
        color:
          segmentIndex % 2 === 0
            ? 0x00d9ef
            : 0xf2b544,

        transparent: true,
        opacity: 0.05,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });


    const trailSegment = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.055,
        0.055,
        0.74
      ),
      trailMaterial
    );


    trailSegment.visible = false;

    trailSegment.userData.index =
      segmentIndex;


    playerTrailSegments.push(
      trailSegment
    );

    playerTrailGroup.add(
      trailSegment
    );
  }


  scene.add(playerTrailGroup);
}


/* =========================================================
   UPDATE PLAYER ENERGY TRAIL
========================================================= */

function updatePlayerEnergyTrail() {
  if (
    !playerTrailGroup ||
    !player
  ) {
    return;
  }


  if (dashTrailTimer > 0) {
    dashTrailTimer--;
  }


  const dashStrength =
    dashTrailTimer > 0
      ? 1
      : 0;


  const baseSpeed =
    typeof START_SPEED === "number"
      ? START_SPEED
      : 0.15;


  const regularStrength =
    Math.min(
      1,
      Math.max(
        0,
        speed - baseSpeed
      ) * 2
    );


  const trailStrength =
    Math.max(
      regularStrength * 0.26,
      dashStrength
    );


  playerTrailSegments.forEach(
    function (
      segment,
      segmentIndex
    ) {
      const trailColumn =
        segmentIndex % 3;

      const depthIndex =
        Math.floor(
          segmentIndex / 3
        );


      let xOffset = 0;

      if (trailColumn === 0) {
        xOffset = -0.26;
      }

      if (trailColumn === 2) {
        xOffset = 0.26;
      }


      const targetX =
        player.position.x +
        xOffset;


      segment.position.x +=
        (
          targetX -
          segment.position.x
        ) * 0.25;


      segment.position.y =
        player.position.y +
        0.48 +
        trailColumn * 0.5;


      /*
        Positive Z places the trail behind the runner.
      */

      segment.position.z =
        0.65 +
        depthIndex * 0.66;


      segment.scale.z =
        0.65 +
        trailStrength * 2.2;


      segment.material.opacity =
        trailStrength *
        Math.max(
          0.045,
          0.34 -
          depthIndex * 0.068
        );


      segment.visible =
        segment.material.opacity >
        0.012;
    }
  );
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function moveLeft() {
  if (
    !gameRunning ||
    gamePaused
  ) {
    return;
  }

  currentLane = Math.max(
    0,
    currentLane - 1
  );
}


function moveRight() {
  if (
    !gameRunning ||
    gamePaused
  ) {
    return;
  }

  currentLane = Math.min(
    2,
    currentLane + 1
  );
}


function jump() {
  if (
    !gameRunning ||
    gamePaused
  ) {
    return;
  }


  if (
    !isJumping &&
    !isSliding
  ) {
    velocityY = 0.78;
    isJumping = true;
    playJumpSound();

    triggerCameraShake(0.035);
  }
}


function slide() {
  if (
    !gameRunning ||
    gamePaused ||
    isJumping
  ) {
    return;
  }


  isSliding = true;
  slideTimer = 34;
  playSlideSound();

  triggerCameraShake(0.028);
}


function dash() {
  if (
    !gameRunning ||
    gamePaused
  ) {
    return;
  }


  speed += 0.18;
  dashTrailTimer = 34;
  playDashSound();

  triggerCameraShake(0.09);


  if (abilityText) {
    abilityText.textContent =
      "Surya Dash Activated";
  }


  setTimeout(function () {
    if (abilityText) {
      abilityText.textContent =
        "Surya Dash Ready";
    }
  }, 900);
}


/* =========================================================
   UPDATE HUMAN PLAYER
========================================================= */

function updatePlayer() {
  if (
    !player ||
    !player.userData ||
    !player.userData.rig
  ) {
    return;
  }


  const rig =
    player.userData.rig;


  const targetX =
    lanes[currentLane];


  const laneDifference =
    targetX -
    player.position.x;


  /*
    Smooth lane changing.
  */

  player.position.x +=
    laneDifference * 0.18;


  /* =====================================================
     JUMP PHYSICS
  ===================================================== */

  if (isJumping) {
    playerY += velocityY;
    velocityY += gravity;


    if (playerY <= 1) {
      playerY = 1;
      velocityY = 0;
      isJumping = false;

      triggerCameraShake(0.045);
    }
  }


  player.position.y =
    playerY - 1;


  /* =====================================================
     SLIDE TIMER
  ===================================================== */

  if (isSliding) {
    slideTimer--;


    if (slideTimer <= 0) {
      isSliding = false;
    }
  }


  /* =====================================================
     RUNNING CYCLE
  ===================================================== */

  playerRunClock +=
    0.15 +
    speed * 0.52;


  const runWave =
    Math.sin(playerRunClock);


  const oppositeRunWave =
    Math.sin(
      playerRunClock +
      Math.PI
    );


  const leftKneeWave =
    Math.max(
      0,
      Math.sin(
        playerRunClock +
        Math.PI * 0.2
      )
    );


  const rightKneeWave =
    Math.max(
      0,
      Math.sin(
        playerRunClock +
        Math.PI +
        Math.PI * 0.2
      )
    );


  const runStrength =
    Math.min(
      0.76,
      0.46 +
      speed * 0.34
    );


  /*
    Human gait:
    opposite arm and leg move together.
  */

  let leftArmRotation =
    oppositeRunWave *
    runStrength;


  let rightArmRotation =
    runWave *
    runStrength;


  let leftLegRotation =
    runWave *
    runStrength;


  let rightLegRotation =
    oppositeRunWave *
    runStrength;


  let leftForearmRotation =
    -0.48 -
    Math.max(
      0,
      oppositeRunWave
    ) * 0.42;


  let rightForearmRotation =
    -0.48 -
    Math.max(
      0,
      runWave
    ) * 0.42;


  let leftLowerLegRotation =
    leftKneeWave * 0.72;


  let rightLowerLegRotation =
    rightKneeWave * 0.72;


  let leftFootRotation =
    -leftKneeWave * 0.24;


  let rightFootRotation =
    -rightKneeWave * 0.24;


  let bodyTargetY = 0;
  let bodyTargetRotationX = -0.035;
  let bodyTargetScaleY = 1;


  /* =====================================================
     JUMP POSE
  ===================================================== */

  if (isJumping) {
    leftArmRotation = -0.65;
    rightArmRotation = -0.65;

    leftForearmRotation = -0.72;
    rightForearmRotation = -0.72;

    leftLegRotation = 0.5;
    rightLegRotation = -0.18;

    leftLowerLegRotation = 0.72;
    rightLowerLegRotation = 0.42;

    leftFootRotation = -0.18;
    rightFootRotation = -0.08;

    bodyTargetRotationX = -0.1;
  }


  /* =====================================================
     SLIDE POSE
  ===================================================== */

  if (isSliding) {
    leftArmRotation = -1.05;
    rightArmRotation = -1.05;

    leftForearmRotation = -0.85;
    rightForearmRotation = -0.85;

    leftLegRotation = 1.02;
    rightLegRotation = 0.7;

    leftLowerLegRotation = 1.05;
    rightLowerLegRotation = 0.76;

    leftFootRotation = -0.28;
    rightFootRotation = -0.18;

    bodyTargetY = -0.43;
    bodyTargetRotationX = -0.72;
    bodyTargetScaleY = 0.72;
  }


  /* =====================================================
     APPLY LIMB ANIMATION
  ===================================================== */

  rig.leftArm.rotation.x +=
    (
      leftArmRotation -
      rig.leftArm.rotation.x
    ) * 0.3;


  rig.rightArm.rotation.x +=
    (
      rightArmRotation -
      rig.rightArm.rotation.x
    ) * 0.3;


  rig.leftForearm.rotation.x +=
    (
      leftForearmRotation -
      rig.leftForearm.rotation.x
    ) * 0.34;


  rig.rightForearm.rotation.x +=
    (
      rightForearmRotation -
      rig.rightForearm.rotation.x
    ) * 0.34;


  rig.leftLeg.rotation.x +=
    (
      leftLegRotation -
      rig.leftLeg.rotation.x
    ) * 0.31;


  rig.rightLeg.rotation.x +=
    (
      rightLegRotation -
      rig.rightLeg.rotation.x
    ) * 0.31;


  rig.leftLowerLeg.rotation.x +=
    (
      leftLowerLegRotation -
      rig.leftLowerLeg.rotation.x
    ) * 0.34;


  rig.rightLowerLeg.rotation.x +=
    (
      rightLowerLegRotation -
      rig.rightLowerLeg.rotation.x
    ) * 0.34;


  rig.leftFoot.rotation.x +=
    (
      leftFootRotation -
      rig.leftFoot.rotation.x
    ) * 0.34;


  rig.rightFoot.rotation.x +=
    (
      rightFootRotation -
      rig.rightFoot.rotation.x
    ) * 0.34;


  /* =====================================================
     HUMAN BODY MOVEMENT
  ===================================================== */

  rig.humanBody.position.y +=
    (
      bodyTargetY -
      rig.humanBody.position.y
    ) * 0.26;


  rig.humanBody.rotation.x +=
    (
      bodyTargetRotationX -
      rig.humanBody.rotation.x
    ) * 0.24;


  rig.humanBody.scale.y +=
    (
      bodyTargetScaleY -
      rig.humanBody.scale.y
    ) * 0.28;


  /*
    Natural lean during lane changes.
  */

  const targetLean =
    THREE.MathUtils.clamp(
      -laneDifference * 0.085,
      -0.18,
      0.18
    );


  rig.humanBody.rotation.z +=
    (
      targetLean -
      rig.humanBody.rotation.z
    ) * 0.2;


  /*
    Small torso twist while running.
  */

  if (
    !isSliding &&
    !isJumping
  ) {
    rig.torso.rotation.y =
      runWave * 0.035;


    rig.chestShape.rotation.y =
      runWave * 0.028;


    rig.hips.rotation.y =
      -runWave * 0.04;


    rig.humanBody.position.y +=
      Math.abs(runWave) *
      0.018;


    rig.headGroup.rotation.z =
      Math.sin(
        playerRunClock * 0.5
      ) * 0.018;


    rig.headGroup.rotation.y =
      -rig.humanBody.rotation.z *
      0.32;
  } else {
    rig.torso.rotation.y *= 0.82;
    rig.chestShape.rotation.y *= 0.82;
    rig.hips.rotation.y *= 0.82;

    rig.headGroup.rotation.z *= 0.82;
    rig.headGroup.rotation.y *= 0.82;
  }


  /* =====================================================
     SURYA CORE ANIMATION
  ===================================================== */

  if (suryaCore) {
    suryaCore.rotation.x += 0.028;
    suryaCore.rotation.y += 0.05;


    const corePulse =
      1 +
      Math.sin(
        Date.now() * 0.006
      ) * 0.075;


    suryaCore.scale.set(
      corePulse,
      corePulse,
      corePulse
    );
  }


  if (rig.coreFrame) {
    rig.coreFrame.rotation.x -= 0.014;
    rig.coreFrame.rotation.y += 0.022;
  }


  if (rig.coreRayGroup) {
    rig.coreRayGroup.rotation.z +=
      0.012;
  }


  if (rig.coreLight) {
    rig.coreLight.intensity =
      1.05 +
      Math.sin(
        Date.now() * 0.006
      ) * 0.18;
  }


  /* =====================================================
     GROUND SHADOW
  ===================================================== */

  if (rig.shadow) {
    const jumpHeight =
      Math.max(
        0,
        player.position.y
      );


    const shadowScale =
      Math.max(
        0.55,
        1 -
        jumpHeight * 0.12
      );


    rig.shadow.scale.set(
      shadowScale,
      shadowScale,
      shadowScale
    );


    rig.shadow.material.opacity =
      Math.max(
        0.1,
        0.32 -
        jumpHeight * 0.05
      );


    rig.shadow.position.y =
      -player.position.y +
      0.025;
  }


  updatePlayerEnergyTrail();


  /* =====================================================
     DAMAGE BLINK
  ===================================================== */

  if (invincibleTimer > 0) {
    invincibleTimer--;


    player.visible =
      Math.floor(
        invincibleTimer / 6
      ) % 2 === 0;
  } else {
    player.visible = true;
  }


  player.userData.previousX =
    player.position.x;
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(amount) {
  if (
    invincibleTimer > 0 ||
    gameOver
  ) {
    return;
  }


  /*
    Shield absorbs one attack.
  */

  if (shieldActive) {
    shieldActive = false;
     playShieldSound();

    updateShieldStatus();
     if (
  typeof triggerDamageFlash ===
  "function"
) {
  triggerDamageFlash(3);
}

    invincibleTimer = 45;


    createExplosion(
      player.position.x,
      player.position.y + 1.35,
      player.position.z
    );


    triggerCameraShake(0.16);


    setMission(
      "Shield absorbed damage",
      90
    );

    return;
  }


  coreHealth = Math.max(
  0,
  coreHealth - amount
);

invincibleTimer = 75;

updateCoreHealth();

if (
  typeof triggerDamageFlash ===
  "function"
) {
  triggerDamageFlash(amount);
}
  playDamageSound();


  createExplosion(
    player.position.x,
    player.position.y + 1.35,
    player.position.z
  );


  triggerCameraShake(0.27);


  setMission(
    "Surya Core damaged",
    85
  );


  if (coreHealth <= 0) {
    endGame();
  }
}
