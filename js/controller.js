const Controller = (() => {
  "use strict";

  const MAX_FRAME_TIME = 0.05;

  const GAME_KEYS = new Set(Object.values(Model.CONTROLS));

  let state = null;
  let animationId = null;
  let lastTimestamp = null;

  function startGame() {
    stopGame();
    state = Model.createGameState();
    lastTimestamp = null;
    View.showGame();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    animationId = requestAnimationFrame(frame);
  }

  function stopGame() {
    cancelAnimationFrame(animationId);
    animationId = null;
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    state = null;
  }

  function frame(timestamp) {
    const deltaTime =
      lastTimestamp === null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, MAX_FRAME_TIME);
    lastTimestamp = timestamp;

    Model.updateGame(state, deltaTime).forEach(handleEvent);
    View.render(state);

    const status = Model.getGameStatus(state);
    if (status === "playing") {
      animationId = requestAnimationFrame(frame);
    } else {
      finishGame(status === "won");
    }
  }

  function handleEvent(event) {
    if (event === "flagHit" && Model.settings.soundOn) {
      View.playSound("flag_hit.mp3", 0.35);
    }
  }

  function finishGame(won) {
    animationId = null;
    if (Model.settings.soundOn) {
      View.playSound(won ? "win.mp3" : "lose.mp3", 0.35);
    }
    View.showResult(won);
  }

  function onKeyDown(event) {
    if (!GAME_KEYS.has(event.code)) return;
    if (event.code === Model.CONTROLS.shoot) event.preventDefault();
    state.keys[event.code] = true;
  }

  function onKeyUp(event) {
    if (!GAME_KEYS.has(event.code)) return;
    state.keys[event.code] = false;
  }

  return { startGame, stopGame };
})();
