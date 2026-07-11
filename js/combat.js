/* =========================================================
   combat.js
   Velocity Runner: Rise of Bharat

   Features:
   - Player shooting
   - Shooting cooldown
   - Homing bullets
   - Boss targeting
   - Trinetra Drone targeting
   - Drone EMP projectiles
   - Explosion particle effects
   - Shooting sound integration
========================================================= */


/* =========================================================
   PLAYER SHOOTING
========================================================= */

function shoot() {
  /*
    Shooting is disabled when:
    - the game has not started,
    - the game is paused,
    - the game is over,
    - the weapon is cooling down.
  */

  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    return;
  }

  if (shootCooldown > 0) {
    return;
  }


  /*
    Start the shooting cooldown.
  */

  shootCooldown =
    SHOOT_COOLDOWN_MAX;

  updateShootButton();


  /* =====================================================
     BULLET MATERIALS
  ===================================================== */

  const bulletCoreMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 1
    });


  const bulletGlowMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });


  /* =====================================================
     CREATE BULLET GROUP
  ===================================================== */

  const bullet =
    new THREE.Group();


  /*
    Main golden bullet core.
  */

  const bulletCore =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.16,
        18,
        18
      ),
      bulletCoreMaterial
    );

  bullet.add(bulletCore);


  /*
    Cyan outer energy shell.
  */

  const bulletGlow =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.24,
        16,
        16
      ),
      bulletGlowMaterial
    );

  bullet.add(bulletGlow);


  /*
    Short energy trail behind the bullet.
  */

  const bulletTrail =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        0.12,
        0.7,
        12
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );

  bulletTrail.rotation.x =
    Math.PI / 2;

  bulletTrail.position.z =
    0.42;

  bullet.add(bulletTrail);


  /*
    Small point light surrounding the bullet.
  */

  const bulletLight =
    new THREE.PointLight(
      0xffd166,
      1.45,
      6
    );

  bullet.add(bulletLight);


  /* =====================================================
     BULLET STARTING POSITION
  ===================================================== */

  bullet.position.set(
    player.position.x,
    player.position.y + 1.55,
    player.position.z + 0.35
  );


  /*
    The bullet disappears after this many frames.
  */

  bullet.userData.life = 70;

  bullet.userData.core =
    bulletCore;

  bullet.userData.glow =
    bulletGlow;

  bullet.userData.trail =
    bulletTrail;


  bullets.push(bullet);

  bulletGroup.add(bullet);


  /* =====================================================
     SHOOTING FEEDBACK
  ===================================================== */

  /*
    Play the procedural shooting sound from audio.js.

    The safety check prevents the game from crashing if
    audio.js has not loaded for any reason.
  */

  if (
    typeof playShootSound ===
    "function"
  ) {
    playShootSound();
  }


  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(0.035);
  }


  setMission(
    "Surya shot fired",
    40
  );
}


/* =========================================================
   UPDATE PLAYER BULLETS
========================================================= */

function updateBullets() {
  const targetVector =
    new THREE.Vector3();

  const direction =
    new THREE.Vector3();


  for (
    let bulletIndex =
      bullets.length - 1;

    bulletIndex >= 0;

    bulletIndex--
  ) {
    const bullet =
      bullets[bulletIndex];


    bullet.userData.life--;


    /*
      Animate the bullet and its energy layers.
    */

    bullet.rotation.y += 0.18;
    bullet.rotation.x += 0.12;


    if (bullet.userData.core) {
      bullet.userData.core.rotation.x +=
        0.18;

      bullet.userData.core.rotation.y +=
        0.22;
    }


    if (bullet.userData.glow) {
      const glowPulse =
        1 +
        Math.sin(
          Date.now() * 0.012
        ) * 0.12;

      bullet.userData.glow.scale.set(
        glowPulse,
        glowPulse,
        glowPulse
      );
    }


    /* =====================================================
       TARGET THE ACTIVE BOSS
    ===================================================== */

    if (
      bossActive &&
      boss &&
      boss.visible
    ) {
      targetVector.set(
        boss.position.x,
        5.2,
        boss.position.z + 0.8
      );


      direction
        .subVectors(
          targetVector,
          bullet.position
        )
        .normalize();


      bullet.position.add(
        direction.multiplyScalar(0.78)
      );


      /*
        Bullet reached the boss.
      */

      if (
        bullet.position.distanceTo(
          targetVector
        ) < 0.9
      ) {
        createExplosion(
          bullet.position.x,
          bullet.position.y,
          bullet.position.z
        );


        removePlayerBullet(
          bullet,
          bulletIndex
        );


        damageBoss(12);

        continue;
      }
    }


    /* =====================================================
       TARGET THE TRINETRA DRONE
    ===================================================== */

    else if (
      droneAlive &&
      drone &&
      drone.visible
    ) {
      targetVector.set(
        drone.position.x,
        drone.position.y,
        drone.position.z
      );


      direction
        .subVectors(
          targetVector,
          bullet.position
        )
        .normalize();


      bullet.position.add(
        direction.multiplyScalar(0.72)
      );


      /*
        Bullet reached the drone.
      */

      if (
        bullet.position.distanceTo(
          drone.position
        ) < 0.55
      ) {
        removePlayerBullet(
          bullet,
          bulletIndex
        );


        destroyDrone();

        continue;
      }
    }


    /* =====================================================
       NO TARGET — MOVE FORWARD
    ===================================================== */

    else {
      bullet.position.z -= 0.75;
    }


    /* =====================================================
       REMOVE EXPIRED BULLET
    ===================================================== */

    if (
      bullet.userData.life <= 0 ||
      bullet.position.z < -130 ||
      bullet.position.z > 30 ||
      bullet.position.y < -5 ||
      bullet.position.y > 20
    ) {
      removePlayerBullet(
        bullet,
        bulletIndex
      );
    }
  }
}


/* =========================================================
   REMOVE PLAYER BULLET
========================================================= */

function removePlayerBullet(
  bullet,
  bulletIndex
) {
  if (!bullet) {
    return;
  }


  if (bulletGroup) {
    bulletGroup.remove(bullet);
  }


  /*
    Dispose all bullet geometries and materials to prevent
    memory usage from continuously increasing.
  */

  bullet.traverse(
    function (object) {
      if (object.geometry) {
        object.geometry.dispose();
      }


      if (object.material) {
        if (
          Array.isArray(
            object.material
          )
        ) {
          object.material.forEach(
            function (material) {
              material.dispose();
            }
          );
        } else {
          object.material.dispose();
        }
      }
    }
  );


  if (
    bulletIndex >= 0 &&
    bulletIndex < bullets.length
  ) {
    bullets.splice(
      bulletIndex,
      1
    );
  }
}


/* =========================================================
   UPDATE DRONE EMP SHOTS
========================================================= */

function updateEMPShots() {
  const playerHitPoint =
    new THREE.Vector3();


  for (
    let empIndex =
      empShots.length - 1;

    empIndex >= 0;

    empIndex--
  ) {
    const emp =
      empShots[empIndex];


    emp.userData.life--;


    emp.rotation.y += 0.15;
    emp.rotation.x += 0.1;


    /*
      Move the EMP towards the stored direction.
    */

    emp.position.add(
      emp.userData.direction
        .clone()
        .multiplyScalar(0.2)
    );


    playerHitPoint.set(
      player.position.x,
      player.position.y + 1.3,
      player.position.z
    );


    /* =====================================================
       EMP HITS PLAYER
    ===================================================== */

    if (
      emp.position.distanceTo(
        playerHitPoint
      ) < 0.65
    ) {
      removeEMPShot(
        emp,
        empIndex
      );


      /*
        damagePlayer() already handles damage sound,
        shield sound, explosion and camera shake.
      */

      var droneDamage =
  typeof getDroneHitDamage ===
    "function"
    ? getDroneHitDamage()
    : 10;

damagePlayer(droneDamage);

      continue;
    }


    /* =====================================================
       REMOVE EXPIRED EMP
    ===================================================== */

    if (
      emp.userData.life <= 0 ||
      emp.position.y < -1 ||
      emp.position.y > 12 ||
      emp.position.z > 12 ||
      emp.position.z < -25
    ) {
      removeEMPShot(
        emp,
        empIndex
      );
    }
  }
}


/* =========================================================
   REMOVE EMP SHOT
========================================================= */

function removeEMPShot(
  emp,
  empIndex
) {
  if (!emp) {
    return;
  }


  if (empGroup) {
    empGroup.remove(emp);
  }


  emp.traverse(
    function (object) {
      if (object.geometry) {
        object.geometry.dispose();
      }


      if (object.material) {
        if (
          Array.isArray(
            object.material
          )
        ) {
          object.material.forEach(
            function (material) {
              material.dispose();
            }
          );
        } else {
          object.material.dispose();
        }
      }
    }
  );


  if (
    empIndex >= 0 &&
    empIndex < empShots.length
  ) {
    empShots.splice(
      empIndex,
      1
    );
  }
}


/* =========================================================
   CREATE EXPLOSION
========================================================= */

function createExplosion(
  x,
  y,
  z
) {
  if (!bulletGroup) {
    return;
  }


  const explosionColors = [
    0xff0033,
    0xffd166,
    0x00f5ff,
    0xb14cff
  ];


  for (
    let particleIndex = 0;
    particleIndex < 18;
    particleIndex++
  ) {
    const particleColor =
      explosionColors[
        particleIndex %
        explosionColors.length
      ];


    const piece =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.065 +
          Math.random() * 0.045,
          10,
          10
        ),
        new THREE.MeshBasicMaterial({
          color: particleColor,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending:
            THREE.AdditiveBlending
        })
      );


    piece.position.set(
      x,
      y,
      z
    );


    piece.userData.life =
      22 +
      Math.floor(
        Math.random() * 10
      );


    piece.userData.maxLife =
      piece.userData.life;


    piece.userData.vx =
      (
        Math.random() -
        0.5
      ) * 0.34;


    piece.userData.vy =
      (
        Math.random() -
        0.32
      ) * 0.34;


    piece.userData.vz =
      (
        Math.random() -
        0.5
      ) * 0.34;


    piece.userData.gravity =
      0.006 +
      Math.random() * 0.004;


    piece.userData.rotationSpeed =
      (
        Math.random() -
        0.5
      ) * 0.28;


    explosions.push(piece);

    bulletGroup.add(piece);
  }
}


/* =========================================================
   UPDATE EXPLOSIONS
========================================================= */

function updateExplosions() {
  for (
    let explosionIndex =
      explosions.length - 1;

    explosionIndex >= 0;

    explosionIndex--
  ) {
    const piece =
      explosions[explosionIndex];


    piece.userData.life--;


    piece.position.x +=
      piece.userData.vx;


    piece.position.y +=
      piece.userData.vy;


    piece.position.z +=
      piece.userData.vz;


    /*
      Add a slight falling movement.
    */

    piece.userData.vy -=
      piece.userData.gravity;


    piece.rotation.x +=
      piece.userData.rotationSpeed;


    piece.rotation.y +=
      piece.userData.rotationSpeed *
      0.8;


    piece.scale.multiplyScalar(
      0.955
    );


    /*
      Fade particles as their lifetime ends.
    */

    if (piece.material) {
      piece.material.opacity =
        Math.max(
          0,
          piece.userData.life /
          piece.userData.maxLife
        );
    }


    if (
      piece.userData.life <= 0
    ) {
      removeExplosionPiece(
        piece,
        explosionIndex
      );
    }
  }
}


/* =========================================================
   REMOVE EXPLOSION PARTICLE
========================================================= */

function removeExplosionPiece(
  piece,
  explosionIndex
) {
  if (!piece) {
    return;
  }


  if (bulletGroup) {
    bulletGroup.remove(piece);
  }


  if (piece.geometry) {
    piece.geometry.dispose();
  }


  if (piece.material) {
    piece.material.dispose();
  }


  if (
    explosionIndex >= 0 &&
    explosionIndex <
      explosions.length
  ) {
    explosions.splice(
      explosionIndex,
      1
    );
  }
}


/* =========================================================
   CLEAR COMBAT OBJECTS
========================================================= */

function clearCombatObjects() {
  /*
    This utility can be called during a restart or when
    returning to the home screen.
  */


  for (
    let bulletIndex =
      bullets.length - 1;

    bulletIndex >= 0;

    bulletIndex--
  ) {
    removePlayerBullet(
      bullets[bulletIndex],
      bulletIndex
    );
  }


  for (
    let empIndex =
      empShots.length - 1;

    empIndex >= 0;

    empIndex--
  ) {
    removeEMPShot(
      empShots[empIndex],
      empIndex
    );
  }


  for (
    let explosionIndex =
      explosions.length - 1;

    explosionIndex >= 0;

    explosionIndex--
  ) {
    removeExplosionPiece(
      explosions[explosionIndex],
      explosionIndex
    );
  }
}
