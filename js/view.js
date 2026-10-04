const View = (() => {
  "use strict";

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
  }

  const images = {
    background: loadImage("./img/mud.png"),
    wall: loadImage("./img/wall.png"),
    player: loadImage("./img/player.png"),
    enemy: loadImage("./img/enemy1.png"),
    flag: loadImage("./img/flag.png"),
    heart: loadImage("./img/heart.png"),
    bomb: loadImage("./img/bomb.png"),
    aircraft: loadImage("./img/aircraft.png"),
  };

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function render(state) {
    clearCanvas();
    drawScene(state.boundaries);
    drawFlag(state.flag);
    drawFlagLives(state.flag);
    drawTank(images.player, state.player);
    drawBullets(state.bullets);
    drawBomb(state.bomb);
    drawEnemiesLeft(state.enemiesLeft);
    drawTank(images.enemy, state.enemy);
    drawBullets(state.enemyBullets);
    drawAircraft(state.aircraft);
  }

  function drawScene(boundaries) {
    ctx.drawImage(images.background, 0, 0);

    ctx.fillStyle = "#999999";
    ctx.fillRect(0, 521, 800, 99);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 522);
    ctx.lineTo(800, 522);
    ctx.stroke();

    boundaries.forEach((wall) => {
      ctx.drawImage(images.wall, wall.x, wall.y, wall.width, wall.height);
    });
  }

  function drawFlag(flag) {
    ctx.drawImage(images.flag, flag.x, flag.y, flag.width, flag.height);
  }

  function drawFlagLives(flag) {
    for (let i = 1; i < flag.health + 1; i++) {
      ctx.drawImage(images.heart, 580 + i * 50, 532, 58, 64);
    }
  }

  function drawTank(image, tank) {
    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);
    ctx.rotate((tank.rotation * Math.PI) / 180);
    ctx.drawImage(image, -tank.width / 2, -tank.height / 2, tank.width, tank.height);
    ctx.restore();
  }

  function drawBullets(bullets) {
    ctx.fillStyle = "#DBDADA";
    bullets.forEach((bullet) => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  function drawBomb(bomb) {
    if (!bomb.isActivated) return;
    ctx.drawImage(images.bomb, bomb.x, bomb.y, bomb.width, bomb.height);
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(bomb.countdown, bomb.x + 20, bomb.y - 5);
  }

  function drawEnemiesLeft(enemiesLeft) {
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(enemiesLeft, 380, 579);
    ctx.drawImage(images.enemy, 405, 545, 37, 37);
  }

  function drawAircraft(aircraft) {
    ctx.save();
    ctx.translate(aircraft.x + aircraft.width / 2, aircraft.y + aircraft.height / 2);
    ctx.scale(aircraft.direction, 1);
    ctx.drawImage(images.aircraft, -aircraft.width / 2, -aircraft.height / 2, aircraft.width, aircraft.height);
    ctx.restore();
  }

  function setVisible(id, visible) {
    document.getElementById(id).style.display = visible ? "block" : "none";
  }

  function setMenuVisible(visible) {
    ["game_name", "start_button", "howtoplay_button", "options_button"].forEach((id) => setVisible(id, visible));
  }

  function showMenu() {
    setMenuVisible(true);
    ["back_button", "howtoplay_text", "volume_on", "volume_off", "win_img", "lose_img"].forEach((id) =>
      setVisible(id, false)
    );
    clearCanvas();
  }

  function showGame() {
    setMenuVisible(false);
    setVisible("back_button", true);
  }

  function showHowToPlay() {
    setMenuVisible(false);
    setVisible("back_button", true);
    setVisible("howtoplay_text", true);
  }

  function showOptions(soundOn) {
    setMenuVisible(false);
    setVisible("back_button", true);
    document.getElementById("bg_music").volume = 0.05;
    setSoundIcon(soundOn);
  }

  function showResult(won) {
    setVisible(won ? "win_img" : "lose_img", true);
  }

  function setSoundIcon(soundOn) {
    const music = document.getElementById("bg_music");
    music.muted = !soundOn;
    if (soundOn) music.play().catch(() => {});
    setVisible("volume_on", soundOn);
    setVisible("volume_off", !soundOn);
  }

  function playSound(file, volume) {
    const audio = new Audio(`./audio/${file}`);
    audio.volume = volume;
    audio.play();
  }

  return { render, showMenu, showGame, showHowToPlay, showOptions, showResult, setSoundIcon, playSound };
})();
