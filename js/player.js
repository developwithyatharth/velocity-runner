/* =========================================================
   player.js
   Velocity Runner: Rise of Bharat
   Premium animated 3D Aarav Astra player

   Preserved public functions:
   - createPlayer()
   - moveLeft()
   - moveRight()
   - jump()
   - slide()
   - dash()
   - updatePlayer()
   - damagePlayer(amount)
========================================================= */


/* =========================================================
   PLAYER VISUAL STATE
========================================================= */

var playerRunClock = 0;

var playerTrailGroup = null;
var playerTrailSegments = [];

var playerSparkParticles = null;
var playerSparkData = [];

var dashTrailTimer = 0;
var playerVisualClock = 0;


var PLAYER_VISUALS = {
  shieldShell: null,

  dashAura: null,
  dashRings: [],

  coreHalo: null,
  coreGlowSprite: null,

  muzzleAnchor: null,
  muzzleGlow: null,

  suitMaterials: [],
  glowMaterials: [],

  previousVisibleState: true
};


/* =========================================================
   SAFE HELPERS
========================================================= */

function playerSafeNumber(
  value,
  fallback
) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return typeof fallback === "number"
    ? fallback
    : 0;
}


function playerCurrentSpeed() {
  if (
    typeof speed === "number" &&
    Number.isFinite(speed)
  ) {
    return Math.max(
      0,
      speed
    );
  }

  return 0.2;
}


function playerIsMobile() {
  return (
    typeof window !== "undefined" &&
    window.innerWidth <= 720
  );
}


function playerGlowMaterial(
  color,
  opacity
) {
  var material =
    new THREE.MeshBasicMaterial({
      color: color,

      transparent: true,

      opacity:
        typeof opacity === "number"
          ? opacity
          : 1,

      blending:
        THREE.AdditiveBlending,

      depthWrite: false,

      toneMapped: false
    });

  PLAYER_VISUALS
    .glowMaterials
    .push(material);

  return material;
}


function playerStandardMaterial(
  options
) {
  var material =
    new THREE.MeshStandardMaterial({
      color: options.color,

      roughness:
        playerSafeNumber(
          options.roughness,
          0.4
        ),

      metalness:
        playerSafeNumber(
          options.metalness,
          0.35
        ),

      emissive:
        typeof options.emissive ===
          "number"
          ? options.emissive
          : 0x000000,

      emissiveIntensity:
        playerSafeNumber(
          options.emissiveIntensity,
          0
        )
    });

  PLAYER_VISUALS
    .suitMaterials
    .push(material);

  return material;
}


function playerDisposeTree(
  root
) {
  if (!root) {
    return;
  }

  root.traverse(
    function (object) {
      if (
        object.geometry &&
        object.geometry.dispose
      ) {
        object.geometry.dispose();
      }

      if (object.material) {
        var materials =
          Array.isArray(
            object.material
          )
            ? object.material
            : [object.material];

        materials.forEach(
          function (material) {
            if (!material) {
              return;
            }

            if (
              material.map &&
              material.map.dispose
            ) {
              material.map.dispose();
            }

            if (
              material.dispose
            ) {
              material.dispose();
            }
          }
        );
      }
    }
  );
}


function playerCallSound(
  functionName
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  var soundFunction =
    window[functionName];

  if (
    typeof soundFunction ===
    "function"
  ) {
    soundFunction();
  }
}


function playerShake(
  strength,
  duration
) {
  if (
    typeof triggerCinematicShake ===
    "function"
  ) {
    triggerCinematicShake(
      playerSafeNumber(
        strength,
        0.12
      ),

      playerSafeNumber(
        duration,
        0.28
      )
    );

    return;
  }

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(
      playerSafeNumber(
        strength,
        0.12
      )
    );
  }
}


function playerSetMission(
  message,
  duration
) {
  if (
    typeof setMission ===
    "function"
  ) {
    setMission(
      message,
      duration
    );
  }
}


function createPlayerGlowTexture() {
  var canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 256;
  canvas.height = 256;

  var context =
    canvas.getContext("2d");

  var gradient =
    context.createRadialGradient(
      128,
      128,
      0,
      128,
      128,
      128
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,1)"
  );

  gradient.addColorStop(
    0.17,
    "rgba(255,210,85,0.95)"
  );

  gradient.addColorStop(
    0.42,
    "rgba(0,225,255,0.4)"
  );

  gradient.addColorStop(
    1,
    "rgba(0,150,255,0)"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    256,
    256
  );

  var texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.minFilter =
    THREE.LinearFilter;

  if (
    typeof THREE.sRGBEncoding !==
    "undefined"
  ) {
    texture.encoding =
      THREE.sRGBEncoding;
  }

  return texture;
}


/* =========================================================
   CREATE PLAYER
========================================================= */

function createPlayer() {
  if (
    typeof THREE ===
      "undefined" ||
    !scene
  ) {
    return;
  }

  if (player) {
    scene.remove(player);

    playerDisposeTree(
      player
    );
  }

  if (playerTrailGroup) {
    scene.remove(
      playerTrailGroup
    );

    playerDisposeTree(
      playerTrailGroup
    );
  }

  PLAYER_VISUALS = {
    shieldShell: null,

    dashAura: null,
    dashRings: [],

    coreHalo: null,
    coreGlowSprite: null,

    muzzleAnchor: null,
    muzzleGlow: null,

    suitMaterials: [],
    glowMaterials: [],

    previousVisibleState: true
  };

  playerTrailSegments = [];
  playerSparkData = [];

  playerTrailGroup = null;
  playerSparkParticles = null;

  playerRunClock = 0;
  playerVisualClock = 0;

  dashTrailTimer = 0;

  player =
    new THREE.Group();

  player.name =
    "AaravAstra";

  var humanBody =
    new THREE.Group();

  humanBody.name =
    "AaravRig";

  player.add(
    humanBody
  );


  /* =====================================================
     MATERIALS
  ===================================================== */

  var skinMaterial =
    playerStandardMaterial({
      color: 0xb87951,
      roughness: 0.68,
      metalness: 0
    });

  var skinLightMaterial =
    playerStandardMaterial({
      color: 0xcf8a5e,
      roughness: 0.7,
      metalness: 0
    });

  var hairMaterial =
    playerStandardMaterial({
      color: 0x0d0e15,
      roughness: 0.9,
      metalness: 0
    });

  var armorMaterial =
    playerStandardMaterial({
      color: 0x06172f,

      roughness: 0.23,
      metalness: 0.76,

      emissive: 0x062b50,

      emissiveIntensity:
        0.34
    });

  var armorSecondaryMaterial =
    playerStandardMaterial({
      color: 0x12345d,

      roughness: 0.28,
      metalness: 0.68,

      emissive: 0x0a4263,

      emissiveIntensity:
        0.28
    });

  var darkFabricMaterial =
    playerStandardMaterial({
      color: 0x030916,

      roughness: 0.58,
      metalness: 0.24,

      emissive: 0x020b16,

      emissiveIntensity:
        0.12
    });

  var shoeMaterial =
    playerStandardMaterial({
      color: 0x07111f,

      roughness: 0.34,
      metalness: 0.55,

      emissive: 0x082238,

      emissiveIntensity:
        0.2
    });

  var cyanMaterial =
    playerGlowMaterial(
      0x45efff,
      0.9
    );

  var cyanSoftMaterial =
    playerGlowMaterial(
      0x00bde8,
      0.56
    );

  var goldMaterial =
    playerGlowMaterial(
      0xffc54f,
      0.94
    );

  var magentaMaterial =
    playerGlowMaterial(
      0xd65cff,
      0.72
    );

  var eyeMaterial =
    playerStandardMaterial({
      color: 0x21130d,
      roughness: 0.7,
      metalness: 0
    });

  var eyeWhiteMaterial =
    playerStandardMaterial({
      color: 0xf5f1e8,
      roughness: 0.75,
      metalness: 0
    });


  /* =====================================================
     HIPS AND WAIST
  ===================================================== */

  var hips =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.32,
        0.37,
        0.44,
        20
      ),

      armorMaterial
    );

  hips.position.y =
    1.08;

  hips.scale.z =
    0.84;

  hips.castShadow =
    true;

  humanBody.add(
    hips
  );


  var waist =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.29,
        0.32,
        0.29,
        18
      ),

      darkFabricMaterial
    );

  waist.position.y =
    1.39;

  waist.scale.z =
    0.84;

  humanBody.add(
    waist
  );


  var beltLine =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.61,
        0.06,
        0.42
      ),

      goldMaterial
    );

  beltLine.position.set(
    0,
    1.29,
    -0.01
  );

  humanBody.add(
    beltLine
  );


  var beltCore =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        0.085,
        0
      ),

      cyanMaterial
    );

  beltCore.position.set(
    0,
    1.29,
    -0.24
  );

  humanBody.add(
    beltCore
  );


  /* =====================================================
     TORSO
  ===================================================== */

  var torso =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.46,
        0.3,
        1.08,
        22
      ),

      armorMaterial
    );

  torso.position.y =
    1.9;

  torso.scale.z =
    0.74;

  torso.castShadow =
    true;

  humanBody.add(
    torso
  );


  var chestShape =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.45,
        24,
        20
      ),

      armorSecondaryMaterial
    );

  chestShape.scale.set(
    1,
    0.62,
    0.7
  );

  chestShape.position.set(
    0,
    2.08,
    -0.02
  );

  chestShape.castShadow =
    true;

  humanBody.add(
    chestShape
  );


  var abdomen =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.31,
        0.28,
        0.5,
        18
      ),

      darkFabricMaterial
    );

  abdomen.position.y =
    1.54;

  abdomen.scale.z =
    0.8;

  humanBody.add(
    abdomen
  );


  /* =====================================================
     CHEST ARMOR
  ===================================================== */

  var leftChestPlate =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.34,
        0.23,
        0.08
      ),

      armorSecondaryMaterial
    );

  leftChestPlate.position.set(
    -0.2,
    2.15,
    -0.32
  );

  leftChestPlate.rotation.z =
    -0.2;

  humanBody.add(
    leftChestPlate
  );


  var rightChestPlate =
    leftChestPlate.clone();

  rightChestPlate.position.x =
    0.2;

  rightChestPlate.rotation.z =
    0.2;

  humanBody.add(
    rightChestPlate
  );


  var chestLineLeft =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.045,
        0.67,
        0.038
      ),

      cyanMaterial
    );

  chestLineLeft.position.set(
    -0.19,
    1.91,
    -0.33
  );

  chestLineLeft.rotation.z =
    -0.19;

  humanBody.add(
    chestLineLeft
  );


  var chestLineRight =
    chestLineLeft.clone();

  chestLineRight.material =
    goldMaterial;

  chestLineRight.position.x =
    0.19;

  chestLineRight.rotation.z =
    0.19;

  humanBody.add(
    chestLineRight
  );


  var chestBridge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.42,
        0.035,
        0.04
      ),

      magentaMaterial
    );

  chestBridge.position.set(
    0,
    2.28,
    -0.34
  );

  humanBody.add(
    chestBridge
  );


  /* =====================================================
     NECK AND HEAD
  ===================================================== */

  var neck =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.135,
        0.155,
        0.29,
        16
      ),

      skinMaterial
    );

  neck.position.y =
    2.51;

  neck.castShadow =
    true;

  humanBody.add(
    neck
  );


  var collarLeft =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.22,
        0.11,
        0.18
      ),

      armorSecondaryMaterial
    );

  collarLeft.position.set(
    -0.15,
    2.48,
    -0.05
  );

  collarLeft.rotation.z =
    -0.22;

  humanBody.add(
    collarLeft
  );


  var collarRight =
    collarLeft.clone();

  collarRight.position.x =
    0.15;

  collarRight.rotation.z =
    0.22;

  humanBody.add(
    collarRight
  );


  var headGroup =
    new THREE.Group();

  headGroup.position.y =
    2.87;

  humanBody.add(
    headGroup
  );


  var head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.295,
        26,
        22
      ),

      skinLightMaterial
    );

  head.scale.set(
    0.91,
    1.09,
    0.93
  );

  head.castShadow =
    true;

  headGroup.add(
    head
  );


  var hairCap =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.305,
        24,
        18,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.56
      ),

      hairMaterial
    );

  hairCap.scale.set(
    0.95,
    0.87,
    0.96
  );

  hairCap.position.y =
    0.09;

  headGroup.add(
    hairCap
  );


  var hairFrontLeft =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        0.076,
        0.23,
        5
      ),

      hairMaterial
    );

  hairFrontLeft.position.set(
    -0.1,
    0.23,
    -0.24
  );

  hairFrontLeft.rotation.x =
    0.62;

  hairFrontLeft.rotation.z =
    -0.18;

  headGroup.add(
    hairFrontLeft
  );


  var hairFrontRight =
    hairFrontLeft.clone();

  hairFrontRight.position.x =
    0.08;

  hairFrontRight.rotation.z =
    0.16;

  headGroup.add(
    hairFrontRight
  );


  var leftEar =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.056,
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
    -0.28,
    0,
    0
  );

  headGroup.add(
    leftEar
  );


  var rightEar =
    leftEar.clone();

  rightEar.position.x =
    0.28;

  headGroup.add(
    rightEar
  );


  var leftEyeWhite =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.035,
        12,
        10
      ),

      eyeWhiteMaterial
    );

  leftEyeWhite.scale.set(
    1.25,
    0.65,
    0.38
  );

  leftEyeWhite.position.set(
    -0.09,
    0.045,
    -0.268
  );

  headGroup.add(
    leftEyeWhite
  );


  var rightEyeWhite =
    leftEyeWhite.clone();

  rightEyeWhite.position.x =
    0.09;

  headGroup.add(
    rightEyeWhite
  );


  var leftEye =
    new THREE.Mesh(
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
    -0.291
  );

  headGroup.add(
    leftEye
  );


  var rightEye =
    leftEye.clone();

  rightEye.position.x =
    0.09;

  headGroup.add(
    rightEye
  );


  var nose =
    new THREE.Mesh(
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
    -0.31
  );

  nose.rotation.x =
    -Math.PI / 2;

  headGroup.add(
    nose
  );


  var mouth =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.102,
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
    -0.298
  );

  headGroup.add(
    mouth
  );


  var templeDevice =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.05,
        0.15,
        0.075
      ),

      cyanMaterial
    );

  templeDevice.position.set(
    0.295,
    0.005,
    -0.02
  );

  headGroup.add(
    templeDevice
  );


  var visorLine =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.39,
        0.018,
        0.02
      ),

      cyanSoftMaterial
    );

  visorLine.position.set(
    0,
    0.06,
    -0.299
  );

  visorLine.visible =
    false;

  headGroup.add(
    visorLine
  );


  /* =====================================================
     ARMS
  ===================================================== */

  var leftArm =
    createHumanArm({
      side: -1,

      skinMaterial:
        skinMaterial,

      suitMaterial:
        armorSecondaryMaterial,

      darkMaterial:
        darkFabricMaterial,

      glowMaterial:
        cyanMaterial
    });

  leftArm.position.set(
    -0.49,
    2.24,
    0
  );

  humanBody.add(
    leftArm
  );


  var rightArm =
    createHumanArm({
      side: 1,

      skinMaterial:
        skinMaterial,

      suitMaterial:
        armorSecondaryMaterial,

      darkMaterial:
        darkFabricMaterial,

      glowMaterial:
        goldMaterial
    });

  rightArm.position.set(
    0.49,
    2.24,
    0
  );

  humanBody.add(
    rightArm
  );


  /* =====================================================
     ARM CANNON
  ===================================================== */

  var armCannon =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.075,
        0.09,
        0.34,
        12
      ),

      armorMaterial
    );

  armCannon.rotation.x =
    Math.PI / 2;

  armCannon.position.set(
    0,
    -0.42,
    -0.12
  );

  rightArm.userData
    .forearmPivot
    .add(armCannon);


  var cannonGlow =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.075,
        0.018,
        8,
        20
      ),

      cyanMaterial
    );

  cannonGlow.rotation.x =
    Math.PI / 2;

  cannonGlow.position.set(
    0,
    -0.42,
    -0.31
  );

  rightArm.userData
    .forearmPivot
    .add(cannonGlow);


  var muzzleAnchor =
    new THREE.Object3D();

  muzzleAnchor.position.set(
    0,
    -0.42,
    -0.37
  );

  rightArm.userData
    .forearmPivot
    .add(muzzleAnchor);


  var muzzleGlow =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.07,
        12,
        12
      ),

      playerGlowMaterial(
        0x8ff8ff,
        0.95
      )
    );

  muzzleGlow.position.copy(
    muzzleAnchor.position
  );

  muzzleGlow.visible =
    false;

  rightArm.userData
    .forearmPivot
    .add(muzzleGlow);


  PLAYER_VISUALS.muzzleAnchor =
    muzzleAnchor;

  PLAYER_VISUALS.muzzleGlow =
    muzzleGlow;


  /* =====================================================
     LEGS
  ===================================================== */

  var leftLeg =
    createHumanLeg({
      side: -1,

      suitMaterial:
        armorMaterial,

      darkMaterial:
        darkFabricMaterial,

      shoeMaterial:
        shoeMaterial,

      glowMaterial:
        cyanMaterial
    });

  leftLeg.position.set(
    -0.2,
    1.06,
    0
  );

  humanBody.add(
    leftLeg
  );


  var rightLeg =
    createHumanLeg({
      side: 1,

      suitMaterial:
        armorMaterial,

      darkMaterial:
        darkFabricMaterial,

      shoeMaterial:
        shoeMaterial,

      glowMaterial:
        goldMaterial
    });

  rightLeg.position.set(
    0.2,
    1.06,
    0
  );

  humanBody.add(
    rightLeg
  );


  /* =====================================================
     SURYA CORE
  ===================================================== */

  suryaCore =
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(
        0.17,
        1
      ),

      goldMaterial
    );

  suryaCore.position.set(
    0,
    2.02,
    -0.36
  );

  humanBody.add(
    suryaCore
  );


  var coreFrame =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        0.25,
        0
      ),

      new THREE.MeshBasicMaterial({
        color: 0x45efff,

        wireframe: true,

        transparent: true,

        opacity: 0.72,

        depthWrite: false,

        toneMapped: false
      })
    );

  coreFrame.position.copy(
    suryaCore.position
  );

  humanBody.add(
    coreFrame
  );


  var coreHalo =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.3,
        0.025,
        10,
        48
      ),

      cyanMaterial
    );

  coreHalo.position.copy(
    suryaCore.position
  );

  coreHalo.rotation.x =
    Math.PI / 2;

  humanBody.add(
    coreHalo
  );


  var coreGlowSprite =
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map:
          createPlayerGlowTexture(),

        color: 0xffb52e,

        transparent: true,

        opacity: 0.72,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        toneMapped: false
      })
    );

  coreGlowSprite.position.copy(
    suryaCore.position
  );

  coreGlowSprite.scale.set(
    0.95,
    0.95,
    1
  );

  humanBody.add(
    coreGlowSprite
  );


  var coreLight =
    new THREE.PointLight(
      0xffbd43,

      playerIsMobile()
        ? 0.9
        : 1.35,

      7
    );

  coreLight.position.set(
    0,
    2.02,
    -0.45
  );

  humanBody.add(
    coreLight
  );


  var coreRayGroup =
    new THREE.Group();

  for (
    var rayIndex = 0;
    rayIndex < 10;
    rayIndex++
  ) {
    var ray =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.03,
          0.12,
          0.024
        ),

        rayIndex % 2 === 0
          ? goldMaterial
          : cyanMaterial
      );

    ray.position.y =
      0.29;

    var rayPivot =
      new THREE.Group();

    rayPivot.rotation.z =
      rayIndex *
      Math.PI *
      2 /
      10;

    rayPivot.add(
      ray
    );

    coreRayGroup.add(
      rayPivot
    );
  }

  coreRayGroup.position.copy(
    suryaCore.position
  );

  coreRayGroup.position.z -=
    0.018;

  humanBody.add(
    coreRayGroup
  );


  PLAYER_VISUALS.coreHalo =
    coreHalo;

  PLAYER_VISUALS.coreGlowSprite =
    coreGlowSprite;


  /* =====================================================
     BACK ENERGY SPINE
  ===================================================== */

  var backStrip =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.82,
        0.04
      ),

      cyanMaterial
    );

  backStrip.position.set(
    0,
    1.93,
    0.33
  );

  humanBody.add(
    backStrip
  );


  var backNodeTop =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        0.08,
        0
      ),

      magentaMaterial
    );

  backNodeTop.position.set(
    0,
    2.24,
    0.36
  );

  humanBody.add(
    backNodeTop
  );


  var backNodeBottom =
    backNodeTop.clone();

  backNodeBottom.material =
    goldMaterial;

  backNodeBottom.position.y =
    1.63;

  humanBody.add(
    backNodeBottom
  );


  /* =====================================================
     SHIELD SHELL
  ===================================================== */

  var shieldShell =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.12,
        28,
        22
      ),

      new THREE.MeshBasicMaterial({
        color: 0x45efff,

        transparent: true,

        opacity: 0.1,

        wireframe: true,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        toneMapped: false
      })
    );

  shieldShell.position.y =
    1.5;

  shieldShell.scale.set(
    0.82,
    1.42,
    0.82
  );

  shieldShell.visible =
    false;

  player.add(
    shieldShell
  );

  PLAYER_VISUALS.shieldShell =
    shieldShell;


  /* =====================================================
     DASH AURA
  ===================================================== */

  var dashAura =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.65,
        0.95,
        3.3,
        18,
        1,
        true
      ),

      new THREE.MeshBasicMaterial({
        color: 0x45efff,

        transparent: true,

        opacity: 0.08,

        side:
          THREE.DoubleSide,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        toneMapped: false
      })
    );

  dashAura.rotation.x =
    Math.PI / 2;

  dashAura.position.set(
    0,
    1.45,
    1.05
  );

  dashAura.visible =
    false;

  player.add(
    dashAura
  );

  PLAYER_VISUALS.dashAura =
    dashAura;


  for (
    var ringIndex = 0;
    ringIndex < 3;
    ringIndex++
  ) {
    var dashRing =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.56 +
          ringIndex *
          0.18,

          0.024,

          10,
          42
        ),

        ringIndex === 1
          ? goldMaterial
          : cyanMaterial
      );

    dashRing.rotation.x =
      Math.PI / 2;

    dashRing.position.set(
      0,
      1.4,
      0.45 +
      ringIndex *
      0.35
    );

    dashRing.visible =
      false;

    player.add(
      dashRing
    );

    PLAYER_VISUALS
      .dashRings
      .push(dashRing);
  }


  /* =====================================================
     GROUND SHADOW
  ===================================================== */

  var shadow =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.66,
        30
      ),

      new THREE.MeshBasicMaterial({
        color: 0x000000,

        transparent: true,

        opacity: 0.3,

        depthWrite: false
      })
    );

  shadow.rotation.x =
    -Math.PI / 2;

  shadow.position.y =
    0.025;

  player.add(
    shadow
  );


  /* =====================================================
     RIG REFERENCES
  ===================================================== */

  player.userData.rig = {
    humanBody: humanBody,

    hips: hips,
    torso: torso,
    chestShape: chestShape,

    headGroup: headGroup,
    visorLine: visorLine,

    leftArm: leftArm,
    rightArm: rightArm,

    leftForearm:
      leftArm.userData
        .forearmPivot,

    rightForearm:
      rightArm.userData
        .forearmPivot,

    leftLeg: leftLeg,
    rightLeg: rightLeg,

    leftLowerLeg:
      leftLeg.userData
        .lowerLegPivot,

    rightLowerLeg:
      rightLeg.userData
        .lowerLegPivot,

    leftFoot:
      leftLeg.userData
        .footPivot,

    rightFoot:
      rightLeg.userData
        .footPivot,

    coreFrame: coreFrame,

    coreRayGroup:
      coreRayGroup,

    coreLight: coreLight,

    shadow: shadow,

    backNodeTop:
      backNodeTop,

    backNodeBottom:
      backNodeBottom,

    muzzleAnchor:
      muzzleAnchor,

    muzzleGlow:
      muzzleGlow
  };


  player.userData.previousX =
    lanes[currentLane];

  player.userData
    .lastShotVisualTime = 0;


  player.position.set(
    lanes[currentLane],
    0,
    0
  );


  player.scale.set(
    1.06,
    1.06,
    1.06
  );


  scene.add(
    player
  );


  createPlayerEnergyTrail();

  createPlayerSparkSystem();
}


/* =========================================================
   CREATE HUMAN ARM
========================================================= */

function createHumanArm(
  options
) {
  var armRoot =
    new THREE.Group();

  var side =
    options.side;


  var shoulder =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.175,
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

  shoulder.castShadow =
    true;

  armRoot.add(
    shoulder
  );


  var shoulderPad =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.2,
        16,
        12
      ),

      options.darkMaterial
    );

  shoulderPad.scale.set(
    1.06,
    0.56,
    0.92
  );

  shoulderPad.position.set(
    side * 0.028,
    0.04,
    0
  );

  armRoot.add(
    shoulderPad
  );


  var shoulderGlow =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.2,
        0.035,
        0.14
      ),

      options.glowMaterial
    );

  shoulderGlow.position.set(
    side * 0.02,
    0.08,
    -0.15
  );

  armRoot.add(
    shoulderGlow
  );


  var upperArm =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.105,
        0.122,
        0.55,
        16
      ),

      options.suitMaterial
    );

  upperArm.position.y =
    -0.3;

  upperArm.castShadow =
    true;

  armRoot.add(
    upperArm
  );


  var forearmPivot =
    new THREE.Group();

  forearmPivot.position.y =
    -0.58;

  armRoot.add(
    forearmPivot
  );


  var elbow =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.112,
        16,
        14
      ),

      options.darkMaterial
    );

  forearmPivot.add(
    elbow
  );


  var elbowGuard =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.14,
        0.11,
        0.08
      ),

      options.suitMaterial
    );

  elbowGuard.position.z =
    -0.105;

  forearmPivot.add(
    elbowGuard
  );


  var forearm =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.087,
        0.106,
        0.5,
        16
      ),

      options.darkMaterial
    );

  forearm.position.y =
    -0.28;

  forearm.castShadow =
    true;

  forearmPivot.add(
    forearm
  );


  var forearmGlow =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.036,
        0.33,
        0.028
      ),

      options.glowMaterial
    );

  forearmGlow.position.set(
    side * 0.087,
    -0.27,
    -0.072
  );

  forearmPivot.add(
    forearmGlow
  );


  var hand =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.102,
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

  hand.position.y =
    -0.57;

  hand.castShadow =
    true;

  forearmPivot.add(
    hand
  );


  armRoot.userData
    .forearmPivot =
    forearmPivot;


  return armRoot;
}


/* =========================================================
   CREATE HUMAN LEG
========================================================= */

function createHumanLeg(
  options
) {
  var legRoot =
    new THREE.Group();


  var thigh =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.148,
        0.174,
        0.7,
        18
      ),

      options.suitMaterial
    );

  thigh.position.y =
    -0.37;

  thigh.castShadow =
    true;

  legRoot.add(
    thigh
  );


  var thighStripe =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.038,
        0.43,
        0.03
      ),

      options.glowMaterial
    );

  thighStripe.position.set(
    options.side * 0.13,
    -0.35,
    -0.02
  );

  legRoot.add(
    thighStripe
  );


  var lowerLegPivot =
    new THREE.Group();

  lowerLegPivot.position.y =
    -0.74;

  legRoot.add(
    lowerLegPivot
  );


  var knee =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.147,
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

  lowerLegPivot.add(
    knee
  );


  var kneeGuard =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.132,
        16,
        12
      ),

      options.suitMaterial
    );

  kneeGuard.scale.set(
    0.8,
    0.6,
    0.35
  );

  kneeGuard.position.z =
    -0.118;

  lowerLegPivot.add(
    kneeGuard
  );


  var kneeGlow =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.15,
        0.028,
        0.028
      ),

      options.glowMaterial
    );

  kneeGlow.position.set(
    0,
    0,
    -0.165
  );

  lowerLegPivot.add(
    kneeGlow
  );


  var lowerLeg =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.108,
        0.137,
        0.66,
        18
      ),

      options.darkMaterial
    );

  lowerLeg.position.y =
    -0.37;

  lowerLeg.castShadow =
    true;

  lowerLegPivot.add(
    lowerLeg
  );


  var calfGlow =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.036,
        0.4,
        0.03
      ),

      options.glowMaterial
    );

  calfGlow.position.set(
    options.side * 0.107,
    -0.36,
    0.03
  );

  lowerLegPivot.add(
    calfGlow
  );


  var footPivot =
    new THREE.Group();

  footPivot.position.y =
    -0.71;

  lowerLegPivot.add(
    footPivot
  );


  var ankle =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.096,
        14,
        12
      ),

      options.darkMaterial
    );

  footPivot.add(
    ankle
  );


  var shoe =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.185,
        18,
        14
      ),

      options.shoeMaterial
    );

  shoe.scale.set(
    0.82,
    0.55,
    1.48
  );

  shoe.position.set(
    0,
    -0.1,
    -0.14
  );

  shoe.castShadow =
    true;

  footPivot.add(
    shoe
  );


  var shoeSole =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.255,
        0.058,
        0.49
      ),

      options.glowMaterial
    );

  shoeSole.position.set(
    0,
    -0.195,
    -0.14
  );

  footPivot.add(
    shoeSole
  );


  var heelLight =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.15,
        0.06,
        0.05
      ),

      options.glowMaterial
    );

  heelLight.position.set(
    0,
    -0.12,
    0.1
  );

  footPivot.add(
    heelLight
  );


  legRoot.userData
    .lowerLegPivot =
    lowerLegPivot;

  legRoot.userData
    .footPivot =
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

  playerTrailGroup.name =
    "AaravEnergyTrail";


  var segmentCount =
    playerIsMobile()
      ? 12
      : 18;


  for (
    var segmentIndex = 0;
    segmentIndex < segmentCount;
    segmentIndex++
  ) {
    var color =
      segmentIndex % 3 === 0
        ? 0xffc54f
        : segmentIndex % 3 === 1
          ? 0x45efff
          : 0xd65cff;


    var trailMaterial =
      new THREE.MeshBasicMaterial({
        color: color,

        transparent: true,

        opacity: 0,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        toneMapped: false
      });


    var trailSegment =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.045,
          0.045,
          0.82
        ),

        trailMaterial
      );


    trailSegment.visible =
      false;


    trailSegment.userData.index =
      segmentIndex;


    trailSegment.userData.phase =
      Math.random() *
      Math.PI *
      2;


    playerTrailSegments.push(
      trailSegment
    );


    playerTrailGroup.add(
      trailSegment
    );
  }


  scene.add(
    playerTrailGroup
  );
}


/* =========================================================
   PLAYER SPARK PARTICLES
========================================================= */

function createPlayerSparkSystem() {
  var count =
    playerIsMobile()
      ? 24
      : 46;


  var positions =
    new Float32Array(
      count * 3
    );


  playerSparkData = [];


  for (
    var index = 0;
    index < count;
    index++
  ) {
    playerSparkData.push({
      x: 0,
      y: 0,
      z: 0,

      life: 0,

      speed:
        0.03 +
        Math.random() *
        0.05,

      drift:
        (
          Math.random() -
          0.5
        ) *
        0.02
    });
  }


  var geometry =
    new THREE.BufferGeometry();


  geometry.setAttribute(
    "position",

    new THREE.BufferAttribute(
      positions,
      3
    )
  );


  var material =
    new THREE.PointsMaterial({
      color: 0xffd96b,

      size:
        playerIsMobile()
          ? 0.055
          : 0.075,

      transparent: true,

      opacity: 0.8,

      depthWrite: false,

      blending:
        THREE.AdditiveBlending,

      toneMapped: false
    });


  playerSparkParticles =
    new THREE.Points(
      geometry,
      material
    );


  playerSparkParticles.visible =
    false;


  playerSparkParticles.frustumCulled =
    false;


  playerTrailGroup.add(
    playerSparkParticles
  );
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


  if (
    dashTrailTimer > 0
  ) {
    dashTrailTimer--;
  }


  var currentSpeed =
    playerCurrentSpeed();


  var baseSpeed =
    typeof START_SPEED ===
      "number"
      ? START_SPEED
      : 0.15;


  var dashStrength =
    dashTrailTimer > 0
      ? 1
      : 0;


  var regularStrength =
    Math.min(
      1,

      Math.max(
        0,
        currentSpeed -
        baseSpeed
      ) *
      2.4
    );


  var trailStrength =
    Math.max(
      regularStrength *
      0.34,

      dashStrength
    );


  for (
    var segmentIndex = 0;
    segmentIndex <
      playerTrailSegments.length;
    segmentIndex++
  ) {
    var segment =
      playerTrailSegments[
        segmentIndex
      ];


    var column =
      segmentIndex % 3;


    var depthIndex =
      Math.floor(
        segmentIndex / 3
      );


    var xOffset =
      column === 0
        ? -0.28
        : column === 2
          ? 0.28
          : 0;


    var targetX =
      player.position.x +
      xOffset;


    segment.position.x +=
      (
        targetX -
        segment.position.x
      ) *
      0.28;


    segment.position.y =
      player.position.y +
      0.52 +
      column *
      0.54;


    segment.position.z =
      0.7 +
      depthIndex *
      0.7;


    segment.rotation.z =
      Math.sin(
        playerVisualClock *
        3 +
        segment.userData.phase
      ) *
      0.08;


    segment.scale.z =
      0.72 +
      trailStrength *
      2.8;


    segment.scale.x =
      0.9 +
      dashStrength *
      0.8;


    segment.material.opacity =
      trailStrength *
      Math.max(
        0.025,

        0.4 -
        depthIndex *
        0.055
      );


    segment.visible =
      segment.material.opacity >
      0.012;
  }


  updatePlayerSparkSystem(
    trailStrength
  );
}


/* =========================================================
   UPDATE PLAYER SPARKS
========================================================= */

function updatePlayerSparkSystem(
  trailStrength
) {
  if (
    !playerSparkParticles ||
    !playerSparkParticles.geometry
  ) {
    return;
  }


  var positions =
    playerSparkParticles
      .geometry
      .attributes
      .position
      .array;


  var active =
    trailStrength > 0.2;


  playerSparkParticles.visible =
    active;


  if (!active) {
    return;
  }


  for (
    var index = 0;
    index <
      playerSparkData.length;
    index++
  ) {
    var spark =
      playerSparkData[index];


    if (
      spark.life <= 0
    ) {
      spark.x =
        player.position.x +
        (
          Math.random() -
          0.5
        ) *
        0.65;


      spark.y =
        player.position.y +
        0.25 +
        Math.random() *
        1.6;


      spark.z =
        0.45 +
        Math.random() *
        0.8;


      spark.life =
        18 +
        Math.random() *
        24;


      spark.speed =
        0.03 +
        Math.random() *
        0.06 +
        trailStrength *
        0.04;


      spark.drift =
        (
          Math.random() -
          0.5
        ) *
        0.025;
    }


    spark.life--;


    spark.z +=
      spark.speed;


    spark.y +=
      spark.drift;


    spark.x +=
      spark.drift *
      0.6;


    positions[index * 3] =
      spark.x;


    positions[
      index * 3 + 1
    ] =
      spark.y;


    positions[
      index * 3 + 2
    ] =
      spark.z;
  }


  playerSparkParticles
    .geometry
    .attributes
    .position
    .needsUpdate = true;


  playerSparkParticles
    .material
    .opacity =
    0.35 +
    trailStrength *
    0.5;
}


/* =========================================================
   MOVEMENT INPUT
========================================================= */

function moveLeft() {
  if (
    !gameRunning ||
    gamePaused
  ) {
    return;
  }


  currentLane =
    Math.max(
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


  currentLane =
    Math.min(
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


    playerCallSound(
      "playJumpSound"
    );


    playerShake(
      0.04,
      0.16
    );
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


  playerCallSound(
    "playSlideSound"
  );


  playerShake(
    0.035,
    0.18
  );
}


function dash() {
  if (
    !gameRunning ||
    gamePaused
  ) {
    return;
  }


  speed += 0.18;

  dashTrailTimer =
    38;


  playerCallSound(
    "playDashSound"
  );


  playerShake(
    0.12,
    0.36
  );


  if (
    typeof abilityText !==
      "undefined" &&
    abilityText
  ) {
    abilityText.textContent =
      "Surya Dash Activated";
  }


  setTimeout(
    function () {
      if (
        typeof abilityText !==
          "undefined" &&
        abilityText
      ) {
        abilityText.textContent =
          "Surya Dash Ready";
      }
    },

    900
  );
}


/* =========================================================
   UPDATE PLAYER
========================================================= */

function updatePlayer() {
  if (
    !player ||
    !player.userData ||
    !player.userData.rig
  ) {
    return;
  }


  var rig =
    player.userData.rig;


  var currentSpeed =
    playerCurrentSpeed();


  var currentTime =
    typeof performance !==
      "undefined"
      ? performance.now() *
        0.001
      : Date.now() *
        0.001;


  playerVisualClock =
    currentTime;


  var targetX =
    lanes[currentLane];


  var laneDifference =
    targetX -
    player.position.x;


  player.position.x +=
    laneDifference *
    0.18;


  /* =====================================================
     JUMP PHYSICS
  ===================================================== */

  if (isJumping) {
    playerY +=
      velocityY;


    velocityY +=
      gravity;


    if (
      playerY <= 1
    ) {
      playerY = 1;

      velocityY = 0;

      isJumping = false;


      playerShake(
        0.055,
        0.2
      );
    }
  }


  player.position.y =
    playerY - 1;


  /* =====================================================
     SLIDE TIMER
  ===================================================== */

  if (isSliding) {
    slideTimer--;


    if (
      slideTimer <= 0
    ) {
      isSliding = false;
    }
  }


  /* =====================================================
     RUNNING CYCLE
  ===================================================== */

  playerRunClock +=
    0.15 +
    currentSpeed *
    0.54;


  var runWave =
    Math.sin(
      playerRunClock
    );


  var oppositeRunWave =
    Math.sin(
      playerRunClock +
      Math.PI
    );


  var leftKneeWave =
    Math.max(
      0,

      Math.sin(
        playerRunClock +
        Math.PI *
        0.2
      )
    );


  var rightKneeWave =
    Math.max(
      0,

      Math.sin(
        playerRunClock +
        Math.PI +
        Math.PI *
        0.2
      )
    );


  var runStrength =
    Math.min(
      0.82,

      0.48 +
      currentSpeed *
      0.36
    );


  var leftArmRotation =
    oppositeRunWave *
    runStrength;


  var rightArmRotation =
    runWave *
    runStrength;


  var leftLegRotation =
    runWave *
    runStrength;


  var rightLegRotation =
    oppositeRunWave *
    runStrength;


  var leftForearmRotation =
    -0.48 -
    Math.max(
      0,
      oppositeRunWave
    ) *
    0.44;


  var rightForearmRotation =
    -0.48 -
    Math.max(
      0,
      runWave
    ) *
    0.44;


  var leftLowerLegRotation =
    leftKneeWave *
    0.76;


  var rightLowerLegRotation =
    rightKneeWave *
    0.76;


  var leftFootRotation =
    -leftKneeWave *
    0.25;


  var rightFootRotation =
    -rightKneeWave *
    0.25;


  var bodyTargetY = 0;

  var bodyTargetRotationX =
    -0.04;

  var bodyTargetScaleY = 1;


  /* =====================================================
     JUMP POSE
  ===================================================== */

  if (isJumping) {
    leftArmRotation =
      -0.68;

    rightArmRotation =
      -0.68;


    leftForearmRotation =
      -0.76;

    rightForearmRotation =
      -0.76;


    leftLegRotation =
      0.52;

    rightLegRotation =
      -0.2;


    leftLowerLegRotation =
      0.76;

    rightLowerLegRotation =
      0.44;


    leftFootRotation =
      -0.18;

    rightFootRotation =
      -0.08;


    bodyTargetRotationX =
      -0.12;
  }


  /* =====================================================
     SLIDE POSE
  ===================================================== */

  if (isSliding) {
    leftArmRotation =
      -1.08;

    rightArmRotation =
      -1.08;


    leftForearmRotation =
      -0.9;

    rightForearmRotation =
      -0.9;


    leftLegRotation =
      1.05;

    rightLegRotation =
      0.72;


    leftLowerLegRotation =
      1.08;

    rightLowerLegRotation =
      0.8;


    leftFootRotation =
      -0.3;

    rightFootRotation =
      -0.2;


    bodyTargetY =
      -0.44;


    bodyTargetRotationX =
      -0.74;


    bodyTargetScaleY =
      0.72;
  }


  /* =====================================================
     APPLY LIMB ANIMATION
  ===================================================== */

  rig.leftArm.rotation.x +=
    (
      leftArmRotation -
      rig.leftArm.rotation.x
    ) *
    0.3;


  rig.rightArm.rotation.x +=
    (
      rightArmRotation -
      rig.rightArm.rotation.x
    ) *
    0.3;


  rig.leftForearm.rotation.x +=
    (
      leftForearmRotation -
      rig.leftForearm.rotation.x
    ) *
    0.34;


  rig.rightForearm.rotation.x +=
    (
      rightForearmRotation -
      rig.rightForearm.rotation.x
    ) *
    0.34;


  rig.leftLeg.rotation.x +=
    (
      leftLegRotation -
      rig.leftLeg.rotation.x
    ) *
    0.31;


  rig.rightLeg.rotation.x +=
    (
      rightLegRotation -
      rig.rightLeg.rotation.x
    ) *
    0.31;


  rig.leftLowerLeg.rotation.x +=
    (
      leftLowerLegRotation -
      rig.leftLowerLeg.rotation.x
    ) *
    0.34;


  rig.rightLowerLeg.rotation.x +=
    (
      rightLowerLegRotation -
      rig.rightLowerLeg.rotation.x
    ) *
    0.34;


  rig.leftFoot.rotation.x +=
    (
      leftFootRotation -
      rig.leftFoot.rotation.x
    ) *
    0.34;


  rig.rightFoot.rotation.x +=
    (
      rightFootRotation -
      rig.rightFoot.rotation.x
    ) *
    0.34;


  /* =====================================================
     BODY ANIMATION
  ===================================================== */

  rig.humanBody.position.y +=
    (
      bodyTargetY -
      rig.humanBody.position.y
    ) *
    0.26;


  rig.humanBody.rotation.x +=
    (
      bodyTargetRotationX -
      rig.humanBody.rotation.x
    ) *
    0.24;


  rig.humanBody.scale.y +=
    (
      bodyTargetScaleY -
      rig.humanBody.scale.y
    ) *
    0.28;


  var targetLean =
    THREE.MathUtils.clamp(
      -laneDifference *
      0.09,

      -0.2,
      0.2
    );


  rig.humanBody.rotation.z +=
    (
      targetLean -
      rig.humanBody.rotation.z
    ) *
    0.2;


  if (
    !isSliding &&
    !isJumping
  ) {
    rig.torso.rotation.y =
      runWave *
      0.04;


    rig.chestShape.rotation.y =
      runWave *
      0.032;


    rig.hips.rotation.y =
      -runWave *
      0.045;


    rig.humanBody.position.y +=
      Math.abs(
        runWave
      ) *
      0.02;


    rig.headGroup.rotation.z =
      Math.sin(
        playerRunClock *
        0.5
      ) *
      0.02;


    rig.headGroup.rotation.y =
      -rig.humanBody.rotation.z *
      0.34;
  } else {
    rig.torso.rotation.y *=
      0.82;


    rig.chestShape.rotation.y *=
      0.82;


    rig.hips.rotation.y *=
      0.82;


    rig.headGroup.rotation.z *=
      0.82;


    rig.headGroup.rotation.y *=
      0.82;
  }


  updatePlayerCoreVisuals(
    currentTime,
    currentSpeed,
    rig
  );


  updatePlayerShieldVisual(
    currentTime
  );


  updatePlayerDashVisual(
    currentTime
  );


  updatePlayerMuzzleVisual(
    currentTime
  );


  updatePlayerShadow(
    rig
  );


  updatePlayerEnergyTrail();


  updatePlayerDamageBlink();


  player.userData.previousX =
    player.position.x;
}


/* =========================================================
   CORE VISUALS
========================================================= */

function updatePlayerCoreVisuals(
  currentTime,
  currentSpeed,
  rig
) {
  if (suryaCore) {
    suryaCore.rotation.x +=
      0.028;


    suryaCore.rotation.y +=
      0.05;


    var corePulse =
      1 +
      Math.sin(
        currentTime *
        6
      ) *
      0.075;


    suryaCore.scale.setScalar(
      corePulse
    );
  }


  if (rig.coreFrame) {
    rig.coreFrame.rotation.x -=
      0.014;


    rig.coreFrame.rotation.y +=
      0.022;


    rig.coreFrame.scale.setScalar(
      0.96 +
      Math.sin(
        currentTime *
        3.2
      ) *
      0.04
    );
  }


  if (rig.coreRayGroup) {
    rig.coreRayGroup.rotation.z +=
      0.014;
  }


  if (
    PLAYER_VISUALS.coreHalo
  ) {
    PLAYER_VISUALS
      .coreHalo
      .rotation.z -=
      0.02;


    PLAYER_VISUALS
      .coreHalo
      .scale
      .setScalar(
        0.94 +
        Math.sin(
          currentTime *
          4.1
        ) *
        0.06
      );
  }


  if (
    PLAYER_VISUALS
      .coreGlowSprite
  ) {
    var glowScale =
      0.9 +
      Math.sin(
        currentTime *
        3.7
      ) *
      0.08 +
      currentSpeed *
      0.04;


    PLAYER_VISUALS
      .coreGlowSprite
      .scale
      .set(
        glowScale,
        glowScale,
        1
      );


    PLAYER_VISUALS
      .coreGlowSprite
      .material
      .opacity =
      0.62 +
      Math.sin(
        currentTime *
        4
      ) *
      0.08;
  }


  if (rig.coreLight) {
    rig.coreLight.intensity =
      (
        playerIsMobile()
          ? 0.9
          : 1.25
      ) +
      Math.sin(
        currentTime *
        6
      ) *
      0.2;
  }


  if (
    rig.backNodeTop
  ) {
    rig.backNodeTop.rotation.y +=
      0.03;
  }


  if (
    rig.backNodeBottom
  ) {
    rig.backNodeBottom.rotation.y -=
      0.026;
  }
}


/* =========================================================
   SHIELD VISUAL
========================================================= */

function updatePlayerShieldVisual(
  currentTime
) {
  var shell =
    PLAYER_VISUALS
      .shieldShell;


  if (!shell) {
    return;
  }


  var active =
    typeof shieldActive !==
      "undefined" &&
    shieldActive;


  shell.visible =
    active;


  if (active) {
    shell.rotation.y +=
      0.01;


    shell.rotation.z -=
      0.006;


    shell.material.opacity =
      0.08 +
      Math.sin(
        currentTime *
        4.5
      ) *
      0.025;


    shell.scale.set(
      0.82 +
      Math.sin(
        currentTime *
        2.8
      ) *
      0.02,

      1.42 +
      Math.sin(
        currentTime *
        3.2
      ) *
      0.03,

      0.82 +
      Math.sin(
        currentTime *
        2.8
      ) *
      0.02
    );
  }
}


/* =========================================================
   DASH VISUAL
========================================================= */

function updatePlayerDashVisual(
  currentTime
) {
  var active =
    dashTrailTimer > 0;


  if (
    PLAYER_VISUALS.dashAura
  ) {
    PLAYER_VISUALS
      .dashAura
      .visible =
      active;


    if (active) {
      PLAYER_VISUALS
        .dashAura
        .rotation.z +=
        0.025;


      PLAYER_VISUALS
        .dashAura
        .material
        .opacity =
        0.06 +
        Math.sin(
          currentTime *
          5
        ) *
        0.02;


      PLAYER_VISUALS
        .dashAura
        .scale.z =
        1 +
        Math.sin(
          currentTime *
          4
        ) *
        0.08;
    }
  }


  for (
    var index = 0;
    index <
      PLAYER_VISUALS
        .dashRings
        .length;
    index++
  ) {
    var ring =
      PLAYER_VISUALS
        .dashRings[index];


    ring.visible =
      active;


    if (active) {
      ring.rotation.z +=
        0.02 *
        (
          index % 2 === 0
            ? 1
            : -1
        );


      ring.position.z =
        0.45 +
        index *
        0.35 +
        Math.sin(
          currentTime *
          4 +
          index
        ) *
        0.08;


      ring.scale.setScalar(
        0.9 +
        Math.sin(
          currentTime *
          5 +
          index
        ) *
        0.08
      );
    }
  }
}


/* =========================================================
   MUZZLE FLASH
========================================================= */

function updatePlayerMuzzleVisual(
  currentTime
) {
  var glow =
    PLAYER_VISUALS
      .muzzleGlow;


  if (!glow) {
    return;
  }


  var elapsed =
    currentTime -
    player.userData
      .lastShotVisualTime;


  glow.visible =
    elapsed >= 0 &&
    elapsed < 0.09;


  if (glow.visible) {
    var scale =
      1.4 -
      elapsed *
      8;


    glow.scale.setScalar(
      Math.max(
        0.3,
        scale
      )
    );
  }
}


function triggerPlayerMuzzleFlash() {
  if (
    !player ||
    !player.userData
  ) {
    return;
  }


  player.userData
    .lastShotVisualTime =
    typeof performance !==
      "undefined"
      ? performance.now() *
        0.001
      : Date.now() *
        0.001;
}


function getPlayerMuzzleWorldPosition(
  targetVector
) {
  var output =
    targetVector ||
    new THREE.Vector3();


  if (
    PLAYER_VISUALS
      .muzzleAnchor
  ) {
    PLAYER_VISUALS
      .muzzleAnchor
      .getWorldPosition(
        output
      );


    return output;
  }


  if (player) {
    output.set(
      player.position.x,
      player.position.y +
      1.8,
      player.position.z -
      0.6
    );
  }


  return output;
}


/* =========================================================
   GROUND SHADOW
========================================================= */

function updatePlayerShadow(
  rig
) {
  if (!rig.shadow) {
    return;
  }


  var jumpHeight =
    Math.max(
      0,
      player.position.y
    );


  var shadowScale =
    Math.max(
      0.5,

      1 -
      jumpHeight *
      0.13
    );


  rig.shadow.scale.set(
    shadowScale,
    shadowScale,
    shadowScale
  );


  rig.shadow.material.opacity =
    Math.max(
      0.08,

      0.3 -
      jumpHeight *
      0.055
    );


  rig.shadow.position.y =
    -player.position.y +
    0.025;
}


/* =========================================================
   DAMAGE BLINK
========================================================= */

function updatePlayerDamageBlink() {
  if (
    invincibleTimer > 0
  ) {
    invincibleTimer--;


    player.visible =
      Math.floor(
        invincibleTimer / 5
      ) %
      2 === 0;
  } else {
    player.visible =
      true;
  }
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
  amount
) {
  if (
    invincibleTimer > 0 ||
    gameOver
  ) {
    return;
  }


  /* Shield absorbs attack */

  if (shieldActive) {
    shieldActive =
      false;


    playerCallSound(
      "playShieldSound"
    );


    if (
      typeof updateShieldStatus ===
      "function"
    ) {
      updateShieldStatus();
    }


    if (
      typeof triggerDamageFlash ===
      "function"
    ) {
      triggerDamageFlash(
        3
      );
    }


    invincibleTimer =
      45;


    if (
      typeof createExplosion ===
      "function"
    ) {
      createExplosion(
        player.position.x,

        player.position.y +
        1.35,

        player.position.z
      );
    }


    playerShake(
      0.18,
      0.34
    );


    playerSetMission(
      "Shield absorbed damage",
      90
    );


    return;
  }


  coreHealth =
    Math.max(
      0,

      coreHealth -
      amount
    );


  invincibleTimer =
    75;


  if (
    typeof updateCoreHealth ===
    "function"
  ) {
    updateCoreHealth();
  }


  if (
    typeof triggerDamageFlash ===
    "function"
  ) {
    triggerDamageFlash(
      amount
    );
  }


  playerCallSound(
    "playDamageSound"
  );


  if (
    typeof createExplosion ===
    "function"
  ) {
    createExplosion(
      player.position.x,

      player.position.y +
      1.35,

      player.position.z
    );
  }


  playerShake(
    0.3,
    0.46
  );


  playerSetMission(
    "Surya Core damaged",
    85
  );


  if (
    coreHealth <= 0 &&
    typeof endGame ===
      "function"
  ) {
    endGame();
  }
}
