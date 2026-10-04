const Model = (() => {
  "use strict";

  const ARENA_WIDTH = 800;
  const ARENA_HEIGHT = 520;

  const TILE_SIZE = 40;
  const TANK_SIZE = 40;

  const BULLET_SPEED = 540;
  const BULLET_RADIUS = 4;
  const PLAYER_SHOOT_DELAY = 0.5;
  const ENEMY_SHOOT_DELAY = 2;
  const BOMB_SPAWN_INTERVAL = 7;
  const BOMB_COUNTDOWN_START = 6;

  const CONTROLS = {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    shoot: "Space",
  };

  const settings = { soundOn: false };

  const MAP = [
    "................##..",
    "......##........##..",
    "##....##............",
    "##..................",
    "............##......",
    "............##......",
    "....................",
    "....................",
    "......##.........##.",
    "......##.........##.",
    "....................",
    "....................",
    "....................",
  ];

  function createBoundaries() {
    const walls = [];
    MAP.forEach((row, rowIndex) => {
      [...row].forEach((tile, columnIndex) => {
        if (tile === "#") {
          walls.push({
            x: columnIndex * TILE_SIZE,
            y: rowIndex * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          });
        }
      });
    });
    return walls;
  }

  function createGameState() {
    return {
      player: {
        x: 380,
        y: 480,
        width: TANK_SIZE,
        height: TANK_SIZE,
        speed: 240,
        rotation: 0,
        shootCooldown: 0,
      },
      enemy: {
        x: 80,
        y: -200,
        width: TANK_SIZE,
        height: TANK_SIZE,
        speed: 90,
        maxY: 480,
        direction: "down",
        rotation: 0,
        shootCooldown: 0,
      },
      flag: { x: 700, y: 480, width: 40, height: 40, health: 3 },
      bomb: {
        x: null,
        y: null,
        width: 40,
        height: 40,
        isActivated: false,
        canActivate: false,
        countdown: 0,
      },
      aircraft: { x: -200, y: 220, width: 160, height: 160, speed: 120, direction: 1 },
      bullets: [],
      enemyBullets: [],
      enemiesLeft: 20,
      boundaries: createBoundaries(),
      keys: {},
      timers: { bombSpawn: 0, bombTick: 0 },
    };
  }

  function updateGame(state, deltaTime) {
    const events = [];
    updatePlayer(state, deltaTime);
    updateBullets(state, deltaTime, events);
    updateEnemy(state, deltaTime);
    updateEnemyBullets(state, deltaTime, events);
    updateBomb(state, deltaTime);
    checkBombCollision(state);
    moveAircraft(state, deltaTime);
    checkPlayerAircraftCollision(state);
    return events;
  }

  function getGameStatus(state) {
    if (state.flag.health <= 0) return "lost";
    if (state.enemiesLeft <= 0) return "won";
    return "playing";
  }

  function overlaps(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function bulletBox(bullet) {
    return {
      x: bullet.x - bullet.radius,
      y: bullet.y - bullet.radius,
      width: bullet.radius * 2,
      height: bullet.radius * 2,
    };
  }

  function isOutOfArena(bullet) {
    return bullet.x < 0 || bullet.x > ARENA_WIDTH || bullet.y < 0 || bullet.y > ARENA_HEIGHT;
  }

  function createBullet(shooter) {
    return {
      x: shooter.x + shooter.width / 2,
      y: shooter.y + shooter.height / 2,
      radius: BULLET_RADIUS,
      speed: BULLET_SPEED,
      rotation: shooter.rotation,
    };
  }

  function moveBullet(bullet, deltaTime) {
    const distance = bullet.speed * deltaTime;
    switch (bullet.rotation) {
      case 0:
        bullet.y -= distance;
        break;
      case 180:
        bullet.y += distance;
        break;
      case 270:
        bullet.x -= distance;
        break;
      case 90:
        bullet.x += distance;
        break;
    }
  }

  function updatePlayer(state, deltaTime) {
    const { player, flag, enemy, boundaries, keys } = state;
    const step = player.speed * deltaTime;
    let nextX = player.x;
    let nextY = player.y;

    if (player.shootCooldown > 0) player.shootCooldown -= deltaTime;

    if (keys[CONTROLS.up] && player.y > 0) {
      nextY = player.y - step;
      player.rotation = 0;
    } else if (keys[CONTROLS.down] && player.y < ARENA_HEIGHT - TANK_SIZE) {
      nextY = player.y + step;
      player.rotation = 180;
    } else if (keys[CONTROLS.left] && player.x > 0) {
      nextX = player.x - step;
      player.rotation = 270;
    } else if (keys[CONTROLS.right] && player.x < ARENA_WIDTH - TANK_SIZE) {
      nextX = player.x + step;
      player.rotation = 90;
    }

    const next = { x: nextX, y: nextY, width: player.width, height: player.height };
    const blocked =
      overlaps(next, flag) ||
      overlaps(next, enemy) ||
      boundaries.some((wall) => overlaps(next, wall));

    if (!blocked) {
      player.x = nextX;
      player.y = nextY;
    }

    if (keys[CONTROLS.shoot] && player.shootCooldown <= 0) {
      state.bullets.push(createBullet(player));
      player.shootCooldown = PLAYER_SHOOT_DELAY;
    }
  }

  function updateBullets(state, deltaTime, events) {
    const { bullets, boundaries, flag, enemy } = state;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      moveBullet(bullet, deltaTime);
      const box = bulletBox(bullet);

      if (boundaries.some((wall) => overlaps(box, wall)) || isOutOfArena(bullet)) {
        bullets.splice(i, 1);
        continue;
      }

      if (overlaps(box, flag)) {
        bullets.splice(i, 1);
        flag.health--;
        events.push("flagHit");
        if (flag.health === 0) {
          flag.width = 0;
          flag.height = 0;
          return;
        }
        continue;
      }

      if (overlaps(box, enemy)) {
        bullets.splice(i, 1);
        state.enemiesLeft--;
        enemy.speed = enemySpeedFor(state.enemiesLeft);
        if (state.enemiesLeft > 0) {
          resetEnemy(enemy);
        } else {
          enemy.width = 0;
          enemy.height = 0;
        }
      }
    }
  }

  function enemySpeedFor(enemiesLeft) {
    if (enemiesLeft <= 5) return 120;
    if (enemiesLeft <= 10) return 108;
    if (enemiesLeft <= 15) return 96;
    return 90;
  }

  function resetEnemy(enemy) {
    enemy.x = 80;
    enemy.y = -160;
    enemy.direction = "down";
    enemy.rotation = 0;
  }

  function updateEnemy(state, deltaTime) {
    const { enemy, enemyBullets } = state;

    if (enemy.shootCooldown > 0) enemy.shootCooldown -= deltaTime;

    if (enemy.direction === "down" && enemy.y < enemy.maxY) {
      enemy.y += enemy.speed * deltaTime;
      enemy.rotation = 180;
    } else if (enemy.y >= enemy.maxY) {
      enemy.direction = "right";
      enemy.rotation = 90;
      if (enemy.shootCooldown <= 0) {
        enemyBullets.push(createBullet(enemy));
        enemy.shootCooldown = ENEMY_SHOOT_DELAY;
      }
    }
  }

  function updateEnemyBullets(state, deltaTime, events) {
    const { enemyBullets, player, flag } = state;

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];
      moveBullet(bullet, deltaTime);
      const box = bulletBox(bullet);

      if (overlaps(box, player)) {
        enemyBullets.splice(i, 1);
        flag.health = 0;
        player.width = 0;
        player.height = 0;
        return;
      }

      if (overlaps(box, flag)) {
        enemyBullets.splice(i, 1);
        flag.health--;
        events.push("flagHit");
        if (flag.health === 0) {
          flag.width = 0;
          flag.height = 0;
          return;
        }
        continue;
      }

      if (isOutOfArena(bullet)) {
        enemyBullets.splice(i, 1);
      }
    }
  }

  function updateBomb(state, deltaTime) {
    const { bomb, flag, timers, boundaries } = state;

    timers.bombSpawn += deltaTime;
    if (timers.bombSpawn >= BOMB_SPAWN_INTERVAL) {
      timers.bombSpawn -= BOMB_SPAWN_INTERVAL;
      bomb.canActivate = true;
    }

    timers.bombTick += deltaTime;
    while (timers.bombTick >= 1) {
      timers.bombTick -= 1;
      if (bomb.isActivated && bomb.countdown > 0) {
        bomb.countdown--;
        if (bomb.countdown === 0) flag.health = 0;
      }
    }

    if (bomb.canActivate) {
      do {
        bomb.x = Math.floor(Math.random() * (480 - bomb.width + 1)) + 300;
        bomb.y = Math.floor(Math.random() * (400 - bomb.height + 1)) + 80;
      } while (boundaries.some((wall) => overlaps(bomb, wall)));
      bomb.isActivated = true;
      bomb.countdown = BOMB_COUNTDOWN_START;
    }
    bomb.canActivate = false;
  }

  function checkBombCollision(state) {
    const { bomb, player } = state;
    if (bomb.isActivated && overlaps(player, bomb)) {
      bomb.isActivated = false;
      bomb.canActivate = false;
    }
  }

  function moveAircraft(state, deltaTime) {
    const { aircraft } = state;
    aircraft.x += aircraft.speed * aircraft.direction * deltaTime;
    if (aircraft.x > ARENA_WIDTH + 400) {
      aircraft.direction = -1;
    } else if (aircraft.x < -aircraft.width - 400) {
      aircraft.direction = 1;
    }
  }

  function checkPlayerAircraftCollision(state) {
    const { player, aircraft, flag } = state;
    if (
      player.x < aircraft.x + (aircraft.width - 20) &&
      player.x + (player.width - 60) > aircraft.x &&
      player.y < aircraft.y + (aircraft.height - 15) &&
      player.y + (player.height - 15) > aircraft.y
    ) {
      flag.health = 0;
    }
  }

  return { ARENA_WIDTH, ARENA_HEIGHT, CONTROLS, settings, createGameState, updateGame, getGameStatus };
})();
