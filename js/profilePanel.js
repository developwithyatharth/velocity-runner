/* =========================================================
   profilePanel.js — RunNova H2C

   Professional player profile and statistics dashboard.

   Important:
   Load this file BEFORE progression.js so its Level-button
   listener takes priority over the old progression toast.
========================================================= */

(function () {
  "use strict";

  var homeScreen = null;
  var overlay = null;
  var panelBody = null;
  var closeTimer = null;
  var initialized = false;


  /* =======================================================
     BASIC HELPERS
  ======================================================= */

  function getElement(id) {
    return document.getElementById(id);
  }


  function safeNumber(
    value,
    fallback
  ) {
    var converted =
      Number(value);

    return Number.isFinite(
      converted
    )
      ? converted
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


  function readStorage(key) {
    try {
      return window.localStorage.getItem(
        key
      );
    } catch (error) {
      return null;
    }
  }


  function getTodayKey() {
    var today =
      new Date();

    return [
      today.getFullYear(),

      String(
        today.getMonth() + 1
      ).padStart(2, "0"),

      String(
        today.getDate()
      ).padStart(2, "0")
    ].join("-");
  }


  function formatNumber(value) {
    return positiveInteger(
      value,
      0
    ).toLocaleString();
  }


  function formatDistance(value) {
    var distance =
      positiveInteger(
        value,
        0
      );

    if (distance >= 1000) {
      return (
        distance / 1000
      ).toFixed(
        distance >= 10000
          ? 0
          : 1
      ) + " km";
    }

    return distance + " m";
  }


  /* =======================================================
     LEVEL CALCULATION FALLBACK
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

    var requiredXp = 200;


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
     READ PROGRESSION
  ======================================================= */

  function getProgressionSummary() {
    if (
      window.RunNovaProgression &&
      typeof window.RunNovaProgression
        .getSummary === "function"
    ) {
      try {
        return window
          .RunNovaProgression
          .getSummary();
      } catch (error) {
        /*
         * Use local-storage fallback below.
         */
      }
    }


    var savedState = {};

    try {
      savedState =
        JSON.parse(
          readStorage(
            "runnovaProgression"
          ) || "{}"
        );
    } catch (error) {
      savedState = {};
    }


    var totalXp =
      positiveInteger(
        savedState.totalXp,
        0
      );

    var levelInformation =
      calculateLevel(
        totalXp
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
        totalXp,

      coins:
        Math.max(
          positiveInteger(
            savedState.coins,
            0
          ),

          positiveInteger(
            readStorage(
              "runnovaNovaCoins"
            ),
            0
          )
        ),

      crystals:
        Math.max(
          positiveInteger(
            savedState.crystals,
            0
          ),

          positiveInteger(
            readStorage(
              "runnovaNovaCrystals"
            ),
            0
          )
        ),

      totalRuns:
        positiveInteger(
          savedState.totalRuns,
          0
        ),

      totalDistance:
        positiveInteger(
          savedState.totalDistance,
          0
        ),

      bestDistance:
        positiveInteger(
          savedState.bestDistance,
          0
        ),

      totalTokens:
        positiveInteger(
          savedState.totalTokens,
          0
        ),

      totalLaneChanges:
        positiveInteger(
          savedState.totalLaneChanges,
          0
        ),

      totalDrones:
        positiveInteger(
          savedState.totalDrones,
          0
        )
    };
  }


  function getDailyProgress() {
    if (
      window.RunNovaProgression &&
      typeof window.RunNovaProgression
        .getDailyState === "function"
    ) {
      try {
        return window
          .RunNovaProgression
          .getDailyState();
      } catch (error) {
        /*
         * Use storage fallback.
         */
      }
    }


    var savedDaily = null;

    try {
      savedDaily =
        JSON.parse(
          readStorage(
            "runnovaDailyProgress:" +
            getTodayKey()
          ) || "null"
        );
    } catch (error) {
      savedDaily = null;
    }


    return {
      progress:
        savedDaily &&
        Array.isArray(
          savedDaily.progress
        )
          ? [
              positiveInteger(
                savedDaily.progress[0],
                0
              ),

              positiveInteger(
                savedDaily.progress[1],
                0
              ),

              positiveInteger(
                savedDaily.progress[2],
                0
              )
            ]
          : [0, 0, 0]
    };
  }


  function getRunnerName() {
    var nameElement =
      getElement(
        "homeProfileName"
      );

    var hiddenInput =
      getElement(
        "runnerNameInput"
      );

    var runnerName =
      nameElement
        ? nameElement.textContent.trim()
        : "";

    if (
      !runnerName &&
      hiddenInput
    ) {
      runnerName =
        hiddenInput.value.trim();
    }

    return (
      runnerName ||
      "NovaRider"
    );
  }


  /* =======================================================
     ACHIEVEMENTS
  ======================================================= */

  function getAchievements(
    summary
  ) {
    return [
      {
        icon: "▶",
        title: "First Launch",
        description:
          "Complete your first RunNova run.",

        current:
          summary.totalRuns,

        target: 1,

        unlocked:
          summary.totalRuns >= 1
      },

      {
        icon: "↟",
        title: "City Sprinter",
        description:
          "Reach a best distance of 1,000 metres.",

        current:
          summary.bestDistance,

        target: 1000,

        unlocked:
          summary.bestDistance >= 1000
      },

      {
        icon: "N",
        title: "Token Hunter",
        description:
          "Collect 100 Nova Tokens.",

        current:
          summary.totalTokens,

        target: 100,

        unlocked:
          summary.totalTokens >= 100
      },

      {
        icon: "◇",
        title: "Drone Breaker",
        description:
          "Destroy 10 enemy drones.",

        current:
          summary.totalDrones,

        target: 10,

        unlocked:
          summary.totalDrones >= 10
      },

      {
        icon: "∞",
        title: "Marathon Mindset",
        description:
          "Complete 10 total runs.",

        current:
          summary.totalRuns,

        target: 10,

        unlocked:
          summary.totalRuns >= 10
      },

      {
        icon: "★",
        title: "Nova Rising",
        description:
          "Reach player Level 5.",

        current:
          summary.level,

        target: 5,

        unlocked:
          summary.level >= 5
      }
    ];
  }


  /* =======================================================
     HTML BUILDERS
  ======================================================= */

  function buildStatCard(
    icon,
    label,
    value
  ) {
    return [
      '<article class="rn-profile-stat">',

      '  <span',
      '    class="rn-profile-stat-icon"',
      '    aria-hidden="true"',
      "  >" +
        icon +
        "</span>",

      "  <div>",

      "    <small>" +
        label +
        "</small>",

      "    <strong>" +
        value +
        "</strong>",

      "  </div>",

      "</article>"
    ].join("");
  }


  function buildDailyTask(
    title,
    current,
    target,
    suffix
  ) {
    var percent =
      Math.min(
        100,

        target > 0
          ? current /
            target *
            100
          : 0
      );


    return [
      '<article class="rn-profile-daily-task">',

      '  <div class="rn-profile-task-heading">',

      "    <strong>" +
        title +
        "</strong>",

      "    <span>" +
        Math.min(
          current,
          target
        ) +
        " / " +
        target +
        (
          suffix || ""
        ) +
        "</span>",

      "  </div>",

      '  <span class="rn-profile-progress-track">',

      '    <span',
      '      class="rn-profile-progress-fill"',
      '      style="width:' +
        percent.toFixed(1) +
        '%"',
      "    ></span>",

      "  </span>",

      "</article>"
    ].join("");
  }


  function buildAchievement(
    achievement
  ) {
    var percent =
      Math.min(
        100,

        achievement.target > 0
          ? achievement.current /
            achievement.target *
            100
          : 0
      );


    return [
      '<article class="rn-achievement-card ' +
        (
          achievement.unlocked
            ? "is-unlocked"
            : "is-locked"
        ) +
        '">',

      '  <span',
      '    class="rn-achievement-icon"',
      '    aria-hidden="true"',
      "  >" +
        achievement.icon +
        "</span>",

      '  <div class="rn-achievement-copy">',

      "    <h4>" +
        achievement.title +
        "</h4>",

      "    <p>" +
        achievement.description +
        "</p>",

      '    <span class="rn-profile-progress-track">',

      '      <span',
      '        class="rn-profile-progress-fill"',
      '        style="width:' +
        percent.toFixed(1) +
        '%"',
      "      ></span>",

      "    </span>",

      "  </div>",

      '  <span class="rn-achievement-status">',

      achievement.unlocked
        ? "UNLOCKED"
        : achievement.current +
          " / " +
          achievement.target,

      "  </span>",

      "</article>"
    ].join("");
  }


  /* =======================================================
     CREATE OVERLAY
  ======================================================= */

  function createProfileOverlay() {
    overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "homeProfileOverlay";

    overlay.className =
      "rn-profile-overlay";

    overlay.hidden = true;

    overlay.setAttribute(
      "role",
      "dialog"
    );

    overlay.setAttribute(
      "aria-modal",
      "true"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    overlay.setAttribute(
      "aria-labelledby",
      "rnProfileTitle"
    );


    overlay.innerHTML = [
      '<div',
      '  class="rn-profile-backdrop"',
      '  data-close-profile-panel',
      "></div>",

      '<section class="rn-profile-panel">',

      '  <button',
      '    type="button"',
      '    class="rn-profile-close"',
      '    aria-label="Close player profile"',
      "  >×</button>",

      '  <div',
      '    class="rn-profile-content"',
      '  ></div>',

      "</section>"
    ].join("");


    homeScreen.appendChild(
      overlay
    );


    panelBody =
      overlay.querySelector(
        ".rn-profile-content"
      );


    var closeButton =
      overlay.querySelector(
        ".rn-profile-close"
      );


    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeProfilePanel
      );
    }


    overlay.addEventListener(
      "click",
      function (event) {
        if (
          event.target &&
          event.target.hasAttribute(
            "data-close-profile-panel"
          )
        ) {
          closeProfilePanel();
        }
      }
    );
  }


  /* =======================================================
     PROFILE RENDERING
  ======================================================= */

  function renderProfilePanel() {
    if (!panelBody) {
      return;
    }


    var summary =
      getProgressionSummary();

    var daily =
      getDailyProgress();

    var dailyProgress =
      daily &&
      Array.isArray(
        daily.progress
      )
        ? daily.progress
        : [0, 0, 0];

    var achievements =
      getAchievements(
        summary
      );

    var unlockedCount =
      achievements.filter(
        function (achievement) {
          return achievement.unlocked;
        }
      ).length;


    panelBody.innerHTML = [
      '<header class="rn-profile-header">',

      '  <div class="rn-profile-avatar-large">',

      "    <span>NR</span>",

      "  </div>",

      '  <div class="rn-profile-identity">',

      '    <small class="rn-profile-eyebrow">',
      "      RUNNOVA PLAYER",
      "    </small>",

      '    <h2 id="rnProfileTitle">' +
        getRunnerName() +
        "</h2>",

      "    <p>",
      "      World Circuit Runner",
      "    </p>",

      "  </div>",

      '  <div class="rn-profile-level-ring"',

      '    style="--rn-level-progress:' +
        Math.min(
          100,
          safeNumber(
            summary.levelPercent,
            0
          )
        ).toFixed(1) +
        '%">',

      "    <small>LEVEL</small>",

      "    <strong>" +
        formatNumber(
          summary.level
        ) +
        "</strong>",

      "  </div>",

      "</header>",


      '<section class="rn-profile-xp-section">',

      '  <div class="rn-profile-section-heading">',

      "    <strong>",
      "      Level Progress",
      "    </strong>",

      "    <span>" +
        formatNumber(
          summary.currentXp
        ) +
        " / " +
        formatNumber(
          summary.requiredXp
        ) +
        " XP</span>",

      "  </div>",

      '  <span class="rn-profile-xp-track">',

      '    <span',
      '      class="rn-profile-xp-fill"',
      '      style="width:' +
        Math.min(
          100,
          safeNumber(
            summary.levelPercent,
            0
          )
        ).toFixed(1) +
        '%"',
      "    ></span>",

      "  </span>",

      "</section>",


      '<section class="rn-profile-currency-grid">',

      buildStatCard(
        "●",
        "NOVA COINS",
        formatNumber(
          summary.coins
        )
      ),

      buildStatCard(
        "◆",
        "NOVA CRYSTALS",
        formatNumber(
          summary.crystals
        )
      ),

      "</section>",


      '<section class="rn-profile-section">',

      '  <div class="rn-profile-title-row">',

      "    <div>",

      "      <small>",
      "        CAREER",
      "      </small>",

      "      <h3>",
      "        Runner Statistics",
      "      </h3>",

      "    </div>",

      '    <span class="rn-profile-section-pill">',
      "      ALL TIME",
      "    </span>",

      "  </div>",

      '  <div class="rn-profile-stats-grid">',

      buildStatCard(
        "▶",
        "TOTAL RUNS",
        formatNumber(
          summary.totalRuns
        )
      ),

      buildStatCard(
        "↟",
        "BEST DISTANCE",
        formatDistance(
          summary.bestDistance
        )
      ),

      buildStatCard(
        "∞",
        "TOTAL DISTANCE",
        formatDistance(
          summary.totalDistance
        )
      ),

      buildStatCard(
        "N",
        "NOVA TOKENS",
        formatNumber(
          summary.totalTokens
        )
      ),

      buildStatCard(
        "⇄",
        "LANE CHANGES",
        formatNumber(
          summary.totalLaneChanges
        )
      ),

      buildStatCard(
        "◇",
        "DRONES DESTROYED",
        formatNumber(
          summary.totalDrones
        )
      ),

      "  </div>",

      "</section>",


      '<section class="rn-profile-section">',

      '  <div class="rn-profile-title-row">',

      "    <div>",

      "      <small>",
      "        TODAY",
      "      </small>",

      "      <h3>",
      "        Daily Challenge",
      "      </h3>",

      "    </div>",

      '    <span class="rn-profile-section-pill">',
      "      " +
        getTodayKey() +
        "",
      "    </span>",

      "  </div>",

      '  <div class="rn-profile-daily-grid">',

      buildDailyTask(
        "Quick Start",
        positiveInteger(
          dailyProgress[0],
          0
        ),
        400,
        " m"
      ),

      buildDailyTask(
        "Nova Collector",
        positiveInteger(
          dailyProgress[1],
          0
        ),
        12,
        ""
      ),

      buildDailyTask(
        "Lane Master",
        positiveInteger(
          dailyProgress[2],
          0
        ),
        25,
        ""
      ),

      "  </div>",

      "</section>",


      '<section class="rn-profile-section">',

      '  <div class="rn-profile-title-row">',

      "    <div>",

      "      <small>",
      "        COLLECTION",
      "      </small>",

      "      <h3>",
      "        Achievements",
      "      </h3>",

      "    </div>",

      '    <span class="rn-profile-section-pill">' +
        unlockedCount +
        " / " +
        achievements.length +
        "</span>",

      "  </div>",

      '  <div class="rn-achievement-grid">',

      achievements
        .map(
          buildAchievement
        )
        .join(""),

      "  </div>",

      "</section>"
    ].join("");
  }


  /* =======================================================
     OPEN AND CLOSE
  ======================================================= */

  function openProfilePanel() {
    if (!overlay) {
      return;
    }


    window.clearTimeout(
      closeTimer
    );


    renderProfilePanel();


    overlay.hidden = false;

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );


    homeScreen.classList.add(
      "home-modal-active"
    );


    window.requestAnimationFrame(
      function () {
        overlay.classList.add(
          "is-open"
        );


        var closeButton =
          overlay.querySelector(
            ".rn-profile-close"
          );


        if (closeButton) {
          closeButton.focus();
        }
      }
    );
  }


  function closeProfilePanel() {
    if (
      !overlay ||
      overlay.hidden
    ) {
      return;
    }


    overlay.classList.remove(
      "is-open"
    );


    overlay.setAttribute(
      "aria-hidden",
      "true"
    );


    closeTimer =
      window.setTimeout(
        function () {
          overlay.hidden = true;


          var otherModal =
            homeScreen.querySelector(
              ".home-modal.is-open, " +
              "#homeHubOverlay.is-open"
            );


          if (!otherModal) {
            homeScreen.classList.remove(
              "home-modal-active"
            );
          }
        },
        240
      );
  }


  /* =======================================================
     LEVEL BUTTON
  ======================================================= */

  function handleLevelButtonClick(
    event
  ) {
    if (
      !event.target ||
      !event.target.closest
    ) {
      return;
    }


    var levelButton =
      event.target.closest(
        "#homeLevelBtn"
      );


    if (!levelButton) {
      return;
    }


    event.preventDefault();

    /*
     * Prevent the older progression.js Level toast.
     * profilePanel.js must load before progression.js.
     */

    event.stopImmediatePropagation();


    openProfilePanel();
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function initializeProfilePanel() {
    if (initialized) {
      return;
    }


    homeScreen =
      getElement("homeScreen");


    if (!homeScreen) {
      console.warn(
        "RunNova H2C: homeScreen was not found."
      );

      return;
    }


    if (
      getElement(
        "homeProfileOverlay"
      )
    ) {
      console.warn(
        "RunNova H2C profile panel already exists."
      );

      return;
    }


    initialized = true;


    createProfileOverlay();


    /*
     * Capture phase is required because progression.js also
     * listens for clicks on the Level button.
     */

    document.addEventListener(
      "click",
      handleLevelButtonClick,
      true
    );


    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Escape" &&
          overlay &&
          !overlay.hidden
        ) {
          closeProfilePanel();
        }
      }
    );


    window.addEventListener(
      "runnova-progression-updated",
      function () {
        if (
          overlay &&
          !overlay.hidden
        ) {
          renderProfilePanel();
        }
      }
    );


    var homeObserver =
      new MutationObserver(
        function () {
          if (
            !homeScreen.classList.contains(
              "active"
            )
          ) {
            closeProfilePanel();
          }
        }
      );


    homeObserver.observe(
      homeScreen,
      {
        attributes: true,
        attributeFilter: [
          "class"
        ]
      }
    );


    console.log(
      "RunNova H2C player profile initialized."
    );
  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.RunNovaProfilePanel = {
    open:
      openProfilePanel,

    close:
      closeProfilePanel,

    refresh:
      renderProfilePanel
  };


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeProfilePanel
    );
  } else {
    initializeProfilePanel();
  }

})();
