/* powerups.js
   Shards, shield power-up, repair power-up
*/

function spawnShard() {
  const lane = Math.floor(Math.random() * 3);

  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );

  const shardLight = new THREE.PointLight(0xffd166, 1.4, 4);
  shard.add(shardLight);

  shard.position.set(lanes[lane], 1.2 + Math.random() * 0.8, -105);

  shardItems.push(shard);
  shardGroup.add(shard);
}

function updateShards() {
  for (let i = shardItems.length - 1; i >= 0; i--) {
    const shard = shardItems[i];

    shard.position.z += speed;
    shard.rotation.y += 0.08;
    shard.rotation.x += 0.05;

    if (shard.position.z > 8) {
      shardGroup.remove(shard);
      shardItems.splice(i, 1);
      continue;
    }

    const dx = Math.abs(shard.position.x - player.position.x);
    const dy = Math.abs(shard.position.y - (player.position.y + 1.3));
    const dz = Math.abs(shard.position.z - player.position.z);

    if (dx < 0.9 && dy < 1.2 && dz < 1) {
      shards++;
      shardGroup.remove(shard);
      shardItems.splice(i, 1);
    }
  }
}

function spawnPowerUp() {
  const lane = Math.floor(Math.random() * 3);
  const type = Math.random() > 0.5 ? "shield" : "repair";
  const color = type === "shield" ? 0x00f5ff : 0x30ff7a;

  const powerUp = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.34, 1),
    new THREE.MeshBasicMaterial({ color: color })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.035, 12, 40),
    new THREE.MeshBasicMaterial({ color: color })
  );

  ring.rotation.x = Math.PI / 2;

  const light = new THREE.PointLight(color, 2.4, 8);

  powerUp.add(body);
  powerUp.add(ring);
  powerUp.add(light);

  powerUp.position.set(lanes[lane], 1.3, -105);
  powerUp.userData.type = type;

  powerUps.push(powerUp);
  shardGroup.add(powerUp);
}

function updatePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const item = powerUps[i];

    item.position.z += speed;
    item.rotation.y += 0.08;

    if (item.position.z > 8) {
      shardGroup.remove(item);
      powerUps.splice(i, 1);
      continue;
    }

    const dx = Math.abs(item.position.x - player.position.x);
    const dy = Math.abs(item.position.y - (player.position.y + 1.3));
    const dz = Math.abs(item.position.z - player.position.z);

    if (dx < 0.9 && dy < 1.2 && dz < 1) {
      if (item.userData.type === "shield") {
        shieldActive = true;
        updateShieldStatus();
        setMission("Shield collected", 90);
      }

      if (item.userData.type === "repair") {
        coreHealth = Math.min(100, coreHealth + 25);
        updateCoreHealth();
        setMission("Core repaired +25", 90);
      }

      shardGroup.remove(item);
      powerUps.splice(i, 1);
    }
  }
}
