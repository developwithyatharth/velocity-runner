/* leaderboard.js
   Local leaderboard system

   Features:
   - Saves top runs in localStorage
   - Shows home leaderboard
   - Shows game-over leaderboard
   - Shows in-game leaderboard popup
   - Close leaderboard buttons
   - Reopen leaderboard buttons
   - Clear scores option
*/

function getDifficultyLabel(level) {
  if (level === "easy") {
    return "Easy Runner";
  }

  if (level === "hard") {
    return "Hard Legend";
  }

  return "Normal Warrior";
}

function getLeaderboard() {
  const savedLeaderboard =
    localStorage.getItem(LEADERBOARD_KEY);

  if (!savedLeaderboard) {
    return [];
  }

  try {
    const parsedLeaderboard =
      JSON.parse(savedLeaderboard);

    return Array.isArray(parsedLeaderboard)
      ? parsedLeaderboard
      : [];
  } catch (error) {
    console.warn(
      "Leaderboard data could not be read.",
      error
    );

    return [];
  }
}

function saveLeaderboard(leaderboard) {
  localStorage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify(leaderboard)
  );
}

function saveScoreToLeaderboard(
  distanceScore,
  shardScore,
  playerName,
  difficultyLevel
) {
  const leaderboard = getLeaderboard();

  const runData = {
    name: playerName,
    distance: distanceScore,
    shards: shardScore,
    difficulty: difficultyLevel,
    date: new Date().toLocaleDateString()
  };

  leaderboard.push(runData);

  leaderboard.sort(function (firstRun, secondRun) {
    if (secondRun.distance !== firstRun.distance) {
      return secondRun.distance - firstRun.distance;
    }

    return secondRun.shards - firstRun.shards;
  });

  const topRuns = leaderboard.slice(
    0,
    LEADERBOARD_LIMIT
  );

  saveLeaderboard(topRuns);
}

function renderLeaderboardList(targetElement) {
  if (!targetElement) {
    return;
  }

  const leaderboard = getLeaderboard();

  targetElement.innerHTML = "";

  if (leaderboard.length === 0) {
    const emptyItem =
      document.createElement("li");

    emptyItem.className = "empty-score";

    emptyItem.textContent =
      "No runs yet. Become the first champion.";

    targetElement.appendChild(emptyItem);

    return;
  }

  leaderboard.forEach(function (run, index) {
    const item = document.createElement("li");

    const rank = index + 1;

    const safeName =
      typeof run.name === "string" && run.name.trim()
        ? run.name.trim()
        : "Unknown Runner";

    const safeDistance =
      Number(run.distance) || 0;

    const safeShards =
      Number(run.shards) || 0;

    const difficultyLabel =
      getDifficultyLabel(run.difficulty);

    const dateLabel =
      run.date || "Unknown date";

    item.innerHTML =
      "<b>#" +
      rank +
      " " +
      safeName +
      "</b><br>" +
      safeDistance +
      " m | " +
      safeShards +
      " shards | " +
      difficultyLabel +
      " | " +
      dateLabel;

    targetElement.appendChild(item);
  });
}

function renderLeaderboards() {
  renderLeaderboardList(homeLeaderboard);
  renderLeaderboardList(gameOverLeaderboard);
  renderLeaderboardList(gameLeaderboard);
}

function showLeaderboardCard(card) {
  if (!card) {
    return;
  }

  card.classList.remove("leaderboard-hidden");
}

function hideLeaderboardCard(card) {
  if (!card) {
    return;
  }

  card.classList.add("leaderboard-hidden");
}

function openGameLeaderboard() {
  if (!gameLeaderboardCard) {
    return;
  }

  renderLeaderboardList(gameLeaderboard);

  showLeaderboardCard(gameLeaderboardCard);
}

function closeGameLeaderboard() {
  hideLeaderboardCard(gameLeaderboardCard);
}

function clearLeaderboardScores() {
  const confirmClear = confirm(
    "Do you really want to clear all leaderboard scores?"
  );

  if (!confirmClear) {
    return;
  }

  localStorage.removeItem(LEADERBOARD_KEY);

  renderLeaderboards();
}

function clearGameLeaderboard() {
  const confirmClear = confirm(
    "Do you really want to clear all leaderboard scores?"
  );

  if (!confirmClear) {
    return;
  }

  localStorage.removeItem(LEADERBOARD_KEY);

  renderLeaderboards();

  showLeaderboardCard(gameLeaderboardCard);
}

function setupLeaderboardControls() {
  const closeButtons =
    document.querySelectorAll(
      ".leaderboard-close"
    );

  const clearButtons =
    document.querySelectorAll(
      ".leaderboard-clear"
    );

  closeButtons.forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        const card =
          button.closest(
            ".leaderboard-card"
          );

        hideLeaderboardCard(card);
      }
    );
  });

  clearButtons.forEach(function (button) {
    if (
      button.id ===
      "clearGameLeaderboardBtn"
    ) {
      return;
    }

    button.addEventListener(
      "click",
      clearLeaderboardScores
    );
  });

  if (showHomeLeaderboardBtn) {
    showHomeLeaderboardBtn.addEventListener(
      "click",
      function () {
        renderLeaderboardList(
          homeLeaderboard
        );

        showLeaderboardCard(
          homeLeaderboardCard
        );
      }
    );
  }

  if (showGameOverLeaderboardBtn) {
    showGameOverLeaderboardBtn.addEventListener(
      "click",
      function () {
        renderLeaderboardList(
          gameOverLeaderboard
        );

        showLeaderboardCard(
          gameOverLeaderboardCard
        );
      }
    );
  }

  if (showGameLeaderboardBtn) {
    showGameLeaderboardBtn.addEventListener(
      "click",
      openGameLeaderboard
    );
  }

  if (closeGameLeaderboardBtn) {
    closeGameLeaderboardBtn.addEventListener(
      "click",
      closeGameLeaderboard
    );
  }

  if (clearGameLeaderboardBtn) {
    clearGameLeaderboardBtn.addEventListener(
      "click",
      clearGameLeaderboard
    );
  }
}
