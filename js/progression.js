/* =========================================================
   progression.js — RunNova H2B

   Persistent systems:
   - Player XP and levels
   - Nova Coins and Crystals
   - Total runs and distance
   - Best distance
   - Nova Tokens collected
   - Lane changes
   - Drones destroyed
   - Daily challenge progress
   - Daily completion reward
========================================================= */

(function () {
  "use strict";


  /* =======================================================
     STORAGE KEYS
  ======================================================= */

  var STORAGE_KEYS = {
    progression:
      "runnovaProgression",

    coins:
      "runnovaNovaCoins",

    crystals:
      "runnovaNovaCrystals",

    dailyProgress:
      "runnovaDailyProgress:",

    dailyBonus:
      "runnovaDailyBonus:"
  };


  /* =======================================================
     CURRENT RUN TRACKING
  ======================================================= */

  var currentRun = {
    active: false,
    finalized: false,

    previousLane: null,
    laneChanges: 0,

    distance: 0,
    tokens: 0,
    drones: 0
  };


  var gameplayHooksInstalled =
    false;

  var hookAttempts =
    0;

  var toastTimer =
    null;


  /* =======================================================
     STORAGE HELPERS
  ======================================================= */

  function readStorage(key) {
    try {
      return window.localStorage.getItem(
        key
      );
    } catch (error) {
      return null;
    }
  }


  function writeStorage(
    key,
    value
  ) {
    try {
      window.localStorage.setItem(
        key,
        value
      );

      return true;
    } catch (error) {
      return false;
    }
  }


  function safeNumber(
    value,
    fallback
  ) {
    var convertedValue =
      Number(value);

    return Number.isFinite(
      convertedValue
    )
      ? convertedValue
      : fallback;
  }


  function positiveInteger(
    value,
    fallback
  ) {
    return Math.max(
      0,
      Math.floor(
        safeNumber(
          value,
          fallback
        )
      )
    );
  }


  function getTodayKey() {
    var currentDate =
      new Date();

    return [
      currentDate.getFullYear(),

      String(
        currentDate.getMonth() + 1
      ).padStart(2, "0"),

      String(
        currentDate.getDate()
      ).padStart(2, "0")
    ].join("-");
  }


  /* =======================================================
     DEFAULT PLAYER PROGRESSION
  ======================================================= */

  function createDefaultState() {
    return {
      version: 1,

      totalXp: 0,

      coins: 0,
      crystals: 0,

      totalRuns: 0,
      totalDistance: 0,
      bestDistance: 0,

      totalTokens: 0,
      totalLaneChanges: 0,
      totalDrones: 0
    };
  }


  function loadProgressionState() {
    var savedState = null;

    try {
      savedState =
        JSON.parse(
          readStorage(
            STORAGE_KEYS.progression
          ) || "null"
        );
    } catch (error) {
      savedState = null;
    }


    var loadedState =
      createDefaultState();


    if (
      !savedState ||
      typeof savedState !==
        "object"
    ) {
      savedState = {};
    }


    Object.keys(
      loadedState
    ).forEach(
      function (key) {
        if (key === "version") {
          return;
        }

        loadedState[key] =
          positiveInteger(
            savedState[key],
            loadedState[key]
          );
      }
    );


    /*
     * Currency may also be modified by the Home Panels file.
     * Use whichever saved value is greater.
     */

    loadedState.coins =
      Math.max(
        loadedState.coins,

        positiveInteger(
          readStorage(
            STORAGE_KEYS.coins
          ),
          0
        )
      );


    loadedState.crystals =
      Math.max(
        loadedState.crystals,

        positiveInteger(
          readStorage(
            STORAGE_KEYS.crystals
          ),
          0
        )
      );


    return loadedState;
  }


  var progressionState =
    loadProgressionState();


  function synchronizeCurrencies() {
    progressionState.coins =
      Math.max(
        progressionState.coins,

        positiveInteger(
          readStorage(
            STORAGE_KEYS.coins
          ),
          0
        )
      );


    progressionState.crystals =
      Math.max(
        progressionState.crystals,

        positiveInteger(
          readStorage(
            STORAGE_KEYS.crystals
          ),
          0
        )
      );
  }


  function saveProgressionState() {
    synchronizeCurrencies();


    writeStorage(
      STORAGE_KEYS.progression,

      JSON.stringify(
        progressionState
      )
    );


    writeStorage(
      STORAGE_KEYS.coins,

      String(
        progressionState.coins
      )
    );


    writeStorage(
      STORAGE_KEYS.crystals,

      String(
        progressionState.crystals
      )
    );
  }


  /* =======================================================
     LEVEL CALCULATION
  ======================================================= */

  function calculateLevel(
    totalXp
  ) {
    var level = 1;

    var remainingXp =
      positiveInteger(
        totalXp,
        0
      );

    var requiredXp =
      200;


    while (
      level < 100 &&
      remainingXp >=
        requiredXp
    ) {
      remainingXp -=
        requiredXp;

      level += 1;

      requiredXp =
        200 +
        (
          level - 1
        ) * 100;
    }


    return {
      level: level,

      currentXp:
        remainingXp,

      requiredXp:
        requiredXp,

      percent:
        level >= 100
          ? 100
          : Math.min(
              100,

              remainingXp /
                requiredXp *
                100
            )
    };
  }


  /* =======================================================
     HOME SCREEN SYNCHRONIZATION
  ======================================================= */

  function setElementText(
    id,
    value
  ) {
    var element =
      document.getElementById(
        id
      );

    if (element) {
      element.textContent =
        String(value);
    }
  }


  function synchronizeHomeScreen() {
    synchronizeCurrencies();


    var levelInformation =
      calculateLevel(
        progressionState.totalXp
      );


    setElementText(
      "homePlayerLevel",
      levelInformation.level
    );


    setElementText(
      "homeNovaCoins",
      progressionState.coins
    );


    setElementText(
      "homeNovaCrystals",
      progressionState.crystals
    );


    var levelBar =
      document.getElementById(
        "homeLevelProgress"
      );


    if (levelBar) {
      levelBar.style.width =
        levelInformation.percent
          .toFixed(1) +
        "%";
    }
  }


  /* =======================================================
     HOME TOAST
  ======================================================= */

  function showProgressionToast(
    message
  ) {
    var toast =
      document.getElementById(
        "homeActionToast"
      );


    if (!toast) {
      return;
    }


    window.clearTimeout(
      toastTimer
    );


    toast.textContent =
      message;


    toast.classList.add(
      "is-visible"
    );


    toastTimer =
      window.setTimeout(
        function () {
          toast.classList.remove(
            "is-visible"
          );
        },
        2600
      );
  }


  /* =======================================================
     PROGRESSION EVENTS
  ======================================================= */

  function sendProgressionEvent(
    type,
    data
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "runnova-progression-updated",
        {
          detail: {
            type: type,

            data:
              data || null,

            summary:
              getProgressionSummary()
          }
        }
      )
    );
  }


  /* =======================================================
     DAILY CHALLENGES
  ======================================================= */

  function getDailyProgress() {
    var savedDailyProgress =
      null;


    try {
      savedDailyProgress =
        JSON.parse(
          readStorage(
            STORAGE_KEYS.dailyProgress +
            getTodayKey()
          ) || "null"
        );
    } catch (error) {
      savedDailyProgress =
        null;
    }


    var progressValues =
      savedDailyProgress &&
      Array.isArray(
        savedDailyProgress.progress
      )
        ? savedDailyProgress.progress
        : [0, 0, 0];


    return {
      progress: [
        positiveInteger(
          progressValues[0],
          0
        ),

        positiveInteger(
          progressValues[1],
          0
        ),

        positiveInteger(
          progressValues[2],
          0
        )
      ]
    };
  }


  function saveDailyProgress(
    dailyProgress
  ) {
    writeStorage(
      STORAGE_KEYS.dailyProgress +
      getTodayKey(),

      JSON.stringify(
        dailyProgress
      )
    );
  }


  function updateDailyProgress(
    distance,
    tokens,
    laneChanges
  ) {
    var dailyProgress =
      getDailyProgress();


    /*
     * Distance challenge uses the longest single run.
     */

    dailyProgress.progress[0] =
      Math.max(
        dailyProgress.progress[0],

        positiveInteger(
          distance,
          0
        )
      );


    /*
     * Tokens and lane changes accumulate throughout the day.
     */

    dailyProgress.progress[1] +=
      positiveInteger(
        tokens,
        0
      );


    dailyProgress.progress[2] +=
      positiveInteger(
        laneChanges,
        0
      );


    saveDailyProgress(
      dailyProgress
    );
  }


  function isDailyChallengeComplete() {
    var progress =
      getDailyProgress().progress;


    return (
      progress[0] >= 400 &&
      progress[1] >= 12 &&
      progress[2] >= 25
    );
  }


  function hasClaimedDailyBonus() {
    return (
      readStorage(
        STORAGE_KEYS.dailyBonus +
        getTodayKey()
      ) === "claimed"
    );
  }


  function refreshDailyBonusButton() {
    var bonusButton =
      document.getElementById(
        "dailyBonusBtn"
      );


    if (!bonusButton) {
      return;
    }


    if (
      hasClaimedDailyBonus()
    ) {
      bonusButton.disabled =
        true;

      bonusButton.textContent =
        "BONUS CLAIMED";

      return;
    }


    if (
      isDailyChallengeComplete()
    ) {
      bonusButton.disabled =
        false;

      bonusButton.textContent =
        "CLAIM DAILY BONUS";

      return;
    }


    bonusButton.disabled =
      true;

    bonusButton.textContent =
      "COMPLETE ALL CHALLENGES";
  }


  function claimDailyBonus() {
    if (
      hasClaimedDailyBonus()
    ) {
      showProgressionToast(
        "Today's daily bonus is already claimed."
      );

      refreshDailyBonusButton();

      return false;
    }


    if (
      !isDailyChallengeComplete()
    ) {
      showProgressionToast(
        "Complete all three daily challenges first."
      );

      refreshDailyBonusButton();

      return false;
    }


    addCoins(
      100,
      false
    );


    writeStorage(
      STORAGE_KEYS.dailyBonus +
      getTodayKey(),

      "claimed"
    );


    refreshDailyBonusButton();


    showProgressionToast(
      "Daily bonus claimed: +100 Nova Coins"
    );


    sendProgressionEvent(
      "daily-bonus",
      100
    );


    return true;
  }


  /* =======================================================
     CURRENCY FUNCTIONS
  ======================================================= */

  function addCoins(
    amount,
    showMessage
  ) {
    amount =
      positiveInteger(
        amount,
        0
      );


    if (!amount) {
      return progressionState.coins;
    }


    synchronizeCurrencies();


    progressionState.coins +=
      amount;


    saveProgressionState();
    synchronizeHomeScreen();


    if (showMessage !== false) {
      showProgressionToast(
        "+" +
        amount +
        " Nova Coins"
      );
    }


    sendProgressionEvent(
      "coins",
      amount
    );


    return progressionState.coins;
  }


  function addCrystals(
    amount,
    showMessage
  ) {
    amount =
      positiveInteger(
        amount,
        0
      );


    if (!amount) {
      return progressionState.crystals;
    }


    synchronizeCurrencies();


    progressionState.crystals +=
      amount;


    saveProgressionState();
    synchronizeHomeScreen();


    if (showMessage !== false) {
      showProgressionToast(
        "+" +
        amount +
        " Nova Crystals"
      );
    }


    sendProgressionEvent(
      "crystals",
      amount
    );


    return progressionState.crystals;
  }


  /* =======================================================
     GAME VALUE HELPERS
  ======================================================= */

  function getGlobalNumber(
    name,
    fallback
  ) {
    return safeNumber(
      window[name],
      fallback
    );
  }


  function getCurrentDistance() {
    return Math.max(
      0,

      getGlobalNumber(
        "distance",
        0
      )
    );
  }


  function getCurrentTokens() {
    /*
     * The legacy gameplay variable is still named "shards".
     */

    return Math.max(
      0,

      getGlobalNumber(
        "shards",
        0
      )
    );
  }


  function getDestroyedDrones() {
    return Math.max(
      0,

      getGlobalNumber(
        "dronesDestroyed",
        0
      )
    );
  }


  function getCurrentLane() {
    var lane =
      getGlobalNumber(
        "currentLane",
        NaN
      );


    return Number.isFinite(lane)
      ? lane
      : null;
  }


  function getSelectedDifficulty() {
    var difficulty =
      window.selectedDifficulty;


    if (
      typeof difficulty !==
      "string"
    ) {
      var difficultySelect =
        document.getElementById(
          "difficultySelect"
        );

      difficulty =
        difficultySelect
          ? difficultySelect.value
          : "normal";
    }


    return difficulty;
  }


  /* =======================================================
     RUN TRACKING
  ======================================================= */

  function beginProgressionRun() {
    currentRun.active =
      true;

    currentRun.finalized =
      false;

    currentRun.previousLane =
      getCurrentLane();

    currentRun.laneChanges =
      0;

    currentRun.distance =
      0;

    currentRun.tokens =
      0;

    currentRun.drones =
      0;
  }


  function updateProgressionRun() {
    if (!currentRun.active) {
      return;
    }


    currentRun.distance =
      Math.max(
        currentRun.distance,
        getCurrentDistance()
      );


    currentRun.tokens =
      Math.max(
        currentRun.tokens,
        getCurrentTokens()
      );


    currentRun.drones =
      Math.max(
        currentRun.drones,
        getDestroyedDrones()
      );


    var currentLane =
      getCurrentLane();


    if (
      currentLane !== null &&
      currentRun.previousLane !== null &&
      currentLane !==
        currentRun.previousLane
    ) {
      currentRun.laneChanges +=
        1;
    }


    if (currentLane !== null) {
      currentRun.previousLane =
        currentLane;
    }
  }


  /* =======================================================
     MISSION INFORMATION
  ======================================================= */

  function getCompletedMissionCount() {
    if (
      typeof window.getMissionSummary !==
      "function"
    ) {
      return 0;
    }


    try {
      var missionSummary =
        window.getMissionSummary();


      return positiveInteger(
        missionSummary &&
        missionSummary.completed,
        0
      );
    } catch (error) {
      return 0;
    }
  }


  function getDifficultyMultiplier(
    difficulty
  ) {
    if (difficulty === "hard") {
      return 1.18;
    }


    if (difficulty === "easy") {
      return 0.92;
    }


    return 1;
  }


  /* =======================================================
     FINALIZE A RUN
  ======================================================= */

  function finalizeProgressionRun(
    runData
  ) {
    if (currentRun.finalized) {
      return null;
    }


    runData =
      runData || {};


    updateProgressionRun();


    var finalDistance =
      positiveInteger(
        runData.distance,

        Math.max(
          currentRun.distance,
          getCurrentDistance()
        )
      );


    var finalTokens =
      positiveInteger(
        runData.tokens,

        Math.max(
          currentRun.tokens,
          getCurrentTokens()
        )
      );


    var finalDrones =
      positiveInteger(
        runData.drones,

        Math.max(
          currentRun.drones,
          getDestroyedDrones()
        )
      );


    var finalLaneChanges =
      positiveInteger(
        runData.laneChanges,

        currentRun.laneChanges
      );


    var completedMissions =
      positiveInteger(
        runData.missionsCompleted,

        getCompletedMissionCount()
      );


    var difficulty =
      typeof runData.difficulty ===
        "string"
        ? runData.difficulty
        : getSelectedDifficulty();


    var difficultyMultiplier =
      getDifficultyMultiplier(
        difficulty
      );


    /*
     * XP reward calculation.
     */

    var earnedXp =
      Math.max(
        0,

        Math.floor(
          (
            finalDistance / 7 +
            finalTokens * 4 +
            finalDrones * 12 +
            completedMissions * 30
          ) *
          difficultyMultiplier
        )
      );


    /*
     * Nova Coin reward calculation.
     */

    var earnedCoins =
      Math.max(
        finalDistance > 0
          ? 5
          : 0,

        Math.floor(
          finalDistance / 40 +
          finalTokens * 2 +
          completedMissions * 15 +
          (
            difficulty === "hard"
              ? 8
              : 0
          )
        )
      );


    var previousLevel =
      calculateLevel(
        progressionState.totalXp
      ).level;


    synchronizeCurrencies();


    progressionState.totalXp +=
      earnedXp;


    progressionState.coins +=
      earnedCoins;


    progressionState.totalRuns +=
      1;


    progressionState.totalDistance +=
      finalDistance;


    progressionState.bestDistance =
      Math.max(
        progressionState.bestDistance,
        finalDistance
      );


    progressionState.totalTokens +=
      finalTokens;


    progressionState.totalLaneChanges +=
      finalLaneChanges;


    progressionState.totalDrones +=
      finalDrones;


    updateDailyProgress(
      finalDistance,
      finalTokens,
      finalLaneChanges
    );


    saveProgressionState();
    synchronizeHomeScreen();
    refreshDailyBonusButton();


    currentRun.active =
      false;

    currentRun.finalized =
      true;


    var newLevel =
      calculateLevel(
        progressionState.totalXp
      ).level;


    if (
      newLevel >
      previousLevel
    ) {
      showProgressionToast(
        "Level up! You reached Level " +
        newLevel
      );
    } else if (
      earnedCoins > 0 ||
      earnedXp > 0
    ) {
      showProgressionToast(
        "+" +
        earnedCoins +
        " Nova Coins · +" +
        earnedXp +
        " XP"
      );
    }


    var result = {
      distance:
        finalDistance,

      tokens:
        finalTokens,

      drones:
        finalDrones,

      laneChanges:
        finalLaneChanges,

      missionsCompleted:
        completedMissions,

      xpEarned:
        earnedXp,

      coinsEarned:
        earnedCoins,

      level:
        newLevel
    };


    sendProgressionEvent(
      "run-finalized",
      result
    );


    return result;
  }


  /* =======================================================
     PROGRESSION SUMMARY
  ======================================================= */

  function getProgressionSummary() {
    synchronizeCurrencies();


    var levelInformation =
      calculateLevel(
        progressionState.totalXp
      );


    return {
      level:
        levelInformation.level,

      currentXp:
        levelInformation.currentXp,

      requiredXp:
        levelInformation.requiredXp,

      levelPercent:
        levelInformation.percent,

      totalXp:
        progressionState.totalXp,

      coins:
        progressionState.coins,

      crystals:
        progressionState.crystals,

      totalRuns:
        progressionState.totalRuns,

      totalDistance:
        progressionState.totalDistance,

      bestDistance:
        progressionState.bestDistance,

      totalTokens:
        progressionState.totalTokens,

      totalLaneChanges:
        progressionState.totalLaneChanges,

      totalDrones:
        progressionState.totalDrones
    };
  }


  /* =======================================================
     GAMEPLAY LIFECYCLE HOOKS
  ======================================================= */

  function installGameplayHooks() {
    if (gameplayHooksInstalled) {
      return;
    }


    if (
      typeof window.beginRun !==
        "function" ||

      typeof window.updateGame !==
        "function" ||

      typeof window.endGame !==
        "function"
    ) {
      hookAttempts += 1;


      if (hookAttempts < 100) {
        window.setTimeout(
          installGameplayHooks,
          50
        );
      } else {
        console.warn(
          "RunNova H2B could not connect to the gameplay lifecycle."
        );
      }


      return;
    }


    var originalBeginRun =
      window.beginRun;

    var originalUpdateGame =
      window.updateGame;

    var originalEndGame =
      window.endGame;

    var originalReturnHome =
      typeof window.returnHome ===
        "function"
        ? window.returnHome
        : null;


    window.beginRun =
      function () {
        var result =
          originalBeginRun.apply(
            this,
            arguments
          );


        beginProgressionRun();


        return result;
      };


    window.updateGame =
      function () {
        var result =
          originalUpdateGame.apply(
            this,
            arguments
          );


        updateProgressionRun();


        return result;
      };


    window.endGame =
      function () {
        /*
         * Capture run values before the original endGame
         * function has a chance to reset gameplay variables.
         */

        updateProgressionRun();


        var capturedRunData = {
          distance:
            Math.max(
              currentRun.distance,
              getCurrentDistance()
            ),

          tokens:
            Math.max(
              currentRun.tokens,
              getCurrentTokens()
            ),

          drones:
            Math.max(
              currentRun.drones,
              getDestroyedDrones()
            ),

          laneChanges:
            currentRun.laneChanges,

          missionsCompleted:
            getCompletedMissionCount(),

          difficulty:
            getSelectedDifficulty()
        };


        var result =
          originalEndGame.apply(
            this,
            arguments
          );


        finalizeProgressionRun(
          capturedRunData
        );


        return result;
      };


    if (originalReturnHome) {
      window.returnHome =
        function () {
          var result =
            originalReturnHome.apply(
              this,
              arguments
            );


          synchronizeHomeScreen();


          return result;
        };
    }


    gameplayHooksInstalled =
      true;


    console.log(
      "RunNova H2B progression hooks connected."
    );
  }


  /* =======================================================
     BUTTON EVENTS
  ======================================================= */

  function handleProgressionClick(
    event
  ) {
    if (
      !event.target ||
      !event.target.closest
    ) {
      return;
    }


    var dailyBonusButton =
      event.target.closest(
        "#dailyBonusBtn"
      );


    if (dailyBonusButton) {
      event.preventDefault();
      event.stopImmediatePropagation();

      claimDailyBonus();

      return;
    }


    var levelButton =
      event.target.closest(
        "#homeLevelBtn"
      );


    if (levelButton) {
      event.preventDefault();
      event.stopImmediatePropagation();


      var levelInformation =
        calculateLevel(
          progressionState.totalXp
        );


      showProgressionToast(
        "Level " +
        levelInformation.level +
        " · " +
        levelInformation.currentXp +
        " / " +
        levelInformation.requiredXp +
        " XP"
      );
    }
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function initializeProgression() {
    saveProgressionState();

    synchronizeHomeScreen();

    refreshDailyBonusButton();


    document.addEventListener(
      "click",
      handleProgressionClick,
      true
    );


    /*
     * The daily button is dynamically created by
     * homePanels.js. Refresh it whenever panel HTML changes.
     */

    if (
      document.body &&
      typeof MutationObserver !==
        "undefined"
    ) {
      var panelObserver =
        new MutationObserver(
          function () {
            refreshDailyBonusButton();
          }
        );


      panelObserver.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );
    }


    window.setTimeout(
      installGameplayHooks,
      0
    );


    console.log(
      "RunNova H2B progression initialized."
    );
  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.RunNovaProgression = {
    getSummary:
      getProgressionSummary,

    getDailyState:
      getDailyProgress,

    isDailyComplete:
      isDailyChallengeComplete,

    hasClaimedDailyBonus:
      hasClaimedDailyBonus,

    claimDailyBonus:
      claimDailyBonus,

    addCoins:
      addCoins,

    addCrystals:
      addCrystals,

    synchronizeHome:
      synchronizeHomeScreen,

    startRun:
      beginProgressionRun,

    updateRun:
      updateProgressionRun,

    finalizeRun:
      finalizeProgressionRun
  };


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeProgression
    );
  } else {
    initializeProgression();
  }

})();
