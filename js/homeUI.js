/* =========================================================
   homeUI.js
   RunNova Home Interface — Phase H1A
========================================================= */

(function () {
  "use strict";

  var homeToastTimer = null;


  function getHomeElement(id) {
    return document.getElementById(id);
  }


  function initializeRunNovaHome() {
    var homeScreen =
      getHomeElement("homeScreen");

    var homePlayBtn =
      getHomeElement("homePlayBtn");

    var setupModal =
      getHomeElement("homeSetupModal");

    var closeSetupBtn =
      getHomeElement("closeHomeSetupBtn");

    var runnerNameInput =
      getHomeElement("runnerNameInput");

    var difficultySelect =
      getHomeElement("difficultySelect");

    var profileName =
      getHomeElement("homeProfileName");

    var homeToast =
      getHomeElement("homeActionToast");

    if (
      !homeScreen ||
      !homePlayBtn ||
      !setupModal
    ) {
      console.warn(
        "RunNova H1A home elements were not found."
      );

      return;
    }


    /* -----------------------------------------------------
       MODAL
    ----------------------------------------------------- */

    function openSetupModal() {
      setupModal.hidden = false;

      setupModal.setAttribute(
        "aria-hidden",
        "false"
      );

      window.requestAnimationFrame(
        function () {
          setupModal.classList.add(
            "is-open"
          );
        }
      );

      window.setTimeout(
        function () {
          if (
            runnerNameInput &&
            !runnerNameInput.value.trim()
          ) {
            runnerNameInput.focus();
          } else if (
            difficultySelect
          ) {
            difficultySelect.focus();
          }
        },
        180
      );
    }


    function closeSetupModal(
      immediately
    ) {
      setupModal.classList.remove(
        "is-open"
      );

      setupModal.setAttribute(
        "aria-hidden",
        "true"
      );

      if (immediately) {
        setupModal.hidden = true;
        return;
      }

      window.setTimeout(
        function () {
          if (
            !setupModal.classList.contains(
              "is-open"
            )
          ) {
            setupModal.hidden = true;
          }
        },
        230
      );
    }


    homePlayBtn.addEventListener(
      "click",
      openSetupModal
    );


    if (closeSetupBtn) {
      closeSetupBtn.addEventListener(
        "click",
        function () {
          closeSetupModal(false);

          homePlayBtn.focus();
        }
      );
    }


    setupModal.addEventListener(
      "click",
      function (event) {
        if (
          event.target &&
          event.target.hasAttribute(
            "data-close-home-modal"
          )
        ) {
          closeSetupModal(false);
        }
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Escape" &&
          !setupModal.hidden
        ) {
          closeSetupModal(false);

          homePlayBtn.focus();
        }
      }
    );


    /*
     * Once main.js switches from homeScreen to gameScreen,
     * automatically close the setup interface.
     */

    var homeScreenObserver =
      new MutationObserver(
        function () {
          if (
            !homeScreen.classList.contains(
              "active"
            )
          ) {
            closeSetupModal(true);
          }
        }
      );

    homeScreenObserver.observe(
      homeScreen,
      {
        attributes: true,
        attributeFilter: ["class"]
      }
    );


    /* -----------------------------------------------------
       PROFILE NAME
    ----------------------------------------------------- */

    var storedRunnerName = "";

    try {
      storedRunnerName =
        window.localStorage.getItem(
          "runnovaPlayerName"
        ) || "";
    } catch (error) {
      storedRunnerName = "";
    }


    if (
      runnerNameInput &&
      storedRunnerName &&
      !runnerNameInput.value
    ) {
      runnerNameInput.value =
        storedRunnerName;
    }


    function synchronizeProfileName() {
      if (
        !runnerNameInput ||
        !profileName
      ) {
        return;
      }

      var enteredName =
        runnerNameInput.value.trim();

      profileName.textContent =
        enteredName || "NovaRider";

      try {
        if (enteredName) {
          window.localStorage.setItem(
            "runnovaPlayerName",
            enteredName
          );
        }
      } catch (error) {
        /*
         * The game still works when storage is blocked.
         */
      }
    }


    if (runnerNameInput) {
      runnerNameInput.addEventListener(
        "input",
        synchronizeProfileName
      );

      synchronizeProfileName();
    }


    /* -----------------------------------------------------
       SAVED DIFFICULTY
    ----------------------------------------------------- */

    if (difficultySelect) {
      var savedDifficulty = "";

      try {
        savedDifficulty =
          window.localStorage.getItem(
            "runnovaDifficulty"
          ) || "";
      } catch (error) {
        savedDifficulty = "";
      }

      if (
        savedDifficulty === "easy" ||
        savedDifficulty === "normal" ||
        savedDifficulty === "hard"
      ) {
        difficultySelect.value =
          savedDifficulty;
      }

      difficultySelect.addEventListener(
        "change",
        function () {
          try {
            window.localStorage.setItem(
              "runnovaDifficulty",
              difficultySelect.value
            );
          } catch (error) {
            /*
             * Ignore blocked local storage.
             */
          }
        }
      );
    }


    /*
     * main.js owns start-button validation.
     * This call updates it after restoring saved values.
     */

    if (
      typeof updateStartButtonState ===
      "function"
    ) {
      updateStartButtonState();
    }


    /* -----------------------------------------------------
       HOME TOAST
    ----------------------------------------------------- */

    function showHomeToast(message) {
      if (!homeToast) {
        return;
      }

      window.clearTimeout(
        homeToastTimer
      );

      homeToast.textContent =
        message;

      homeToast.classList.add(
        "is-visible"
      );

      homeToastTimer =
        window.setTimeout(
          function () {
            homeToast.classList.remove(
              "is-visible"
            );
          },
          2400
        );
    }


    /* -----------------------------------------------------
       TEMPORARY HOME ACTIONS

       These buttons become full panels in later phases.
    ----------------------------------------------------- */

    var actionButtons =
      homeScreen.querySelectorAll(
        "[data-home-action]"
      );

    actionButtons.forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            var action =
              button.getAttribute(
                "data-home-action"
              );

            if (action === "missions") {
              showHomeToast(
                "Mission Center arrives in Phase H1D."
              );
            } else if (
              action === "daily"
            ) {
              showHomeToast(
                "Daily Challenges are being prepared."
              );
            } else if (
              action === "crew"
            ) {
              showHomeToast(
                "The Nova Crew character screen is coming soon."
              );
            } else if (
              action === "world-tour"
            ) {
              showHomeToast(
                "RunNova World Tour begins after the first city is ready."
              );
            } else if (
              action === "reward"
            ) {
              showHomeToast(
                "Free rewards will activate with the progression system."
              );
            } else if (
              action === "coins"
            ) {
              showHomeToast(
                "Nova Coins are earned during runs."
              );
            } else if (
              action === "crystals"
            ) {
              showHomeToast(
                "Nova Crystals will unlock special rewards later."
              );
            }
          }
        );
      }
    );


    var profileButton =
      getHomeElement("homeProfileBtn");

    if (profileButton) {
      profileButton.addEventListener(
        "click",
        function () {
          showHomeToast(
            "Runner Profile arrives with the Crew system."
          );
        }
      );
    }


    var settingsButton =
      getHomeElement(
        "homeSettingsBtn"
      );

    if (settingsButton) {
      settingsButton.addEventListener(
        "click",
        function () {
          showHomeToast(
            "Home settings will be connected in Phase H1D."
          );
        }
      );
    }


    /* -----------------------------------------------------
       POINTER PARALLAX
    ----------------------------------------------------- */

    function updateHomePointer(
      clientX,
      clientY
    ) {
      var screenWidth =
        Math.max(
          window.innerWidth,
          1
        );

      var screenHeight =
        Math.max(
          window.innerHeight,
          1
        );

      var normalizedX =
        (
          clientX /
          screenWidth -
          0.5
        ) * 2;

      var normalizedY =
        (
          clientY /
          screenHeight -
          0.5
        ) * 2;

      homeScreen.style.setProperty(
        "--pointer-x",
        normalizedX.toFixed(3)
      );

      homeScreen.style.setProperty(
        "--pointer-y",
        normalizedY.toFixed(3)
      );
    }


    homeScreen.addEventListener(
      "pointermove",
      function (event) {
        updateHomePointer(
          event.clientX,
          event.clientY
        );
      }
    );


    homeScreen.addEventListener(
      "pointerleave",
      function () {
        homeScreen.style.setProperty(
          "--pointer-x",
          "0"
        );

        homeScreen.style.setProperty(
          "--pointer-y",
          "0"
        );
      }
    );


    console.log(
      "RunNova H1A home interface initialized."
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeRunNovaHome
    );
  } else {
    initializeRunNovaHome();
  }

})();
