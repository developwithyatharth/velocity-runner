/* =========================================================
   world.js — Stylized-realistic 3D Neo Bharat environment
   Replace the complete old world.js with this file.
========================================================= */

var realisticWorld = {
  materials: null,
  signs: [],
  plants: [],
  traffic: [],
  distantBuildings: [],
  rainMesh: null,
  rainData: [],
  landmark: null
};

function worldNumber(value, fallback) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

function worldSpeed() {
  return Math.max(
    0,
    worldNumber(
      typeof speed !== "undefined"
        ? speed
        : 0.34,
      0.34
    )
  );
}

function worldTileDepth() {
  return Math.max(
    1,
    worldNumber(
      typeof TILE_DEPTH !== "undefined"
        ? TILE_DEPTH
        : 8,
      8
    )
  );
}

function worldTileCount() {
  return Math.max(
    1,
    Math.floor(
      worldNumber(
        typeof ROAD_TILE_COUNT !== "undefined"
          ? ROAD_TILE_COUNT
          : 34,
        34
      )
    )
  );
}

function worldLoopDistance() {
  return Math.max(
    1,
    worldNumber(
      typeof ROAD_LOOP_DISTANCE !== "undefined"
        ? ROAD_LOOP_DISTANCE
        : worldTileCount() *
          worldTileDepth(),

      worldTileCount() *
        worldTileDepth()
    )
  );
}

function worldMobile() {
  return window.innerWidth <= 720;
}


/* =========================================================
   TEXTURE HELPERS
========================================================= */

function makeCanvasTexture(
  canvas,
  repeatX,
  repeatY
) {
  var texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.wrapS =
    THREE.RepeatWrapping;

  texture.wrapT =
    THREE.RepeatWrapping;

  texture.repeat.set(
    repeatX || 1,
    repeatY || 1
  );

  texture.minFilter =
    THREE.LinearMipmapLinearFilter;

  texture.magFilter =
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


function makeAsphaltTexture() {
  var canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 512;
  canvas.height = 512;

  var context =
    canvas.getContext("2d");

  context.fillStyle =
    "#3c3f42";

  context.fillRect(
    0,
    0,
    512,
    512
  );

  for (
    var index = 0;
    index < 6000;
    index++
  ) {
    var shade =
      38 +
      Math.floor(
        Math.random() * 45
      );

    context.fillStyle =
      "rgba(" +
      shade +
      "," +
      shade +
      "," +
      shade +
      "," +
      (
        0.04 +
        Math.random() *
        0.09
      ) +
      ")";

    var size =
      0.4 +
      Math.random() *
      1.8;

    context.fillRect(
      Math.random() * 512,
      Math.random() * 512,
      size,
      size
    );
  }

  context.strokeStyle =
    "rgba(15,16,17,0.23)";

  context.lineWidth = 2;

  for (
    var crack = 0;
    crack < 8;
    crack++
  ) {
    context.beginPath();

    var x =
      Math.random() * 512;

    var y =
      Math.random() * 512;

    context.moveTo(
      x,
      y
    );

    for (
      var segment = 0;
      segment < 4;
      segment++
    ) {
      x +=
        (
          Math.random() -
          0.5
        ) * 36;

      y +=
        16 +
        Math.random() *
        28;

      context.lineTo(
        x,
        y
      );
    }

    context.stroke();
  }

  return makeCanvasTexture(
    canvas,
    2,
    4
  );
}


function makeConcreteTexture() {
  var canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 256;
  canvas.height = 256;

  var context =
    canvas.getContext("2d");

  context.fillStyle =
    "#aaa094";

  context.fillRect(
    0,
    0,
    256,
    256
  );

  for (
    var index = 0;
    index < 1600;
    index++
  ) {
    var shade =
      120 +
      Math.floor(
        Math.random() * 55
      );

    context.fillStyle =
      "rgba(" +
      shade +
      "," +
      (
        shade - 5
      ) +
      "," +
      (
        shade - 10
      ) +
      ",0.08)";

    context.fillRect(
      Math.random() * 256,
      Math.random() * 256,
      1.2,
      1.2
    );
  }

  context.strokeStyle =
    "rgba(70,65,56,0.18)";

  context.lineWidth = 2;

  for (
    var line = 0;
    line <= 256;
    line += 64
  ) {
    context.beginPath();

    context.moveTo(
      line,
      0
    );

    context.lineTo(
      line,
      256
    );

    context.stroke();

    context.beginPath();

    context.moveTo(
      0,
      line
    );

    context.lineTo(
      256,
      line
    );

    context.stroke();
  }

  return makeCanvasTexture(
    canvas,
    2,
    4
  );
}


function makeFacadeTexture(
  baseColor,
  windowColor,
  trimColor
) {
  var canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 256;
  canvas.height = 512;

  var context =
    canvas.getContext("2d");

  context.fillStyle =
    baseColor;

  context.fillRect(
    0,
    0,
    256,
    512
  );

  context.fillStyle =
    trimColor;

  for (
    var band = 0;
    band < 512;
    band += 96
  ) {
    context.fillRect(
      0,
      band,
      256,
      6
    );
  }

  for (
    var row = 0;
    row < 9;
    row++
  ) {
    for (
      var column = 0;
      column < 4;
      column++
    ) {
      var x =
        18 +
        column * 60;

      var y =
        20 +
        row * 53;

      context.fillStyle =
        Math.random() > 0.25
          ? windowColor
          : "#2a3034";

      context.fillRect(
        x,
        y,
        38,
        29
      );

      context.strokeStyle =
        "rgba(255,255,255,0.17)";

      context.strokeRect(
        x,
        y,
        38,
        29
      );
    }
  }

  return makeCanvasTexture(
    canvas,
    1,
    1
  );
}


function makeSignTexture(
  text,
  background,
  foreground
) {
  var canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 512;
  canvas.height = 180;

  var context =
    canvas.getContext("2d");

  context.fillStyle =
    background;

  context.fillRect(
    0,
    0,
    512,
    180
  );

  context.strokeStyle =
    "rgba(255,255,255,0.45)";

  context.lineWidth = 8;

  context.strokeRect(
    10,
    10,
    492,
    160
  );

  context.fillStyle =
    foreground;

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.font =
    '800 64px "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif';

  context.fillText(
    text,
    256,
    82
  );

  context.font =
    '700 20px "Segoe UI", Arial, sans-serif';

  context.fillText(
    "NEO BHARAT DISTRICT",
    256,
    140
  );

  return makeCanvasTexture(
    canvas,
    1,
    1
  );
}


/* =========================================================
   MATERIAL HELPERS
========================================================= */

function standardMaterial(
  options
) {
  return new THREE.MeshStandardMaterial({
    color:
      options.color ===
      undefined
        ? 0xffffff
        : options.color,

    map:
      options.map || null,

    roughness:
      worldNumber(
        options.roughness,
        0.75
      ),

    metalness:
      worldNumber(
        options.metalness,
        0.05
      ),

    emissive:
      options.emissive ===
      undefined
        ? 0x000000
        : options.emissive,

    emissiveIntensity:
      worldNumber(
        options.emissiveIntensity,
        0
      ),

    transparent:
      Boolean(
        options.transparent
      ),

    opacity:
      options.opacity ===
      undefined
        ? 1
        : options.opacity,

    side:
      options.side ||
      THREE.FrontSide
  });
}


function createWorldMaterials() {
  var asphaltTexture =
    makeAsphaltTexture();

  var concreteTexture =
    makeConcreteTexture();

  var facadeTextures = [
    makeFacadeTexture(
      "#92745f",
      "#edc88c",
      "#6c5444"
    ),

    makeFacadeTexture(
      "#617d8a",
      "#b9dfed",
      "#425866"
    ),

    makeFacadeTexture(
      "#896b7d",
      "#edb7cf",
      "#634d5d"
    ),

    makeFacadeTexture(
      "#9a8760",
      "#f0cf91",
      "#716547"
    ),

    makeFacadeTexture(
      "#60776e",
      "#bfd9cb",
      "#44584f"
    )
  ];

  realisticWorld.materials = {
    asphalt:
      standardMaterial({
        color: 0x4a4d50,
        map: asphaltTexture,
        roughness: 0.95,
        metalness: 0.01
      }),

    sidewalk:
      standardMaterial({
        color: 0xb1a797,
        map: concreteTexture,
        roughness: 0.91
      }),

    curbLight:
      standardMaterial({
        color: 0xe7d8bc,
        roughness: 0.88
      }),

    curbDark:
      standardMaterial({
        color: 0x704c39,
        roughness: 0.9
      }),

    lane:
      standardMaterial({
        color: 0xf3efe4,
        roughness: 0.62
      }),

    center:
      standardMaterial({
        color: 0xe5b34d,
        roughness: 0.62
      }),

    metal:
      standardMaterial({
        color: 0x555e65,
        roughness: 0.47,
        metalness: 0.58
      }),

    darkMetal:
      standardMaterial({
        color: 0x34393d,
        roughness: 0.45,
        metalness: 0.62
      }),

    lamp:
      standardMaterial({
        color: 0xffe0a0,
        roughness: 0.3,
        emissive: 0xffb45b,
        emissiveIntensity: 0.45
      }),

    glass:
      standardMaterial({
        color: 0x718f9f,
        roughness: 0.18,
        metalness: 0.12,
        transparent: true,
        opacity: 0.7
      }),

    roof:
      standardMaterial({
        color: 0x595655,
        roughness: 0.8,
        metalness: 0.08
      }),

    terracotta:
      standardMaterial({
        color: 0xa55d3d,
        roughness: 0.83
      }),

    plant:
      standardMaterial({
        color: 0x496c46,
        roughness: 0.92
      }),

    tire:
      standardMaterial({
        color: 0x191a1b,
        roughness: 0.94
      }),

    facades:
      facadeTextures.map(
        function (texture) {
          return standardMaterial({
            color: 0xffffff,
            map: texture,
            roughness: 0.79,
            metalness: 0.03
          });
        }
      )
  };
}


/* =========================================================
   ROAD PROPS
========================================================= */

function addStreetLamp(
  tile,
  side,
  zPosition
) {
  var materials =
    realisticWorld.materials;

  var group =
    new THREE.Group();

  var pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.075,
        3.4,
        10
      ),
      materials.darkMetal
    );

  pole.position.y =
    1.7;

  pole.castShadow =
    true;

  var arm =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.74,
        0.07,
        0.07
      ),
      materials.darkMetal
    );

  arm.position.set(
    -side * 0.34,
    3.35,
    0
  );

  var bulb =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.24,
        0.1,
        0.18
      ),
      materials.lamp
    );

  bulb.position.set(
    -side * 0.72,
    3.31,
    0
  );

  group.add(
    pole,
    arm,
    bulb
  );

  group.position.set(
    side * 6.65,
    0.2,
    zPosition
  );

  tile.add(group);
}


function addPlanter(
  tile,
  side,
  zPosition
) {
  var materials =
    realisticWorld.materials;

  var group =
    new THREE.Group();

  var pot =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.32,
        0.38,
        0.42,
        10
      ),
      materials.terracotta
    );

  pot.position.y =
    0.26;

  var leaves =
    new THREE.Mesh(
      new THREE.DodecahedronGeometry(
        0.38,
        0
      ),
      materials.plant
    );

  leaves.position.y =
    0.73;

  leaves.scale.set(
    0.9,
    1.18,
    0.9
  );

  leaves.castShadow =
    true;

  group.add(
    pot,
    leaves
  );

  group.position.set(
    side * 6.75,
    0.2,
    zPosition
  );

  group.userData.leaves =
    leaves;

  group.userData.phase =
    Math.random() *
    Math.PI *
    2;

  tile.add(group);

  realisticWorld.plants.push(
    group
  );
}


/* =========================================================
   CREATE ROAD
========================================================= */

function createRoad() {
  if (!roadGroup) {
    return;
  }

  realisticWorld.signs = [];
  realisticWorld.plants = [];
  realisticWorld.traffic = [];
  realisticWorld.distantBuildings = [];
  realisticWorld.rainMesh = null;
  realisticWorld.rainData = [];
  realisticWorld.landmark = null;

  createWorldMaterials();

  roadTiles.length = 0;

  var materials =
    realisticWorld.materials;

  var tileCount =
    worldTileCount();

  var tileDepth =
    worldTileDepth();

  for (
    var tileIndex = 0;
    tileIndex < tileCount;
    tileIndex++
  ) {
    var tile =
      new THREE.Group();

    tile.position.z =
      -tileIndex *
      tileDepth;

    var road =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          11.5,
          0.28,
          tileDepth
        ),
        materials.asphalt
      );

    road.position.y =
      -0.14;

    road.receiveShadow =
      true;

    var leftWalk =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.7,
          0.34,
          tileDepth
        ),
        materials.sidewalk
      );

    leftWalk.position.set(
      -6.6,
      0.02,
      0
    );

    leftWalk.receiveShadow =
      true;

    var rightWalk =
      leftWalk.clone();

    rightWalk.position.x =
      6.6;

    var leftCurb =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.3,
          0.22,
          tileDepth
        ),

        tileIndex % 2 === 0
          ? materials.curbLight
          : materials.curbDark
      );

    leftCurb.position.set(
      -5.73,
      0.08,
      0
    );

    var rightCurb =
      leftCurb.clone();

    rightCurb.position.x =
      5.73;

    var dividerLeft =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.09,
          0.018,
          Math.min(
            3.2,
            tileDepth * 0.5
          )
        ),
        materials.lane
      );

    dividerLeft.position.set(
      -1.5,
      0.155,
      0
    );

    var dividerRight =
      dividerLeft.clone();

    dividerRight.position.x =
      1.5;

    var centerMark =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.11,
          0.02,
          1.8
        ),
        materials.center
      );

    centerMark.position.set(
      0,
      0.158,
      tileDepth * 0.23
    );

    tile.add(
      road,
      leftWalk,
      rightWalk,
      leftCurb,
      rightCurb,
      dividerLeft,
      dividerRight,
      centerMark
    );

    if (
      tileIndex % 3 === 0
    ) {
      addStreetLamp(
        tile,

        tileIndex % 2 === 0
          ? -1
          : 1,

        -tileDepth * 0.12
      );
    }

    if (
      !worldMobile() &&
      tileIndex % 4 === 1
    ) {
      addPlanter(
        tile,

        tileIndex % 2 === 0
          ? -1
          : 1,

        tileDepth * 0.18
      );
    }

    roadTiles.push(tile);

    roadGroup.add(tile);
  }
}


/* =========================================================
   BUILDING SIGN
========================================================= */

function addBuildingSign(
  building,
  side,
  width,
  height,
  index
) {
  var labels = [
    "भारत",
    "सूर्य मार्ग",
    "आर्यावर्त",
    "नव नगर",
    "वेग केंद्र"
  ];

  var palettes = [
    [
      "#8c3f2d",
      "#ffe6a4"
    ],

    [
      "#274e5c",
      "#d4f1ef"
    ],

    [
      "#5e3d65",
      "#f3d5ef"
    ]
  ];

  var palette =
    palettes[
      index %
      palettes.length
    ];

  var texture =
    makeSignTexture(
      labels[
        index %
        labels.length
      ],
      palette[0],
      palette[1]
    );

  var material =
    standardMaterial({
      color: 0xffffff,
      map: texture,
      roughness: 0.5,
      emissive: 0x3a2419,
      emissiveIntensity: 0.18,
      side: THREE.DoubleSide
    });

  var sign =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        Math.min(
          3.6,
          width * 1.2
        ),
        1.2
      ),
      material
    );

  sign.position.set(
    -side *
      (
        width / 2 +
        0.035
      ),

    Math.max(
      2.2,
      height * 0.56
    ),

    0
  );

  sign.rotation.y =
    side > 0
      ? Math.PI / 2
      : -Math.PI / 2;

  sign.userData.phase =
    index * 0.73;

  building.add(sign);

  realisticWorld.signs.push(
    sign
  );
}


/* =========================================================
   CREATE BUILDING
========================================================= */

function createBuilding(
  index,
  distant
) {
  var materials =
    realisticWorld.materials;

  var building =
    new THREE.Group();

  var side =
    Math.random() > 0.5
      ? 1
      : -1;

  var height =
    distant
      ? 8 +
        Math.random() *
        16
      : 5 +
        Math.random() *
        12;

  var width =
    distant
      ? 2 +
        Math.random() *
        4
      : 1.8 +
        Math.random() *
        3.2;

  var depth =
    distant
      ? 2 +
        Math.random() *
        4
      : 1.8 +
        Math.random() *
        3.4;

  var roadDistance =
    distant
      ? 18 +
        Math.random() *
        18
      : 8.2 +
        Math.random() *
        8.5;

  var facade =
    materials.facades[
      index %
      materials.facades.length
    ];

  var body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      facade
    );

  body.position.y =
    height / 2;

  body.receiveShadow =
    true;

  body.castShadow =
    !distant &&
    index <
      (
        worldMobile()
          ? 4
          : 10
      );

  building.add(body);

  if (
    !distant &&
    index % 3 === 0
  ) {
    var upperHeight =
      height * 0.32;

    var upper =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width * 0.66,
          upperHeight,
          depth * 0.68
        ),
        facade
      );

    upper.position.y =
      height +
      upperHeight / 2;

    building.add(upper);

    height +=
      upperHeight;
  }

  if (
    !distant &&
    index % 4 === 1
  ) {
    var balcony =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width * 0.82,
          0.1,
          depth * 0.32
        ),
        materials.roof
      );

    balcony.position.set(
      0,
      height * 0.55,
      -depth * 0.62
    );

    building.add(
      balcony
    );
  }

  if (!distant) {
    var tank =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.3,
          0.34,
          0.62,
          12
        ),

        index % 2 === 0
          ? materials.roof
          : materials.terracotta
      );

    tank.position.set(
      -width * 0.2,
      height + 0.34,
      depth * 0.05
    );

    var solarPanel =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width * 0.46,
          0.06,
          depth * 0.34
        ),
        materials.glass
      );

    solarPanel.position.set(
      width * 0.18,
      height + 0.26,
      -depth * 0.08
    );

    solarPanel.rotation.x =
      -0.2;

    building.add(
      tank,
      solarPanel
    );
  }

  if (
    !distant &&
    index % 6 === 0
  ) {
    addBuildingSign(
      building,
      side,
      width,
      height,
      index
    );
  }

  building.position.set(
    side * roadDistance,

    0,

    distant
      ? -55 -
        Math.random() *
        245
      : -14 -
        Math.random() *
        250
  );

  building.userData.baseX =
    building.position.x;

  building.userData.speedFactor =
    distant
      ? 0.28 +
        Math.random() *
        0.1
      : 0.5 +
        Math.random() *
        0.2;

  return building;
}


/* =========================================================
   SERVICE TRAFFIC
========================================================= */

function createTrafficVehicle(
  index
) {
  var materials =
    realisticWorld.materials;

  var colors = [
    0xc65c3e,
    0x3e7188,
    0xd0a44b,
    0x6d7d59,
    0x8a5a79
  ];

  var bodyMaterial =
    standardMaterial({
      color:
        colors[
          index %
          colors.length
        ],

      roughness: 0.5,
      metalness: 0.22
    });

  var vehicle =
    new THREE.Group();

  var body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.05,
        0.42,
        1.8
      ),
      bodyMaterial
    );

  body.position.y =
    0.45;

  body.castShadow =
    true;

  var cabin =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.8,
        0.42,
        0.82
      ),
      materials.glass
    );

  cabin.position.set(
    0,
    0.82,
    -0.08
  );

  vehicle.add(
    body,
    cabin
  );

  for (
    var wheelIndex = 0;
    wheelIndex < 4;
    wheelIndex++
  ) {
    var wheel =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.17,
          0.17,
          0.12,
          12
        ),
        materials.tire
      );

    wheel.rotation.z =
      Math.PI / 2;

    wheel.position.set(
      wheelIndex % 2 === 0
        ? -0.56
        : 0.56,

      0.24,

      wheelIndex < 2
        ? -0.55
        : 0.55
    );

    vehicle.add(wheel);
  }

  var side =
    index % 2 === 0
      ? -1
      : 1;

  vehicle.position.set(
    side *
      (
        8.5 +
        Math.random() *
        1.4
      ),

    0,

    -30 -
    Math.random() *
    230
  );

  vehicle.rotation.y =
    side < 0
      ? Math.PI
      : 0;

  vehicle.userData.speedFactor =
    0.22 +
    Math.random() *
    0.34;

  vehicle.userData.phase =
    index * 0.8;

  return vehicle;
}


/* =========================================================
   DISTANT LANDMARK
========================================================= */

function createLandmark() {
  var materials =
    realisticWorld.materials;

  var landmark =
    new THREE.Group();

  var base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        18,
        1.3,
        8
      ),
      materials.terracotta
    );

  base.position.y =
    0.65;

  landmark.add(base);

  for (
    var level = 0;
    level < 5;
    level++
  ) {
    var block =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          10 -
          level * 1.35,

          2.3,

          4.5 -
          level * 0.45
        ),

        level % 2 === 0
          ? materials.curbLight
          : materials.terracotta
      );

    block.position.y =
      2 +
      level * 2;

    landmark.add(
      block
    );
  }

  var crown =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        2.2,
        4.2,
        4
      ),
      materials.terracotta
    );

  crown.position.y =
    13.2;

  crown.rotation.y =
    Math.PI / 4;

  var flag =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        1.2,
        0.55
      ),
      materials.terracotta
    );

  flag.position.set(
    0.62,
    17.25,
    0
  );

  landmark.add(
    crown,
    flag
  );

  landmark.position.set(
    0,
    0,
    -190
  );

  landmark.scale.set(
    1.2,
    1.2,
    1.2
  );

  landmark.userData.flag =
    flag;

  cityGroup.add(
    landmark
  );

  realisticWorld.landmark =
    landmark;
}


/* =========================================================
   CREATE CITY
========================================================= */

function createCity() {
  if (!cityGroup) {
    return;
  }

  buildings.length = 0;

  var foregroundCount =
    worldMobile()
      ? 32
      : 54;

  var distantCount =
    worldMobile()
      ? 16
      : 28;

  var trafficCount =
    worldMobile()
      ? 4
      : 8;

  for (
    var index = 0;
    index < foregroundCount;
    index++
  ) {
    var building =
      createBuilding(
        index,
        false
      );

    buildings.push(
      building
    );

    cityGroup.add(
      building
    );
  }

  for (
    var distantIndex = 0;
    distantIndex < distantCount;
    distantIndex++
  ) {
    var distantBuilding =
      createBuilding(
        distantIndex + 100,
        true
      );

    realisticWorld
      .distantBuildings
      .push(
        distantBuilding
      );

    cityGroup.add(
      distantBuilding
    );
  }

  for (
    var trafficIndex = 0;
    trafficIndex < trafficCount;
    trafficIndex++
  ) {
    var vehicle =
      createTrafficVehicle(
        trafficIndex
      );

    realisticWorld
      .traffic
      .push(
        vehicle
      );

    cityGroup.add(
      vehicle
    );
  }

  createLandmark();
}


/* =========================================================
   OPTIONAL RAIN
========================================================= */

function createRain() {
  if (!rainGroup) {
    return;
  }

  var count =
    worldMobile()
      ? 80
      : 150;

  var positions =
    new Float32Array(
      count * 6
    );

  realisticWorld.rainData = [];
  rainDrops.length = 0;

  for (
    var index = 0;
    index < count;
    index++
  ) {
    var drop = {
      x:
        (
          Math.random() -
          0.5
        ) * 30,

      y:
        2 +
        Math.random() *
        14,

      z:
        -Math.random() *
        150,

      length:
        0.35 +
        Math.random() *
        0.55,

      fall:
        0.2 +
        Math.random() *
        0.22
    };

    realisticWorld
      .rainData
      .push(drop);

    rainDrops.push(drop);
  }

  var geometry =
    new THREE.BufferGeometry();

  var attribute =
    new THREE.BufferAttribute(
      positions,
      3
    );

  geometry.setAttribute(
    "position",
    attribute
  );

  var material =
    new THREE.LineBasicMaterial({
      color: 0xc7d5dc,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    });

  realisticWorld.rainMesh =
    new THREE.LineSegments(
      geometry,
      material
    );

  realisticWorld
    .rainMesh
    .userData
    .positionAttribute =
    attribute;

  realisticWorld
    .rainMesh
    .frustumCulled =
    false;

  updateRainGeometry();

  rainGroup.add(
    realisticWorld.rainMesh
  );
}


function updateRainGeometry() {
  if (
    !realisticWorld.rainMesh
  ) {
    return;
  }

  var positions =
    realisticWorld
      .rainMesh
      .userData
      .positionAttribute
      .array;

  for (
    var index = 0;
    index <
      realisticWorld
        .rainData
        .length;
    index++
  ) {
    var drop =
      realisticWorld
        .rainData[
          index
        ];

    var positionIndex =
      index * 6;

    positions[
      positionIndex
    ] =
      drop.x;

    positions[
      positionIndex + 1
    ] =
      drop.y;

    positions[
      positionIndex + 2
    ] =
      drop.z;

    positions[
      positionIndex + 3
    ] =
      drop.x - 0.06;

    positions[
      positionIndex + 4
    ] =
      drop.y -
      drop.length;

    positions[
      positionIndex + 5
    ] =
      drop.z + 0.12;
  }

  realisticWorld
    .rainMesh
    .userData
    .positionAttribute
    .needsUpdate =
    true;
}


function createSkySymbols() {
  /*
   * Old neon rings intentionally removed.
   * effects.js now creates the sunset sky.
   */
}


/* =========================================================
   ANIMATE WORLD
========================================================= */

function updateMovingWorld() {
  var currentSpeed =
    worldSpeed();

  var currentTime =
    typeof performance !==
    "undefined"
      ? performance.now() *
        0.001
      : Date.now() *
        0.001;


  /* Road */

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
        worldLoopDistance();
    }
  }


  /* Foreground buildings */

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

    building.position.z +=
      currentSpeed *
      building.userData
        .speedFactor;

    if (
      building.position.z >
      38
    ) {
      building.position.z -=
        275;

      building.position.x =
        building.userData.baseX +
        (
          Math.random() -
          0.5
        ) *
        1.2;
    }
  }


  /* Distant skyline */

  for (
    var distantIndex = 0;
    distantIndex <
      realisticWorld
        .distantBuildings
        .length;
    distantIndex++
  ) {
    var distantBuilding =
      realisticWorld
        .distantBuildings[
          distantIndex
        ];

    distantBuilding.position.z +=
      currentSpeed *
      distantBuilding
        .userData
        .speedFactor;

    if (
      distantBuilding.position.z >
      45
    ) {
      distantBuilding.position.z -=
        315;
    }
  }


  /* Side traffic */

  for (
    var vehicleIndex = 0;
    vehicleIndex <
      realisticWorld
        .traffic
        .length;
    vehicleIndex++
  ) {
    var vehicle =
      realisticWorld
        .traffic[
          vehicleIndex
        ];

    vehicle.position.z +=
      currentSpeed *
      vehicle.userData
        .speedFactor;

    vehicle.position.y =
      0.02 +
      Math.sin(
        currentTime *
        2.2 +
        vehicle.userData.phase
      ) *
      0.008;

    if (
      vehicle.position.z >
      34
    ) {
      vehicle.position.z =
        -225 -
        Math.random() *
        90;
    }
  }


  /* Sign brightness */

  for (
    var signIndex = 0;
    signIndex <
      realisticWorld
        .signs
        .length;
    signIndex++
  ) {
    var sign =
      realisticWorld
        .signs[
          signIndex
        ];

    sign.material.emissiveIntensity =
      0.18 +
      Math.sin(
        currentTime *
        0.8 +
        sign.userData.phase
      ) *
      0.025;
  }


  /* Plant movement */

  for (
    var plantIndex = 0;
    plantIndex <
      realisticWorld
        .plants
        .length;
    plantIndex++
  ) {
    var plant =
      realisticWorld
        .plants[
          plantIndex
        ];

    plant.userData
      .leaves
      .rotation.z =
      Math.sin(
        currentTime *
        1.1 +
        plant.userData.phase
      ) *
      0.035;
  }


  /* Landmark flag */

  if (
    realisticWorld.landmark &&
    realisticWorld
      .landmark
      .userData.flag
  ) {
    realisticWorld
      .landmark
      .userData.flag
      .rotation.y =
      Math.sin(
        currentTime *
        2.2
      ) *
      0.12;

    realisticWorld
      .landmark
      .userData.flag
      .scale.x =
      1 +
      Math.sin(
        currentTime *
        3.1
      ) *
      0.05;
  }


  /* Optional rain */

  if (
    realisticWorld.rainMesh
  ) {
    for (
      var rainIndex = 0;
      rainIndex <
        realisticWorld
          .rainData
          .length;
      rainIndex++
    ) {
      var drop =
        realisticWorld
          .rainData[
            rainIndex
          ];

      drop.z +=
        currentSpeed *
        1.55;

      drop.y -=
        drop.fall;

      if (
        drop.y < -0.5 ||
        drop.z > 14
      ) {
        drop.x =
          (
            Math.random() -
            0.5
          ) * 30;

        drop.y =
          10 +
          Math.random() *
          8;

        drop.z =
          -110 -
          Math.random() *
          70;
      }
    }

    updateRainGeometry();
  }
}
