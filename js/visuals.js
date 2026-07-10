/* visuals.js
   Neo Aryavarta cinematic environment

   Includes:
   - Cyber Bharat gates
   - Chakra structures
   - Devanagari holograms
   - Futuristic spires
   - Flying vehicles
   - Atmospheric energy particles
   - Horizon Surya structure
*/

let neoVisualGroup = null;
let neoGateGroup = null;
let hologramGroup = null;
let flyingVehicleGroup = null;
let atmosphereGroup = null;
let neoSpireGroup = null;

let neoGates = [];
let hologramBoards = [];
let flyingVehicles = [];
let neoSpires = [];

let atmosphereParticles = null;
let horizonSurya = null;

const NEO_GATE_COUNT = 12;
const NEO_GATE_SPACING = 22;
const NEO_GATE_LOOP_DISTANCE = NEO_GATE_COUNT * NEO_GATE_SPACING;

const HOLOGRAM_TEXTS = [
  "भारत",
  "सूर्य",
  "वेग",
  "शक्ति",
  "नव युग",
  "आर्यावर्त"
];

/* -----------------------------------------
   Main visual creation
----------------------------------------- */

function createNeoAryavartaVisuals() {
  if (!scene) return;

  neoGates = [];
  hologramBoards = [];
  flyingVehicles = [];
  neoSpires = [];

  neoVisualGroup = new THREE.Group();
  neoGateGroup = new THREE.Group();
  hologramGroup = new THREE.Group();
  flyingVehicleGroup = new THREE.Group();
  atmosphereGroup = new THREE.Group();
  neoSpireGroup = new THREE.Group();

  neoVisualGroup.add(neoGateGroup);
  neoVisualGroup.add(hologramGroup);
  neoVisualGroup.add(flyingVehicleGroup);
  neoVisualGroup.add(atmosphereGroup);
  neoVisualGroup.add(neoSpireGroup);

  scene.add(neoVisualGroup);

  createNeoGates();
  createHologramBoards();
  createNeoSpires();
  createFlyingVehicles();
  createAtmosphereParticles();
  createHorizonSurya();
}

/* -----------------------------------------
   Cyber gates
----------------------------------------- */

function createNeoGates() {
  for (let i = 0; i < NEO_GATE_COUNT; i++) {
    const gate = createSingleNeoGate(i);

    gate.position.z = -28 - i * NEO_GATE_SPACING;

    neoGates.push(gate);
    neoGateGroup.add(gate);
  }
}

function createSingleNeoGate(index) {
  const gate = new THREE.Group();

  const primaryColor = index % 2 === 0 ? 0x00f5ff : 0xffd166;
  const secondaryColor = index % 3 === 0 ? 0x8f2cff : 0x00bfff;

  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x08142c,
    metalness: 0.78,
    roughness: 0.2,
    emissive: primaryColor,
    emissiveIntensity: 0.26
  });

  const primaryGlowMaterial = new THREE.MeshBasicMaterial({
    color: primaryColor
  });

  const secondaryGlowMaterial = new THREE.MeshBasicMaterial({
    color: secondaryColor
  });

  /* Left and right pillars */

  [-5.6, 5.6].forEach(function (xPosition) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 5.4, 0.55),
      pillarMaterial
    );

    pillar.position.set(xPosition, 2.7, 0);
    gate.add(pillar);

    const innerGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 4.5, 0.62),
      primaryGlowMaterial
    );

    innerGlow.position.set(
      xPosition > 0 ? xPosition - 0.28 : xPosition + 0.28,
      2.7,
      0
    );

    gate.add(innerGlow);

    const topCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.72, 0.55, 8),
      secondaryGlowMaterial
    );

    topCap.position.set(xPosition, 5.65, 0);
    topCap.rotation.y = Math.PI / 8;

    gate.add(topCap);

    const lowerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.055, 10, 30),
      primaryGlowMaterial
    );

    lowerRing.position.set(xPosition, 0.55, 0);
    lowerRing.rotation.x = Math.PI / 2;

    gate.add(lowerRing);
  });

  /* Upper arch */

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(5.55, 0.13, 14, 70, Math.PI),
    primaryGlowMaterial
  );

  arch.position.y = 5.35;
  gate.add(arch);

  /* Central chakra */

  const chakra = createCyberChakra(primaryColor, secondaryColor);

  chakra.position.set(0, 5.1, 0);
  chakra.scale.set(0.85, 0.85, 0.85);

  gate.add(chakra);

  return gate;
}

function createCyberChakra(primaryColor, secondaryColor) {
  const chakra = new THREE.Group();

  const outerMaterial = new THREE.MeshBasicMaterial({
    color: primaryColor
  });

  const innerMaterial = new THREE.MeshBasicMaterial({
    color: secondaryColor
  });

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.07, 12, 48),
    outerMaterial
  );

  chakra.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.66, 0.045, 10, 40),
    innerMaterial
  );

  chakra.add(innerRing);

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 18, 18),
    innerMaterial
  );

  chakra.add(center);

  for (let i = 0; i < 12; i++) {
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.88, 0.035),
      i % 2 === 0 ? outerMaterial : innerMaterial
    );

    spoke.position.y = 0.44;
    spoke.rotation.z = (Math.PI * 2 * i) / 12;

    chakra.add(spoke);
  }

  chakra.userData.rotationSpeed = 0.008 + Math.random() * 0.01;

  return chakra;
}

/* -----------------------------------------
   Holographic Hindi billboards
----------------------------------------- */

function createHologramBoards() {
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const text = HOLOGRAM_TEXTS[i % HOLOGRAM_TEXTS.length];
    const color = i % 3 === 0 ? "#ffd166" : "#00f5ff";

    const board = createHologramTextBoard(text, color);

    board.position.set(
      side * (7.4 + Math.random() * 1.8),
      3.4 + Math.random() * 3.4,
      -34 - i * 25
    );

    board.rotation.y = side > 0 ? -0.35 : 0.35;
    board.userData.floatOffset = Math.random() * Math.PI * 2;
    board.userData.baseY = board.position.y;

    hologramBoards.push(board);
    hologramGroup.add(board);
  }
}

function createHologramTextBoard(text, color) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 256;

  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(2, 8, 28, 0.72)";
  context.fillRect(12, 12, canvas.width - 24, canvas.height - 24);

  context.strokeStyle = color;
  context.lineWidth = 7;
  context.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  context.shadowColor = color;
  context.shadowBlur = 28;

  context.fillStyle = color;
  context.font = "bold 82px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 2.2),
    material
  );
}

/* -----------------------------------------
   Futuristic Bharat spires
----------------------------------------- */

function createNeoSpires() {
  const cyanMaterial = new THREE.MeshStandardMaterial({
    color: 0x071a35,
    metalness: 0.75,
    roughness: 0.24,
    emissive: 0x00f5ff,
    emissiveIntensity: 0.32
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0x251b08,
    metalness: 0.7,
    roughness: 0.22,
    emissive: 0xffd166,
    emissiveIntensity: 0.38
  });

  for (let i = 0; i < 26; i++) {
    const side = Math.random() > 0.5 ? 1 : -1;
    const height = 5 + Math.random() * 9;

    const spire = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.85 + Math.random() * 0.4,
        1.15 + Math.random() * 0.45,
        height,
        8
      ),
      i % 2 === 0 ? cyanMaterial : goldMaterial
    );

    base.position.y = height / 2;
    spire.add(base);

    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(1.05, 2.1, 8),
      i % 2 === 0 ? goldMaterial : cyanMaterial
    );

    crown.position.y = height + 1;
    crown.rotation.y = Math.PI / 8;

    spire.add(crown);

    const crownRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.035, 10, 32),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffd166 : 0x00f5ff
      })
    );

    crownRing.position.y = height;
    crownRing.rotation.x = Math.PI / 2;

    spire.add(crownRing);

    spire.position.set(
      side * (10 + Math.random() * 11),
      0,
      -12 - Math.random() * 225
    );

    neoSpires.push(spire);
    neoSpireGroup.add(spire);
  }
}

/* -----------------------------------------
   Flying vehicles
----------------------------------------- */

function createFlyingVehicles() {
  for (let i = 0; i < 9; i++) {
    const vehicle = createSingleFlyingVehicle(i);

    const side = Math.random() > 0.5 ? 1 : -1;

    vehicle.position.set(
      side * (10 + Math.random() * 8),
      4.5 + Math.random() * 6,
      -30 - Math.random() * 205
    );

    vehicle.userData.velocityX =
      -side * (0.012 + Math.random() * 0.025);

    vehicle.userData.floatOffset = Math.random() * Math.PI * 2;

    flyingVehicles.push(vehicle);
    flyingVehicleGroup.add(vehicle);
  }
}

function createSingleFlyingVehicle(index) {
  const vehicle = new THREE.Group();

  const mainColor = index % 2 === 0 ? 0x00f5ff : 0xffd166;
  const accentColor = index % 3 === 0 ? 0xff2aff : 0x8f2cff;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.24, 2.1),
    new THREE.MeshStandardMaterial({
      color: 0x071224,
      metalness: 0.9,
      roughness: 0.18,
      emissive: mainColor,
      emissiveIntensity: 0.34
    })
  );

  vehicle.add(body);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 18, 18),
    new THREE.MeshBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.82
    })
  );

  cockpit.scale.set(1, 0.45, 1.35);
  cockpit.position.set(0, 0.27, 0.15);

  vehicle.add(cockpit);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.07, 0.48),
    new THREE.MeshBasicMaterial({
      color: accentColor
    })
  );

  leftWing.position.x = -1;
  vehicle.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 1;

  vehicle.add(rightWing);

  const rearGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.12, 0.1),
    new THREE.MeshBasicMaterial({
      color: mainColor
    })
  );

  rearGlow.position.z = 1.1;
  vehicle.add(rearGlow);

  vehicle.scale.set(0.72, 0.72, 0.72);

  return vehicle;
}

/* -----------------------------------------
   Atmosphere particles
----------------------------------------- */

function createAtmosphereParticles() {
  const particleCount = window.innerWidth < 720 ? 240 : 520;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 42;
    positions[i * 3 + 1] = Math.random() * 16;
    positions[i * 3 + 2] = -Math.random() * 190;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0x8feaff,
    size: 0.08,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  atmosphereParticles = new THREE.Points(geometry, material);

  atmosphereGroup.add(atmosphereParticles);
}

/* -----------------------------------------
   Horizon Surya
----------------------------------------- */

function createHorizonSurya() {
  horizonSurya = new THREE.Group();

  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb800,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(7.5, 64),
    sunMaterial
  );

  horizonSurya.add(sunDisc);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(9.2, 0.12, 14, 80),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  horizonSurya.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.1, 0.06, 12, 72),
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  horizonSurya.add(innerRing);

  horizonSurya.position.set(0, 13, -135);

  neoVisualGroup.add(horizonSurya);
}

/* -----------------------------------------
   Visual animation
----------------------------------------- */

function updateNeoAryavartaVisuals() {
  if (!neoVisualGroup) return;

  const currentTime = Date.now() * 0.001;

  neoGates.forEach(function (gate) {
    gate.position.z += speed;

    if (gate.position.z > 16) {
      gate.position.z -= NEO_GATE_LOOP_DISTANCE;
    }

    gate.children.forEach(function (child) {
      if (
        child.type === "Group" &&
        child.userData &&
        child.userData.rotationSpeed
      ) {
        child.rotation.z += child.userData.rotationSpeed;
      }
    });
  });

  hologramBoards.forEach(function (board) {
    board.position.z += speed * 0.82;

    board.position.y =
      board.userData.baseY +
      Math.sin(currentTime * 1.8 + board.userData.floatOffset) * 0.16;

    board.material.opacity =
      0.72 +
      Math.sin(currentTime * 4 + board.userData.floatOffset) * 0.12;

    if (board.position.z > 20) {
      board.position.z -= 250;
    }
  });

  neoSpires.forEach(function (spire) {
    spire.position.z += speed * 0.66;

    if (spire.position.z > 32) {
      spire.position.z -= 240;
    }
  });

  flyingVehicles.forEach(function (vehicle) {
    vehicle.position.z += speed * 0.76;
    vehicle.position.x += vehicle.userData.velocityX;

    vehicle.position.y +=
      Math.sin(currentTime * 2 + vehicle.userData.floatOffset) * 0.002;

    if (
      vehicle.position.z > 24 ||
      Math.abs(vehicle.position.x) > 24
    ) {
      const side = Math.random() > 0.5 ? 1 : -1;

      vehicle.position.set(
        side * (10 + Math.random() * 8),
        4.5 + Math.random() * 6,
        -170 - Math.random() * 80
      );

      vehicle.userData.velocityX =
        -side * (0.012 + Math.random() * 0.025);
    }
  });

  if (atmosphereParticles) {
    atmosphereParticles.position.z += speed * 0.22;
    atmosphereParticles.rotation.y += 0.0008;

    if (atmosphereParticles.position.z > 30) {
      atmosphereParticles.position.z = -70;
    }
  }

  if (horizonSurya) {
    horizonSurya.rotation.z += 0.0008;

    const pulse = 1 + Math.sin(currentTime * 0.8) * 0.025;

    horizonSurya.scale.set(pulse, pulse, pulse);
  }
}
