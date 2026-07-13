/* =========================================================
   world.js
   Velocity Runner: Rise of Bharat
   Premium animated 3D Neo Aryavarta world

   Public functions preserved:
   - createRoad()
   - createCity()
   - createRain()
   - createSkySymbols()
   - updateMovingWorld()
========================================================= */


/* =========================================================
   WORLD VISUAL STATE
========================================================= */

var worldVisualState = {
  quality: null,
  roadScanners: [],
  roadMandalaParts: [],
  roadArchLights: [],
  skySymbols: [],
  horizonSurya: null,
  horizonCore: null,
  horizonRings: [],
  horizonGlow: null,
  starField: null,
  rainMesh: null,
  rainPositionAttribute: null,
  rainMaterial: null
};


/* =========================================================
   SAFE WORLD HELPERS
========================================================= */

function getWorldSafeNumber(
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


function getWorldSpeed() {
  if (
    typeof speed === "undefined"
  ) {
    return 0.34;
  }

  return Math.max(
    0,
    getWorldSafeNumber(
      speed,
      0.34
    )
  );
}


function getWorldRoadTileCount() {
  if (
    typeof ROAD_TILE_COUNT === "number" &&
    Number.isFinite(
      ROAD_TILE_COUNT
    ) &&
    ROAD_TILE_COUNT > 0
  ) {
    return Math.floor(
      ROAD_TILE_COUNT
    );
  }

  return 34;
}


function getWorldTileDepth() {
  if (
    typeof TILE_DEPTH === "number" &&
    Number.isFinite(
      TILE_DEPTH
    ) &&
    TILE_DEPTH > 0
  ) {
    return TILE_DEPTH;
  }

  return 8;
}


function getWorldRoadLoopDistance() {
  if (
    typeof ROAD_LOOP_DISTANCE ===
      "number" &&
    Number.isFinite(
      ROAD_LOOP_DISTANCE
    ) &&
    ROAD_LOOP_DISTANCE > 0
  ) {
    return ROAD_LOOP_DISTANCE;
  }

  return (
    getWorldRoadTileCount() *
    getWorldTileDepth()
  );
}


function getWorldQualityProfile() {
  var width =
    typeof window !== "undefined"
      ? window.innerWidth
      : 1280;

  var mobile =
    width <= 720;

  var medium =
    width > 720 &&
    width <= 1180;

  return {
    mobile: mobile,

    buildingCount:
      mobile
        ? 44
        : medium
          ? 60
          : 78,

    rainDropCount:
      mobile
        ? 90
        : medium
          ? 140
          : 190,

    skySymbolCount:
      mobile
        ? 8
        : 14,

    starCount:
      mobile
        ? 260
        : 520,

    windowRows:
      mobile
        ? 5
        : 8
  };
}


function resetWorldVisualState() {
  worldVisualState.quality =
    getWorldQualityProfile();

  worldVisualState.roadScanners = [];
  worldVisualState.roadMandalaParts = [];
  worldVisualState.roadArchLights = [];
  worldVisualState.skySymbols = [];

  worldVisualState.horizonSurya =
    null;

  worldVisualState.horizonCore =
    null;

  worldVisualState.horizonRings = [];

  worldVisualState.horizonGlow =
    null;

  worldVisualState.starField =
    null;

  worldVisualState.rainMesh =
    null;

  worldVisualState.rainPositionAttribute =
    null;

  worldVisualState.rainMaterial =
    null;
}


function createWorldGlowMaterial(
  color,
  opacity
) {
  return new THREE.MeshBasicMaterial({
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
}


function createWorldStandardMaterial(
  options
) {
  return new THREE.MeshStandardMaterial({
    color: options.color,

    metalness:
      getWorldSafeNumber(
        options.metalness,
        0.55
      ),

    roughness:
      getWorldSafeNumber(
        options.roughness,
        0.3
      ),

    emissive:
      typeof options.emissive ===
        "number"
        ? options.emissive
        : 0x000000,

    emissiveIntensity:
      getWorldSafeNumber(
        options.emissiveIntensity,
        0
      )
  });
}


function worldHexColor(color) {
  return (
    "#" +
    Number(color)
      .toString(16)
      .padStart(6, "0")
  );
}


/* =========================================================
   PROCEDURAL TEXTURES
========================================================= */

function createWorldGlowTexture() {
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
    0.16,
    "rgba(255,215,92,0.95)"
  );

  gradient.addColorStop(
    0.45,
    "rgba(255,125,32,0.42)"
  );

  gradient.addColorStop(
    1,
    "rgba(255,90,0,0)"
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


function createWorldHologramTexture(
  label,
  color
) {
  var canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 512;
  canvas.height = 256;

  var context =
    canvas.getContext("2d");

  var colorText =
    worldHexColor(color);

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  var panelGradient =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );

  panelGradient.addColorStop(
    0,
    "rgba(2,10,28,0.88)"
  );

  panelGradient.addColorStop(
    1,
    "rgba(18,4,36,0.72)"
  );

  context.fillStyle =
    panelGradient;

  context.fillRect(
    18,
    18,
    476,
    220
  );

  context.strokeStyle =
    colorText;

  context.lineWidth = 7;

  context.strokeRect(
    22,
    22,
    468,
    212
  );

  context.globalAlpha =
    0.28;

  context.lineWidth = 2;

  for (
    var line = 0;
    line < 7;
    line++
  ) {
    var y =
      46 + line * 27;

    context.beginPath();

    context.moveTo(
      40,
      y
    );

    context.lineTo(
      472,
      y
    );

    context.stroke();
  }

  context.globalAlpha = 1;

  context.fillStyle =
    colorText;

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.font =
    "800 66px Segoe UI, Arial, sans-serif";

  context.shadowColor =
    colorText;

  context.shadowBlur = 22;

  context.fillText(
    label,
    256,
    120
  );

  context.font =
    "700 22px Segoe UI, Arial, sans-serif";

  context.shadowBlur = 10;

  context.fillText(
    "NEO ARYAVARTA // 2149",
    256,
    188
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
   ROAD HELPERS
========================================================= */

function createRoadEnergyArch(
  tile,
  tileIndex,
  cyanMaterial,
  magentaMaterial,
  goldMaterial
) {
  var arch =
    new THREE.Group();

  var archColorMaterial =
    tileIndex % 2 === 0
      ? cyanMaterial
      : magentaMaterial;

  var leftPillar =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        3.2,
        0.12
      ),
      archColorMaterial
    );

  leftPillar.position.set(
    -5.05,
    1.75,
    0
  );

  var rightPillar =
    leftPillar.clone();

  rightPillar.position.x =
    5.05;

  var topBeam =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.2,
        0.12,
        0.12
      ),
      archColorMaterial
    );

  topBeam.position.set(
    0,
    3.33,
    0
  );

  var crown =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.55,
        0.045,
        10,
        42
      ),
      goldMaterial
    );

  crown.position.set(
    0,
    3.32,
    0.08
  );

  arch.add(
    leftPillar,
    rightPillar,
    topBeam,
    crown
  );

  arch.position.z =
    -getWorldTileDepth() *
    0.28;

  arch.userData.crown =
    crown;

  arch.userData.phase =
    tileIndex * 0.63;

  worldVisualState
    .roadArchLights
    .push(arch);

  tile.add(arch);
}


function createRoadMandala(
  tile,
  tileIndex,
  goldMaterial,
  cyanMaterial
) {
  var mandala =
    new THREE.Group();

  var outerRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.64,
        0.035,
        10,
        48
      ),
      goldMaterial
    );

  var innerRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.34,
        0.025,
        10,
        36
      ),
      cyanMaterial
    );

  outerRing.rotation.x =
    Math.PI / 2;

  innerRing.rotation.x =
    Math.PI / 2;

  mandala.position.set(
    0,
    0.22,
    0
  );

  mandala.add(
    outerRing,
    innerRing
  );

  for (
    var spokeIndex = 0;
    spokeIndex < 8;
    spokeIndex++
  ) {
    var spoke =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.025,
          0.025,
          0.42
        ),
        goldMaterial
      );

    spoke.rotation.y =
      (
        Math.PI * 2 *
        spokeIndex
      ) / 8;

    mandala.add(spoke);
  }

  mandala.userData.phase =
    tileIndex * 0.45;

  worldVisualState
    .roadMandalaParts
    .push(mandala);

  tile.add(mandala);
}


/* =========================================================
   CREATE ROAD
========================================================= */

function createRoad() {
  resetWorldVisualState();

  if (!roadGroup) {
    return;
  }

  var roadTileCount =
    getWorldRoadTileCount();

  var tileDepth =
    getWorldTileDepth();

  var roadBaseMaterial =
    createWorldStandardMaterial({
      color: 0x071326,
      metalness: 0.82,
      roughness: 0.28,
      emissive: 0x03172d,
      emissiveIntensity: 0.42
    });

  var roadShoulderMaterial =
    createWorldStandardMaterial({
      color: 0x102f55,
      metalness: 0.72,
      roughness: 0.3,
      emissive: 0x06223d,
      emissiveIntensity: 0.38
    });

  var laneFloorMaterial =
    createWorldStandardMaterial({
      color: 0x0b2548,
      metalness: 0.7,
      roughness: 0.24,
      emissive: 0x061c36,
      emissiveIntensity: 0.52
    });

  var laneInsetMaterial =
    createWorldStandardMaterial({
      color: 0x102d53,
      metalness: 0.78,
      roughness: 0.22,
      emissive: 0x07345a,
      emissiveIntensity: 0.45
    });

  var cyanGlowMaterial =
    createWorldGlowMaterial(
      0x38ecff,
      0.95
    );

  var cyanSoftMaterial =
    createWorldGlowMaterial(
      0x00bde8,
      0.58
    );

  var magentaGlowMaterial =
    createWorldGlowMaterial(
      0xd45cff,
      0.9
    );

  var goldGlowMaterial =
    createWorldGlowMaterial(
      0xffc44d,
      0.96
    );

  var warningMaterial =
    createWorldGlowMaterial(
      0xff7a24,
      0.92
    );

  for (
    var tileIndex = 0;
    tileIndex < roadTileCount;
    tileIndex++
  ) {
    var tile =
      new THREE.Group();

    tile.position.z =
      -tileIndex *
      tileDepth;

    tile.userData.phase =
      tileIndex * 0.52;

    var base =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          11.4,
          0.28,
          tileDepth
        ),
        roadBaseMaterial
      );

    base.position.set(
      0,
      -0.13,
      0
    );

    base.receiveShadow = true;

    tile.add(base);

    var leftShoulder =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.1,
          0.14,
          tileDepth - 0.18
        ),
        roadShoulderMaterial
      );

    leftShoulder.position.set(
      -5.1,
      0.02,
      0
    );

    var rightShoulder =
      leftShoulder.clone();

    rightShoulder.position.x =
      5.1;

    tile.add(
      leftShoulder,
      rightShoulder
    );

    for (
      var laneIndex = 0;
      laneIndex < 3;
      laneIndex++
    ) {
      var laneX =
        -3 + laneIndex * 3;

      var laneFloor =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.72,
            0.07,
            tileDepth - 0.22
          ),
          laneFloorMaterial
        );

      laneFloor.position.set(
        laneX,
        0.04,
        0
      );

      laneFloor.receiveShadow =
        true;

      tile.add(laneFloor);

      var laneInset =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.18,
            0.035,
            tileDepth - 0.62
          ),
          laneInsetMaterial
        );

      laneInset.position.set(
        laneX,
        0.087,
        0
      );

      tile.add(laneInset);
    }

    var leftDivider =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.075,
          0.055,
          tileDepth - 0.45
        ),
        cyanGlowMaterial
      );

    leftDivider.position.set(
      -1.5,
      0.145,
      0
    );

    var rightDivider =
      leftDivider.clone();

    rightDivider.position.x =
      1.5;

    tile.add(
      leftDivider,
      rightDivider
    );

    var leftEdgeRail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.16,
          tileDepth - 0.18
        ),
        magentaGlowMaterial
      );

    leftEdgeRail.position.set(
      -5.52,
      0.19,
      0
    );

    var rightEdgeRail =
      leftEdgeRail.clone();

    rightEdgeRail.position.x =
      5.52;

    tile.add(
      leftEdgeRail,
      rightEdgeRail
    );

    var leftLowerGlow =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.055,
          0.06,
          tileDepth - 0.28
        ),
        cyanSoftMaterial
      );

    leftLowerGlow.position.set(
      -5.3,
      0.13,
      0
    );

    var rightLowerGlow =
      leftLowerGlow.clone();

    rightLowerGlow.position.x =
      5.3;

    tile.add(
      leftLowerGlow,
      rightLowerGlow
    );

    var centerDash =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.15,
          0.065,
          Math.min(
            2.5,
            tileDepth * 0.34
          )
        ),
        goldGlowMaterial
      );

    centerDash.position.set(
      0,
      0.15,
      0
    );

    tile.add(centerDash);

    var crossSeam =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          10.6,
          0.022,
          0.055
        ),
        cyanSoftMaterial
      );

    crossSeam.position.set(
      0,
      0.14,
      -tileDepth * 0.48
    );

    tile.add(crossSeam);

    var scannerMaterial =
      createWorldGlowMaterial(
        tileIndex % 2 === 0
          ? 0x39efff
          : 0xffbf4d,
        0.34
      );

    var scanner =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          9.6,
          0.025,
          0.18
        ),
        scannerMaterial
      );

    scanner.position.set(
      0,
      0.17,
      tileDepth * 0.22
    );

    scanner.userData.phase =
      tileIndex * 0.8;

    worldVisualState
      .roadScanners
      .push(scanner);

    tile.add(scanner);

    if (
      tileIndex % 2 === 0
    ) {
      var leftMarker =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.22,
            0.32,
            0.22
          ),
          warningMaterial
        );

      leftMarker.position.set(
        -5.42,
        0.34,
        -tileDepth * 0.22
      );

      var rightMarker =
        leftMarker.clone();

      rightMarker.position.x =
        5.42;

      tile.add(
        leftMarker,
        rightMarker
      );
    }

    if (
      tileIndex % 4 === 0
    ) {
      createRoadMandala(
        tile,
        tileIndex,
        goldGlowMaterial,
        cyanGlowMaterial
      );
    }

    if (
      tileIndex % 7 === 0
    ) {
      createRoadEnergyArch(
        tile,
        tileIndex,
        cyanGlowMaterial,
        magentaGlowMaterial,
        goldGlowMaterial
      );
    }

    roadTiles.push(tile);

    roadGroup.add(tile);
  }
}


/* =========================================================
   BUILDING HELPERS
========================================================= */

function createBuildingHologram(
  building,
  side,
  width,
  height,
  depth,
  label,
  color,
  phase
) {
  var texture =
    createWorldHologramTexture(
      label,
      color
    );

  var material =
    new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });

  var panel =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        Math.min(
          3.2,
          width * 1.5
        ),
        1.15
      ),
      material
    );

  panel.position.set(
    -side *
      (
        width / 2 +
        0.08
      ),

    Math.min(
      height - 1,
      Math.max(
        2.2,
        height * 0.56
      )
    ),

    0
  );

  panel.rotation.y =
    side > 0
      ? Math.PI / 2
      : -Math.PI / 2;

  panel.userData.phase =
    phase;

  building.userData.hologram =
    panel;

  building.add(panel);
}


function createBuildingRoofDetails(
  building,
  width,
  height,
  goldMaterial,
  cyanMaterial,
  magentaMaterial,
  buildingIndex
) {
  var topRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        Math.max(
          0.35,
          width * 0.34
        ),
        0.035,
        10,
        34
      ),

      buildingIndex % 2 === 0
        ? goldMaterial
        : cyanMaterial
    );

  topRing.position.set(
    0,
    height + 0.28,
    0
  );

  topRing.rotation.x =
    Math.PI / 2;

  building.userData.topRing =
    topRing;

  building.add(topRing);

  var beacon =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.09,
        12,
        12
      ),

      buildingIndex % 3 === 0
        ? magentaMaterial
        : goldMaterial
    );

  beacon.position.set(
    0,
    height + 0.54,
    0
  );

  building.userData.beacon =
    beacon;

  building.add(beacon);

  if (
    buildingIndex % 5 === 0
  ) {
    var spire =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          Math.max(
            0.22,
            width * 0.2
          ),

          Math.min(
            2.8,
            height * 0.24
          ),

          5
        ),

        createWorldStandardMaterial({
          color: 0x132746,
          metalness: 0.75,
          roughness: 0.24,
          emissive: 0x6d20a4,
          emissiveIntensity: 0.52
        })
      );

    spire.position.set(
      0,

      height +
        Math.min(
          1.4,
          height * 0.12
        ),

      0
    );

    building.add(spire);
  }
}


/* =========================================================
   CREATE CITY
========================================================= */

function createCity() {
  if (!cityGroup) {
    return;
  }

  var quality =
    worldVisualState.quality ||
    getWorldQualityProfile();

  var buildingPalette = [
    {
      color: 0x0b1830,
      emissive: 0x06214a
    },

    {
      color: 0x1b0c35,
      emissive: 0x4b0d72
    },

    {
      color: 0x08223a,
      emissive: 0x074a66
    },

    {
      color: 0x28102e,
      emissive: 0x731448
    }
  ];

  var cyanWindowMaterial =
    createWorldGlowMaterial(
      0x4aeaff,
      0.84
    );

  var goldWindowMaterial =
    createWorldGlowMaterial(
      0xffcb52,
      0.82
    );

  var magentaWindowMaterial =
    createWorldGlowMaterial(
      0xd35cff,
      0.8
    );

  var violetWindowMaterial =
    createWorldGlowMaterial(
      0x8b5cff,
      0.76
    );

  var hologramLabels = [
    "भारत",
    "सूर्य",
    "वेग",
    "आर्यावर्त",
    "अस्त्र"
  ];

  for (
    var buildingIndex = 0;
    buildingIndex <
      quality.buildingCount;
    buildingIndex++
  ) {
    var building =
      new THREE.Group();

    var side =
      Math.random() > 0.5
        ? 1
        : -1;

    var height =
      4.5 +
      Math.random() *
      13.5;

    var width =
      1.6 +
      Math.random() *
      2.8;

    var depth =
      1.7 +
      Math.random() *
      3.4;

    var distanceFromRoad =
      7.2 +
      Math.random() *
      9.5;

    building.position.set(
      side *
        distanceFromRoad,

      0,

      -12 -
        Math.random() *
        245
    );

    var palette =
      buildingPalette[
        buildingIndex %
        buildingPalette.length
      ];

    var towerMaterial =
      createWorldStandardMaterial({
        color: palette.color,

        metalness:
          0.72 +
          Math.random() *
          0.16,

        roughness:
          0.2 +
          Math.random() *
          0.14,

        emissive:
          palette.emissive,

        emissiveIntensity:
          0.48 +
          Math.random() *
          0.32
      });

    var tower =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        towerMaterial
      );

    tower.position.y =
      height / 2;

    tower.castShadow =
      buildingIndex % 4 === 0;

    tower.receiveShadow =
      buildingIndex % 4 === 0;

    building.add(tower);

    if (
      buildingIndex % 3 === 0
    ) {
      var upperHeight =
        height * 0.34;

      var upperTower =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width * 0.64,
            upperHeight,
            depth * 0.62
          ),

          createWorldStandardMaterial({
            color: 0x122844,
            metalness: 0.78,
            roughness: 0.2,

            emissive:
              buildingIndex % 2 === 0
                ? 0x0c4961
                : 0x53216f,

            emissiveIntensity:
              0.62
          })
        );

      upperTower.position.set(
        0,
        height +
          upperHeight / 2,
        0
      );

      upperTower.castShadow =
        false;

      building.add(
        upperTower
      );

      height +=
        upperHeight;
    }

    var windowMaterialChoices = [
      cyanWindowMaterial,
      goldWindowMaterial,
      magentaWindowMaterial,
      violetWindowMaterial
    ];

    var rowCount =
      Math.min(
        quality.windowRows,

        Math.max(
          4,
          Math.floor(
            height / 1.55
          )
        )
      );

    for (
      var rowIndex = 0;
      rowIndex < rowCount;
      rowIndex++
    ) {
      var rowMaterial =
        windowMaterialChoices[
          (
            rowIndex +
            buildingIndex
          ) %
          windowMaterialChoices.length
        ];

      var frontWindow =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width * 0.72,
            0.055,
            0.035
          ),
          rowMaterial
        );

      frontWindow.position.set(
        0,

        0.9 +
          rowIndex *
          1.35,

        depth / 2 +
          0.035
      );

      building.add(
        frontWindow
      );

      var roadWindow =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.035,
            0.055,
            depth * 0.66
          ),
          rowMaterial
        );

      roadWindow.position.set(
        -side *
          (
            width / 2 +
            0.035
          ),

        0.9 +
          rowIndex *
          1.35,

        0
      );

      building.add(
        roadWindow
      );
    }

    var neonSpineMaterial =
      buildingIndex % 2 === 0
        ? cyanWindowMaterial
        : magentaWindowMaterial;

    var neonSpine =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.055,

          Math.max(
            2.5,
            height * 0.72
          ),

          0.06
        ),

        neonSpineMaterial
      );

    neonSpine.position.set(
      -side *
        (
          width / 2 +
          0.04
        ),

      Math.max(
        1.8,
        height * 0.48
      ),

      -depth * 0.18
    );

    building.add(
      neonSpine
    );

    createBuildingRoofDetails(
      building,
      width,
      height,
      goldWindowMaterial,
      cyanWindowMaterial,
      magentaWindowMaterial,
      buildingIndex
    );

    if (
      buildingIndex % 6 === 0
    ) {
      createBuildingHologram(
        building,
        side,
        width,
        height,
        depth,

        hologramLabels[
          buildingIndex %
          hologramLabels.length
        ],

        buildingIndex % 2 === 0
          ? 0x42eaff
          : 0xffbf4d,

        buildingIndex * 0.37
      );
    }

    building.userData.phase =
      buildingIndex * 0.41;

    building.userData.side =
      side;

    building.userData.baseX =
      building.position.x;

    building.userData.speedFactor =
      0.54 +
      Math.random() *
      0.22;

    building.userData.tower =
      tower;

    building.userData.baseHeight =
      height;

    buildings.push(
      building
    );

    cityGroup.add(
      building
    );
  }
}


/* =========================================================
   CREATE RAIN
========================================================= */

function createRain() {
  if (!rainGroup) {
    return;
  }

  var quality =
    worldVisualState.quality ||
    getWorldQualityProfile();

  var dropCount =
    quality.rainDropCount;

  var positions =
    new Float32Array(
      dropCount * 2 * 3
    );

  rainDrops.length = 0;

  for (
    var dropIndex = 0;
    dropIndex < dropCount;
    dropIndex++
  ) {
    rainDrops.push({
      x:
        (
          Math.random() -
          0.5
        ) * 32,

      y:
        1 +
        Math.random() *
        15,

      z:
        -Math.random() *
        150,

      length:
        0.55 +
        Math.random() *
        0.75,

      fallSpeed:
        0.26 +
        Math.random() *
        0.22,

      drift:
        -0.015 -
        Math.random() *
        0.02
    });
  }

  var geometry =
    new THREE.BufferGeometry();

  var positionAttribute =
    new THREE.BufferAttribute(
      positions,
      3
    );

  geometry.setAttribute(
    "position",
    positionAttribute
  );

  var material =
    new THREE.LineBasicMaterial({
      color: 0x8feaff,
      transparent: true,
      opacity: 0.42,

      blending:
        THREE.AdditiveBlending,

      depthWrite: false,

      toneMapped: false
    });

  var rainMesh =
    new THREE.LineSegments(
      geometry,
      material
    );

  rainMesh.frustumCulled =
    false;

  worldVisualState.rainMesh =
    rainMesh;

  worldVisualState.rainPositionAttribute =
    positionAttribute;

  worldVisualState.rainMaterial =
    material;

  updateRainGeometry();

  rainGroup.add(
    rainMesh
  );
}


function updateRainGeometry() {
  var attribute =
    worldVisualState
      .rainPositionAttribute;

  if (!attribute) {
    return;
  }

  var array =
    attribute.array;

  for (
    var dropIndex = 0;
    dropIndex <
      rainDrops.length;
    dropIndex++
  ) {
    var drop =
      rainDrops[
        dropIndex
      ];

    var arrayIndex =
      dropIndex * 6;

    array[arrayIndex] =
      drop.x;

    array[arrayIndex + 1] =
      drop.y;

    array[arrayIndex + 2] =
      drop.z;

    array[arrayIndex + 3] =
      drop.x +
      drop.drift * 6;

    array[arrayIndex + 4] =
      drop.y -
      drop.length;

    array[arrayIndex + 5] =
      drop.z + 0.26;
  }

  attribute.needsUpdate =
    true;
}


/* =========================================================
   SKY HELPERS
========================================================= */

function createWorldStarField() {
  var quality =
    worldVisualState.quality ||
    getWorldQualityProfile();

  var positions =
    new Float32Array(
      quality.starCount * 3
    );

  for (
    var starIndex = 0;
    starIndex <
      quality.starCount;
    starIndex++
  ) {
    positions[
      starIndex * 3
    ] =
      (
        Math.random() -
        0.5
      ) * 180;

    positions[
      starIndex * 3 + 1
    ] =
      6 +
      Math.random() *
      58;

    positions[
      starIndex * 3 + 2
    ] =
      -25 -
      Math.random() *
      310;
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
      color: 0xbfefff,
      size: 0.16,
      transparent: true,
      opacity: 0.72,

      blending:
        THREE.AdditiveBlending,

      depthWrite: false,
      sizeAttenuation: true,
      toneMapped: false
    });

  var stars =
    new THREE.Points(
      geometry,
      material
    );

  worldVisualState.starField =
    stars;

  cityGroup.add(
    stars
  );
}


function createHorizonSuryaMandala() {
  var group =
    new THREE.Group();

  group.position.set(
    0,
    18,
    -178
  );

  var glowSprite =
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map:
          createWorldGlowTexture(),

        color: 0xffa726,

        transparent: true,

        opacity: 0.82,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        toneMapped: false
      })
    );

  glowSprite.scale.set(
    28,
    28,
    1
  );

  group.add(
    glowSprite
  );

  var core =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.7,
        32,
        32
      ),

      new THREE.MeshBasicMaterial({
        color: 0xffc24b,
        toneMapped: false
      })
    );

  group.add(core);

  var ringColors = [
    0xffc24b,
    0xff7a22,
    0x58ecff
  ];

  var ringSizes = [
    4.2,
    5.6,
    7.1
  ];

  for (
    var ringIndex = 0;
    ringIndex <
      ringSizes.length;
    ringIndex++
  ) {
    var ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          ringSizes[
            ringIndex
          ],
          0.07,
          12,
          96
        ),

        createWorldGlowMaterial(
          ringColors[
            ringIndex
          ],

          0.86 -
            ringIndex *
            0.12
        )
      );

    ring.userData.spinDirection =
      ringIndex % 2 === 0
        ? 1
        : -1;

    ring.userData.spinSpeed =
      0.08 +
      ringIndex *
      0.035;

    worldVisualState
      .horizonRings
      .push(ring);

    group.add(ring);
  }

  for (
    var spokeIndex = 0;
    spokeIndex < 16;
    spokeIndex++
  ) {
    var spoke =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.065,
          5.8,
          0.05
        ),

        createWorldGlowMaterial(
          spokeIndex % 2 === 0
            ? 0xffc24b
            : 0xff7a22,

          0.7
        )
      );

    spoke.position.z =
      -0.05;

    spoke.rotation.z =
      (
        Math.PI * 2 *
        spokeIndex
      ) / 16;

    group.add(spoke);
  }

  var isMobile =
    worldVisualState.quality &&
    worldVisualState.quality.mobile;

  var horizonLight =
    new THREE.PointLight(
      0xff8a24,

      isMobile
        ? 1.25
        : 1.85,

      150
    );

  horizonLight.position.set(
    0,
    0,
    8
  );

  group.add(
    horizonLight
  );

  worldVisualState.horizonSurya =
    group;

  worldVisualState.horizonCore =
    core;

  worldVisualState.horizonGlow =
    glowSprite;

  cityGroup.add(
    group
  );
}


/* =========================================================
   CREATE SKY SYMBOLS
========================================================= */

function createSkySymbols() {
  if (!cityGroup) {
    return;
  }

  createWorldStarField();

  createHorizonSuryaMandala();

  var quality =
    worldVisualState.quality ||
    getWorldQualityProfile();

  var goldMaterial =
    createWorldGlowMaterial(
      0xffca52,
      0.72
    );

  var cyanMaterial =
    createWorldGlowMaterial(
      0x46eaff,
      0.66
    );

  var magentaMaterial =
    createWorldGlowMaterial(
      0xd45cff,
      0.58
    );

  for (
    var symbolIndex = 0;
    symbolIndex <
      quality.skySymbolCount;
    symbolIndex++
  ) {
    var symbol =
      new THREE.Group();

    var outer =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.62 +
            Math.random() *
            0.75,

          0.028,
          10,
          50
        ),

        symbolIndex % 3 === 0
          ? goldMaterial
          : symbolIndex % 3 === 1
            ? cyanMaterial
            : magentaMaterial
      );

    var inner =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.28 +
            Math.random() *
            0.25,

          0.018,
          8,
          36
        ),

        symbolIndex % 2 === 0
          ? cyanMaterial
          : goldMaterial
      );

    symbol.add(
      outer,
      inner
    );

    symbol.position.set(
      (
        Math.random() -
        0.5
      ) * 26,

      6 +
        Math.random() *
        10,

      -25 -
        symbolIndex *
        17
    );

    symbol.rotation.x =
      Math.random() *
      0.25;

    symbol.rotation.y =
      Math.random() *
      0.55;

    symbol.userData.phase =
      symbolIndex * 0.7;

    symbol.userData.spin =
      symbolIndex % 2 === 0
        ? 1
        : -1;

    symbol.userData.baseY =
      symbol.position.y;

    worldVisualState
      .skySymbols
      .push(symbol);

    cityGroup.add(
      symbol
    );
  }
}


/* =========================================================
   ANIMATE WORLD
========================================================= */

function updateMovingWorld() {
  var currentSpeed =
    getWorldSpeed();

  var time =
    (
      typeof performance !==
        "undefined" &&
      typeof performance.now ===
        "function"
    )
      ? performance.now() *
        0.001
      : Date.now() *
        0.001;

  var loopDistance =
    getWorldRoadLoopDistance();

  var tileDepth =
    getWorldTileDepth();


  /* ROAD MOVEMENT */

  for (
    var tileIndex = 0;
    tileIndex <
      roadTiles.length;
    tileIndex++
  ) {
    var tile =
      roadTiles[
        tileIndex
      ];

    tile.position.z +=
      currentSpeed;

    if (
      tile.position.z > 12
    ) {
      tile.position.z -=
        loopDistance;
    }
  }


  /* ROAD SCANNERS */

  for (
    var scannerIndex = 0;
    scannerIndex <
      worldVisualState
        .roadScanners
        .length;
    scannerIndex++
  ) {
    var scanner =
      worldVisualState
        .roadScanners[
          scannerIndex
        ];

    var scannerPhase =
      scanner.userData.phase ||
      0;

    scanner.material.opacity =
      0.24 +
      Math.abs(
        Math.sin(
          time * 2.8 +
          scannerPhase
        )
      ) * 0.48;

    scanner.position.z =
      Math.sin(
        time * 1.6 +
        scannerPhase
      ) *
      tileDepth *
      0.24;
  }


  /* ROAD MANDALAS */

  for (
    var mandalaIndex = 0;
    mandalaIndex <
      worldVisualState
        .roadMandalaParts
        .length;
    mandalaIndex++
  ) {
    var mandala =
      worldVisualState
        .roadMandalaParts[
          mandalaIndex
        ];

    mandala.rotation.y +=
      0.008;

    mandala.scale.setScalar(
      0.94 +
      Math.sin(
        time * 2.1 +
        mandala.userData.phase
      ) * 0.06
    );
  }


  /* ENERGY ARCHES */

  for (
    var archIndex = 0;
    archIndex <
      worldVisualState
        .roadArchLights
        .length;
    archIndex++
  ) {
    var arch =
      worldVisualState
        .roadArchLights[
          archIndex
        ];

    if (
      arch.userData.crown
    ) {
      arch.userData.crown
        .rotation.z +=
        0.012;

      arch.userData.crown
        .scale
        .setScalar(
          0.92 +
          Math.sin(
            time * 2.4 +
            arch.userData.phase
          ) * 0.08
        );
    }
  }


  /* BUILDINGS */

  for (
    var buildingIndex = 0;
    buildingIndex <
      buildings.length;
    buildingIndex++
  ) {
    var building =
      buildings[
        buildingIndex
      ];

    var buildingPhase =
      building.userData.phase ||
      0;

    var speedFactor =
      building.userData
        .speedFactor ||
      0.65;

    building.position.z +=
      currentSpeed *
      speedFactor;

    if (
      building.position.z >
      34
    ) {
      building.position.z -=
        260;

      building.position.x =
        building.userData.baseX +
        (
          Math.random() -
          0.5
        ) * 1.2;
    }

    if (
      building.userData.topRing
    ) {
      building.userData
        .topRing
        .rotation.z +=
        0.004 +
        buildingIndex %
          3 *
          0.0015;
    }

    if (
      building.userData.beacon
    ) {
      var beaconPulse =
        0.82 +
        Math.sin(
          time * 3.4 +
          buildingPhase
        ) * 0.18;

      building.userData
        .beacon
        .scale
        .setScalar(
          beaconPulse
        );
    }

    if (
      building.userData.hologram
    ) {
      var hologram =
        building.userData
          .hologram;

      hologram.material.opacity =
        0.46 +
        Math.abs(
          Math.sin(
            time * 1.7 +
            hologram.userData.phase
          )
        ) * 0.42;

      hologram.position.y +=
        Math.sin(
          time * 1.35 +
          hologram.userData.phase
        ) * 0.0015;
    }

    if (
      building.userData.tower &&
      building.userData.tower
        .material
    ) {
      building.userData
        .tower
        .material
        .emissiveIntensity =
        0.48 +
        Math.abs(
          Math.sin(
            time * 0.72 +
            buildingPhase
          )
        ) * 0.28;
    }
  }


  /* RAIN */

  for (
    var dropIndex = 0;
    dropIndex <
      rainDrops.length;
    dropIndex++
  ) {
    var drop =
      rainDrops[
        dropIndex
      ];

    drop.z +=
      currentSpeed *
      2.15 +
      0.08;

    drop.y -=
      drop.fallSpeed;

    drop.x +=
      drop.drift;

    if (
      drop.y < -0.5 ||
      drop.z > 14 ||
      Math.abs(
        drop.x
      ) > 19
    ) {
      drop.x =
        (
          Math.random() -
          0.5
        ) * 32;

      drop.y =
        9 +
        Math.random() *
        9;

      drop.z =
        -110 -
        Math.random() *
        70;

      drop.length =
        0.55 +
        Math.random() *
        0.75;

      drop.fallSpeed =
        0.26 +
        Math.random() *
        0.22;

      drop.drift =
        -0.015 -
        Math.random() *
        0.02;
    }
  }

  updateRainGeometry();

  if (
    worldVisualState.rainMaterial
  ) {
    worldVisualState
      .rainMaterial
      .opacity =
      0.32 +
      Math.min(
        0.18,
        currentSpeed *
        0.12
      );
  }


  /* SURYA HORIZON */

  if (
    worldVisualState.horizonSurya
  ) {
    worldVisualState
      .horizonSurya
      .position.y =
      18 +
      Math.sin(
        time * 0.55
      ) * 0.34;

    worldVisualState
      .horizonSurya
      .rotation.z =
      Math.sin(
        time * 0.22
      ) * 0.045;
  }

  if (
    worldVisualState.horizonCore
  ) {
    var corePulse =
      1 +
      Math.sin(
        time * 2.25
      ) * 0.07;

    worldVisualState
      .horizonCore
      .scale
      .setScalar(
        corePulse
      );
  }

  if (
    worldVisualState.horizonGlow
  ) {
    var glowPulse =
      27 +
      Math.sin(
        time * 1.35
      ) * 2.2;

    worldVisualState
      .horizonGlow
      .scale
      .set(
        glowPulse,
        glowPulse,
        1
      );

    worldVisualState
      .horizonGlow
      .material
      .opacity =
      0.72 +
      Math.sin(
        time * 1.8
      ) * 0.1;
  }

  for (
    var ringIndex = 0;
    ringIndex <
      worldVisualState
        .horizonRings
        .length;
    ringIndex++
  ) {
    var ring =
      worldVisualState
        .horizonRings[
          ringIndex
        ];

    ring.rotation.z +=
      ring.userData.spinSpeed *
      ring.userData.spinDirection *
      0.016;
  }


  /* FLOATING SKY SYMBOLS */

  for (
    var symbolIndex = 0;
    symbolIndex <
      worldVisualState
        .skySymbols
        .length;
    symbolIndex++
  ) {
    var symbol =
      worldVisualState
        .skySymbols[
          symbolIndex
        ];

    symbol.rotation.z +=
      0.0035 *
      symbol.userData.spin;

    symbol.rotation.y +=
      0.0018 *
      symbol.userData.spin;

    symbol.position.y =
      symbol.userData.baseY +
      Math.sin(
        time * 0.72 +
        symbol.userData.phase
      ) * 0.35;

    symbol.position.z +=
      currentSpeed *
      0.13;

    if (
      symbol.position.z > 22
    ) {
      symbol.position.z -=
        250;
    }
  }


  /* STAR FIELD */

  if (
    worldVisualState.starField
  ) {
    worldVisualState
      .starField
      .rotation.y +=
      0.00008;
  }
}
