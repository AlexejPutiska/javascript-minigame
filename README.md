# Defend the Flag

Your flag stands in the bottom right corner. Twenty enemy tanks are coming for it, one after another, and you have exactly one tank to stop them. Meanwhile an aircraft keeps sweeping across the middle of the map and a bomb shows up every few seconds.

It is a small arcade game in plain JavaScript on an HTML5 canvas, with no libraries and no build step.

## Play

Open `defend_the_flag.html` in a browser. That is the whole setup.

Drive with **W A S D** and shoot with **Space**. Sound is off until you switch it on under Options.

## What you are up against

**The tanks.** They enter at the top left, drive down to the bottom row and fire along it toward the flag every 2 seconds. One hit destroys a tank and the next one starts its way in. After every fifth kill the next tank drives in faster.

**The flag.** It has 3 hearts and loses one for every bullet that reaches it, even one of your own. If an enemy bullet hits your tank, the game is over, so do not park in the bottom row.

**The bomb.** Every 7 seconds a bomb appears at a random spot with a 6 second countdown. Drive over it to defuse it. If the countdown reaches zero, the flag is destroyed.

**The aircraft.** It flies back and forth across the middle of the map. If it passes over your tank, the game is over, although its hitbox is a bit smaller than the picture.

Destroy all 20 tanks to win. Walls block your tank and your bullets, but not the enemy's.

## How it is built

The page loads four plain scripts in this order: `js/model.js` holds the game state and rules and has no browser code, `js/view.js` draws the canvas and the menus and plays sounds, `js/controller.js` reads the keyboard and runs the game loop, and `js/main.js` wires up the menu buttons.

Some icons and sounds come from free sources: uxwing.com, freepik.com, flaticon.com, pixabay.com and freesound.org.
