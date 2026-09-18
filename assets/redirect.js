(() => {
  const config = {
    dashboardUrl:
      "https://app.powerbi.com/Redirect?action=OpenApp&appId=27a310ca-809f-4fd0-8201-40e10da610ba&ctid=f9300280-65a0-46f8-a18c-a296431980f5&experience=power-bi",
    progressBarId: "progress-bar",
    manualLinkId: "manual-link",
    redirectedKey: "pmo-portal:redirected",
    redirectDelayMs: 1500,
    manualLinkDelayMs: 2500,
  };

  function redirectToDashboard() {
    window.location.replace(config.dashboardUrl);
  }

  // sessionStorage can throw in private browsing, strict cookie modes, embedded
  // WebViews, or file:// origins. Treat failures as first visits.
  function hasRedirectedThisSession() {
    try {
      return sessionStorage.getItem(config.redirectedKey) === "1";
    } catch (_) {
      return false;
    }
  }

  function markRedirectedThisSession() {
    try {
      sessionStorage.setItem(config.redirectedKey, "1");
    } catch (_) {
      /* storage unavailable; safe to ignore */
    }
  }

  function syncDashboardLinks() {
    document.querySelectorAll("[data-dashboard-link]").forEach((link) => {
      link.setAttribute("href", config.dashboardUrl);
    });
  }

  function setManualLinkVisibility(isVisible) {
    const manualLink = document.getElementById(config.manualLinkId);

    if (!manualLink) {
      return;
    }

    manualLink.hidden = !isVisible;
  }

  function startProgressBar(remainingMs) {
    const bar = document.getElementById(config.progressBarId);

    if (!bar) {
      return;
    }

    bar.setAttribute("aria-valuenow", "0");
    setTimeout(() => {
      bar.setAttribute("aria-valuenow", "100");
    }, remainingMs);
  }

  function scheduleRedirect() {
    // Anchor to navigation start so total time-to-redirect is consistent even
    // if the document takes a moment to parse.
    const elapsedMs = performance.now();
    const remainingMs = Math.max(0, config.redirectDelayMs - elapsedMs);

    startProgressBar(remainingMs);
    setTimeout(redirectToDashboard, remainingMs);
  }

  function init() {
    syncDashboardLinks();
    setManualLinkVisibility(false);
    setTimeout(() => setManualLinkVisibility(true), config.manualLinkDelayMs);

    if (hasRedirectedThisSession()) {
      redirectToDashboard();
      return;
    }

    markRedirectedThisSession();
    scheduleRedirect();
  }

  init();
})();
