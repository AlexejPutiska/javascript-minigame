(() => {
  "use strict";

  function on(id, handler) {
    document.getElementById(id).addEventListener("click", handler);
  }

  function setSound(soundOn) {
    Model.settings.soundOn = soundOn;
    View.setSoundIcon(soundOn);
  }

  on("start_button", Controller.startGame);
  on("howtoplay_button", View.showHowToPlay);
  on("options_button", () => View.showOptions(Model.settings.soundOn));
  on("back_button", () => {
    Controller.stopGame();
    View.showMenu();
  });
  on("volume_on", () => setSound(false));
  on("volume_off", () => setSound(true));
})();
