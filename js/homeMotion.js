/* =========================================================
   homeMotion.js
   RunNova Phase H1E

   Premium home-screen animations and micro-interactions.
========================================================= */

(function () {
  "use strict";

  var homeScreen = null;
  var setupModal = null;
  var nameModal = null;

  var entranceTimer = null;

  var interactiveSelector = [
    ".home-name-card",
    ".home-level-card",
    ".home-event-card",
    ".home-currency",
    ".home-icon-button",
    ".home-nav-button",
    ".home-utility-button",
    ".runnova-play-button"
  ].join(",");


  /* =======================================================
     ENTRANCE ANIMATION
  ======================================================= */

  function prepareEntranceElements() {
    if (!homeScreen) {
      return;
    }

    var entranceElements = [
      ".runnova-topbar",
      ".runnova-brand",
      ".world-tour-card",
      ".reward-card",
      ".home-hero-stage",
      ".runnova-play-button",
      ".home-utility-actions",
      ".home-bottom-navigation"
    ];

    entranceElements.forEach(
      function (selector, index) {
        var element =
          homeScreen.querySelector(
            selector
          );

        if (!element) {
          return;
        }

        element.style.setProperty(
          "--rn-enter-delay",
          String(
            80 + index * 75
          ) + "ms"
        );
      }
    );
  }


  function playHomeEntrance() {
    if (!homeScreen) {
      return;
    }

    window.clearTimeout(
      entranceTimer
    );

    homeScreen.classList.add(
      "home-motion-enabled"
    );

    homeScreen.classList.remove(
      "home-motion-ready"
    );

    /*
     * Two animation frames ensure the browser registers
     * the initial position before starting the transition.
     */

    window.requestAnimationFrame(
      function () {
        window.requestAnimationFrame(
          function () {
            homeScreen.classList.add(
              "home-motion-ready"
            );
          }
        );
      }
    );
  }


  /* =======================================================
     POINTER LIGHTING
  ======================================================= */

  function updateElementLighting(
    element,
    event
  ) {
    var rectangle =
      element.getBoundingClientRect();

    var pointerX =
      event.clientX -
      rectangle.left;

    var pointerY =
      event.clientY -
      rectangle.top;

    var percentX =
      rectangle.width > 0
        ? pointerX /
          rectangle.width *
          100
        : 50;

    var percentY =
      rectangle.height > 0
        ? pointerY /
          rectangle.height *
          100
        : 50;

    element.style.setProperty(
      "--rn-light-x",
      percentX.toFixed(1) + "%"
    );

    element.style.setProperty(
      "--rn-light-y",
      percentY.toFixed(1) + "%"
    );
  }


  function resetElementLighting(
    element
  ) {
    element.style.setProperty(
      "--rn-light-x",
      "50%"
    );

    element.style.setProperty(
      "--rn-light-y",
      "50%"
    );
  }


  /* =======================================================
     CLICK RIPPLE
  ======================================================= */

  function createClickRipple(
    element,
    event
  ) {
    if (
      !element ||
      element.disabled
    ) {
      return;
    }

    var rectangle =
      element.getBoundingClientRect();

    var ripple =
      document.createElement(
        "span"
      );

    ripple.className =
      "rn-click-ripple";

    var rippleSize =
      Math.max(
        rectangle.width,
        rectangle.height
      ) * 1.35;

    var pointerX =
      typeof event.clientX ===
        "number"
        ? event.clientX -
          rectangle.left
        : rectangle.width * 0.5;

    var pointerY =
      typeof event.clientY ===
        "number"
        ? event.clientY -
          rectangle.top
        : rectangle.height * 0.5;

    ripple.style.width =
      rippleSize + "px";

    ripple.style.height =
      rippleSize + "px";

    ripple.style.left =
      pointerX -
      rippleSize * 0.5 +
      "px";

    ripple.style.top =
      pointerY -
      rippleSize * 0.5 +
      "px";

    element.appendChild(
      ripple
    );

    element.classList.add(
      "rn-button-pressed"
    );

    window.setTimeout(
      function () {
        element.classList.remove(
          "rn-button-pressed"
        );
      },
      160
    );

    window.setTimeout(
      function () {
        ripple.remove();
      },
      650
    );
  }


  /* =======================================================
     INTERACTIVE ELEMENTS
  ======================================================= */

  function initializeInteractiveLighting() {
    if (!homeScreen) {
      return;
    }

    var interactiveElements =
      homeScreen.querySelectorAll(
        interactiveSelector
      );

    interactiveElements.forEach(
      function (element) {
        resetElementLighting(
          element
        );

        element.addEventListener(
          "pointermove",
          function (event) {
            updateElementLighting(
              element,
              event
            );
          },
          {
            passive: true
          }
        );

        element.addEventListener(
          "pointerleave",
          function () {
            resetElementLighting(
              element
            );
          },
          {
            passive: true
          }
        );

        element.addEventListener(
          "click",
          function (event) {
            createClickRipple(
              element,
              event
            );
          }
        );
      }
    );
  }


  /* =======================================================
     MODAL FOCUS
  ======================================================= */

  function isModalOpen(
    modal
  ) {
    return Boolean(
      modal &&
      !modal.hidden &&
      modal.classList.contains(
        "is-open"
      )
    );
  }


  function synchronizeModalFocus() {
    if (!homeScreen) {
      return;
    }

    var modalOpen =
      isModalOpen(
        setupModal
      ) ||
      isModalOpen(
        nameModal
      );

    homeScreen.classList.toggle(
      "home-modal-active",
      modalOpen
    );
  }


  function observeModal(
    modal
  ) {
    if (!modal) {
      return;
    }

    var modalObserver =
      new MutationObserver(
        synchronizeModalFocus
      );

    modalObserver.observe(
      modal,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "hidden",
          "aria-hidden"
        ]
      }
    );
  }


  /* =======================================================
     HOME VISIBILITY
  ======================================================= */

  function observeHomeVisibility() {
    if (!homeScreen) {
      return;
    }

    var screenObserver =
      new MutationObserver(
        function () {
          var isActive =
            homeScreen.classList.contains(
              "active"
            );

          if (isActive) {
            entranceTimer =
              window.setTimeout(
                playHomeEntrance,
                80
              );
          } else {
            homeScreen.classList.remove(
              "home-motion-ready"
            );
          }
        }
      );

    screenObserver.observe(
      homeScreen,
      {
        attributes: true,
        attributeFilter: [
          "class"
        ]
      }
    );
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function initializeHomeMotion() {
    homeScreen =
      document.getElementById(
        "homeScreen"
      );

    setupModal =
      document.getElementById(
        "homeSetupModal"
      );

    nameModal =
      document.getElementById(
        "homeNameModal"
      );

    if (!homeScreen) {
      console.warn(
        "RunNova H1E: homeScreen was not found."
      );

      return;
    }

    prepareEntranceElements();
    initializeInteractiveLighting();

    observeModal(
      setupModal
    );

    observeModal(
      nameModal
    );

    observeHomeVisibility();

    playHomeEntrance();
    synchronizeModalFocus();

    console.log(
      "RunNova H1E premium home motion initialized."
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeHomeMotion
    );
  } else {
    initializeHomeMotion();
  }

})();
