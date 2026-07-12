(function () {
  "use strict";

  var TUTORIAL_SEEN_KEY =
    "velocityRunnerTutorialSeen";

  var tutorialStepIndex = 0;
  var tutorialStartCallback = null;
  var tutorialElements = {};

  var tutorialSteps = [
    {
      icon: "↔",
      eyebrow: "MOVEMENT SYSTEM",
      title: "Move Through Neo Bharat",
      text:
        "Switch lanes quickly to avoid gates, barriers and incoming Trinetra attacks.",
      controls: [
        "PC: A / D or ← / →",
        "Mobile: Swipe left or right"
      ]
    },
    {
      icon: "↥",
      eyebrow: "SURVIVAL MOVES",
      title: "Jump and Slide",
      text:
        "Jump over low obstacles and slide beneath elevated barriers. Correct timing protects your momentum.",
      controls: [
        "Jump: Space or ↑",
        "Slide: ↓",
        "Mobile: Use the on-screen controls"
      ]
    },
    {
      icon: "⚡",
      eyebrow: "SURYA ABILITY",
      title: "Activate Surya Dash",
      text:
        "Use Surya Dash when the ability is ready. It gives Aarav Astra a powerful burst through dangerous sections.",
      controls: [
        "Watch the ability meter",
        "Use the Surya Dash control when charged"
      ]
    },
    {
      icon: "◎",
      eyebrow: "COMBAT PROTOCOL",
      title: "Destroy Trinetra Drones",
      text:
        "Shoot hostile drones before they damage Aarav or the Surya Core. Keep moving while attacking.",
      controls: [
        "PC: Press F to shoot",
        "Mobile: Tap the Shoot button"
      ]
    },
    {
      icon: "◆",
      eyebrow: "CORE DEFENCE",
      title: "Protect the Surya Core",
      text:
        "The Core health bar shows the safety of Bharat's energy source. Enemy attacks can reduce it, so do not let the Core collapse.",
      controls: [
        "Watch Core Health",
        "Destroy threats early"
      ]
    },
    {
      icon: "✓",
      eyebrow: "MISSION NETWORK",
      title: "Complete Active Missions",
      text:
        "Run farther, collect Surya Shards, destroy drones and defeat bosses to complete missions and earn bonus rewards.",
      controls: [
        "Track mission progress in the HUD",
        "Complete objectives during the same run"
      ]
    }
  ];

  function cacheTutorialElements() {
    tutorialElements.overlay =
      document.getElementById(
        "tutorialOverlay"
      );

    tutorialElements.eyebrow =
      document.getElementById(
        "tutorialEyebrow"
      );

    tutorialElements.icon =
      document.getElementById(
        "tutorialIcon"
      );

    tutorialElements.title =
      document.getElementById(
        "tutorialTitle"
      );

    tutorialElements.text =
      document.getElementById(
        "tutorialText"
      );

    tutorialElements.controls =
      document.getElementById(
        "tutorialControls"
      );

    tutorialElements.progress =
      document.getElementById(
        "tutorialProgress"
      );

    tutorialElements.previousButton =
      document.getElementById(
        "tutorialPreviousBtn"
      );

    tutorialElements.nextButton =
      document.getElementById(
        "tutorialNextBtn"
      );

    tutorialElements.skipButton =
      document.getElementById(
        "tutorialSkipBtn"
      );

    tutorialElements.closeButton =
      document.getElementById(
        "tutorialCloseBtn"
      );

    tutorialElements.helpButton =
      document.getElementById(
        "tutorialHelpBtn"
      );
  }

  function hasSeenTutorial() {
    try {
      return (
        localStorage.getItem(
          TUTORIAL_SEEN_KEY
        ) === "true"
      );
    } catch (error) {
      return false;
    }
  }

  function markTutorialSeen() {
    try {
      localStorage.setItem(
        TUTORIAL_SEEN_KEY,
        "true"
      );
    } catch (error) {
      /*
       * The game can still continue when
       * localStorage is unavailable.
       */
    }
  }

  function resetTutorial() {
    try {
      localStorage.removeItem(
        TUTORIAL_SEEN_KEY
      );
    } catch (error) {
      /*
       * No additional action is required.
       */
    }
  }

  function renderTutorialStep() {
    var step =
      tutorialSteps[tutorialStepIndex];

    if (
      !step ||
      !tutorialElements.overlay
    ) {
      return;
    }

    tutorialElements.eyebrow.textContent =
      step.eyebrow;

    tutorialElements.icon.textContent =
      step.icon;

    tutorialElements.title.textContent =
      step.title;

    tutorialElements.text.textContent =
      step.text;

    tutorialElements.progress.textContent =
      String(tutorialStepIndex + 1) +
      " / " +
      String(tutorialSteps.length);

    tutorialElements.controls.innerHTML =
      "";

    step.controls.forEach(
      function (controlText) {
        var chip =
          document.createElement("span");

        chip.className =
          "tutorial-control-chip";

        chip.textContent = controlText;

        tutorialElements.controls.appendChild(
          chip
        );
      }
    );

    tutorialElements.previousButton.disabled =
      tutorialStepIndex === 0;

    tutorialElements.nextButton.textContent =
      tutorialStepIndex ===
      tutorialSteps.length - 1
        ? "Start Run"
        : "Next";
  }

  function openTutorial(callback) {
    if (!tutorialElements.overlay) {
      if (
        typeof callback === "function"
      ) {
        callback();
      }

      return;
    }

    tutorialStepIndex = 0;

    tutorialStartCallback =
      typeof callback === "function"
        ? callback
        : null;

    renderTutorialStep();

    tutorialElements.overlay.classList.add(
      "is-visible"
    );

    tutorialElements.overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "tutorial-open"
    );

    window.setTimeout(function () {
      tutorialElements.nextButton.focus();
    }, 50);
  }

  function closeTutorial(
    startGameAfterClose
  ) {
    var callback =
      tutorialStartCallback;

    if (!tutorialElements.overlay) {
      return;
    }

    tutorialElements.overlay.classList.remove(
      "is-visible"
    );

    tutorialElements.overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "tutorial-open"
    );

    tutorialStartCallback = null;

    if (startGameAfterClose) {
      markTutorialSeen();

      if (
        typeof callback === "function"
      ) {
        callback();
      }
    }
  }

  function showPreviousTutorialStep() {
    if (tutorialStepIndex <= 0) {
      return;
    }

    tutorialStepIndex -= 1;
    renderTutorialStep();
  }

  function showNextTutorialStep() {
    if (
      tutorialStepIndex <
      tutorialSteps.length - 1
    ) {
      tutorialStepIndex += 1;
      renderTutorialStep();
      return;
    }

    closeTutorial(true);
  }

  function startGameWithTutorial(
    startGameCallback
  ) {
    if (
      typeof startGameCallback !==
      "function"
    ) {
      console.error(
        "Velocity Runner: startGameWithTutorial requires a function."
      );

      return;
    }

    if (hasSeenTutorial()) {
      startGameCallback();
      return;
    }

    openTutorial(startGameCallback);
  }

  function bindTutorialEvents() {
    if (!tutorialElements.overlay) {
      console.warn(
        "Velocity Runner tutorial overlay was not found."
      );

      return;
    }

    tutorialElements.previousButton
      .addEventListener(
        "click",
        showPreviousTutorialStep
      );

    tutorialElements.nextButton
      .addEventListener(
        "click",
        showNextTutorialStep
      );

    tutorialElements.skipButton
      .addEventListener(
        "click",
        function () {
          closeTutorial(true);
        }
      );

    tutorialElements.closeButton
      .addEventListener(
        "click",
        function () {
          closeTutorial(
            Boolean(
              tutorialStartCallback
            )
          );
        }
      );

    if (
      tutorialElements.helpButton
    ) {
      tutorialElements.helpButton
        .addEventListener(
          "click",
          function () {
            openTutorial(null);
          }
        );
    }

    document.addEventListener(
      "keydown",
      function (event) {
        var tutorialIsVisible =
          tutorialElements.overlay
            .classList.contains(
              "is-visible"
            );

        if (!tutorialIsVisible) {
          return;
        }

        if (
          event.key === "ArrowLeft"
        ) {
          event.preventDefault();
          showPreviousTutorialStep();
        }

        if (
          event.key ===
            "ArrowRight" ||
          event.key === "Enter"
        ) {
          event.preventDefault();
          showNextTutorialStep();
        }

        if (
          event.key === "Escape" &&
          !tutorialStartCallback
        ) {
          event.preventDefault();
          closeTutorial(false);
        }
      }
    );
  }

  function initializeTutorial() {
    cacheTutorialElements();
    bindTutorialEvents();
    renderTutorialStep();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeTutorial
    );
  } else {
    initializeTutorial();
  }

  /*
   * Keep the previously confirmed
   * tutorial functions globally available.
   */

  window.openTutorial =
    openTutorial;

  window.closeTutorial =
    closeTutorial;

  window.renderTutorialStep =
    renderTutorialStep;

  window.showPreviousTutorialStep =
    showPreviousTutorialStep;

  window.startGameWithTutorial =
    startGameWithTutorial;

  window.VelocityTutorial = {
    openTutorial:
      openTutorial,

    closeTutorial:
      closeTutorial,

    renderTutorialStep:
      renderTutorialStep,

    showPreviousTutorialStep:
      showPreviousTutorialStep,

    startGameWithTutorial:
      startGameWithTutorial,

    hasSeenTutorial:
      hasSeenTutorial,

    resetTutorial:
      resetTutorial
  };
})();
