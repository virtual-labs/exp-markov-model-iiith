/**
 * Mobile Detection and Orientation Alert for POS Tagging - Hidden Markov Model Experiment
 * Alerts users on small screens to use landscape mode for better matrix interaction experience
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    mobileBreakpoint: 768, // Width below which we consider mobile
    tabletBreakpoint: 1024, // Width below which we consider tablet
    showAlertDelay: 1000, // Delay before showing alert (ms)
    alertDuration: 6000, // How long to show alert (ms)
    recheckInterval: 500, // How often to check orientation (ms)
    enableDebugMode: false, // Set to true for debugging
  };

  // State management
  let alertShown = false;
  let alertElement = null;
  let orientationCheckInterval = null;
  let isInitialized = false;
  let userDismissedAlert = false; // NEW: Track if user manually dismissed the alert
  let sessionStorage = window.sessionStorage || null; // For persistence across page interactions

  /**
   * Debug logging function
   */
  function debugLog(message, data = null) {
    if (CONFIG.enableDebugMode) {
      console.log(`[HMM-MobileDetection] ${message}`, data || "");
    }
  }

  /**
   * Check if user has previously dismissed the alert in this session
   */
  function hasUserDismissedAlert() {
    if (userDismissedAlert) return true;

    if (sessionStorage) {
      return sessionStorage.getItem("hmm-mobile-alert-dismissed") === "true";
    }

    return false;
  }

  /**
   * Mark alert as dismissed by user
   */
  function markAlertAsDismissed() {
    userDismissedAlert = true;

    if (sessionStorage) {
      sessionStorage.setItem("hmm-mobile-alert-dismissed", "true");
    }

    debugLog("Alert marked as dismissed by user");
  }

  /**
   * Reset dismissal state (useful for testing or if user rotates to landscape and back)
   */
  function resetDismissalState() {
    userDismissedAlert = false;

    if (sessionStorage) {
      sessionStorage.removeItem("hmm-mobile-alert-dismissed");
    }

    debugLog("Alert dismissal state reset");
  }

  /**
   * Check if device is mobile/tablet based on screen width
   */
  function isMobileDevice() {
    return window.innerWidth <= CONFIG.mobileBreakpoint;
  }

  /**
   * Check if device is tablet based on screen width
   */
  function isTabletDevice() {
    return (
      window.innerWidth > CONFIG.mobileBreakpoint &&
      window.innerWidth <= CONFIG.tabletBreakpoint
    );
  }

  /**
   * Check if device is in portrait orientation
   */
  function isPortraitOrientation() {
    return window.innerHeight > window.innerWidth;
  }

  /**
   * Get device orientation as string
   */
  function getOrientation() {
    if (screen.orientation) {
      return screen.orientation.angle === 0 || screen.orientation.angle === 180
        ? "portrait"
        : "landscape";
    }
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  /**
   * Create the alert overlay element
   */
  function createAlertElement() {
    if (alertElement) return alertElement;

    const overlay = document.createElement("div");
    overlay.id = "hmm-mobile-orientation-alert";
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.92);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            color: white;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `;

    const content = document.createElement("div");
    content.style.cssText = `
            max-width: 420px;
            margin: 0 auto;
            animation: slideInFade 0.4s ease-out;
        `;

    // Add CSS animations
    if (!document.getElementById("hmm-mobile-alert-styles")) {
      const style = document.createElement("style");
      style.id = "hmm-mobile-alert-styles";
      style.textContent = `
                @keyframes slideInFade {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes rotateMatrix {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(15deg) scale(1.05); }
                    50% { transform: rotate(0deg) scale(1.1); }
                    75% { transform: rotate(-15deg) scale(1.05); }
                }
                
                .matrix-animation {
                    animation: rotateMatrix 3s ease-in-out infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                .pulse-animation {
                    animation: pulse 2s ease-in-out infinite;
                }
            `;
      document.head.appendChild(style);
    }

    // Matrix icon representation
    const matrixIcon = document.createElement("div");
    matrixIcon.innerHTML = "📊";
    matrixIcon.style.cssText = `
            font-size: 4.5rem;
            margin-bottom: 1.2rem;
            display: block;
        `;
    matrixIcon.className = "matrix-animation";

    // Main heading
    const heading = document.createElement("h2");
    heading.textContent = "Matrix Interaction Optimized for Landscape";
    heading.style.cssText = `
            color: #4FC3F7;
            font-size: 1.6rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            line-height: 1.3;
        `;

    // Experiment title
    const expTitle = document.createElement("div");
    expTitle.textContent = "POS Tagging - Hidden Markov Model";
    expTitle.style.cssText = `
            color: #81C784;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            padding: 0.5rem 1rem;
            background: rgba(129, 199, 132, 0.15);
            border-radius: 20px;
            border: 1px solid rgba(129, 199, 132, 0.3);
        `;

    // Description
    const description = document.createElement("p");
    description.innerHTML = `
            This experiment involves <strong>interactive probability matrices</strong> for transition and emission calculations. For optimal experience with matrix editing and HMM visualization:
        `;
    description.style.cssText = `
            font-size: 1rem;
            line-height: 1.6;
            margin: 0 0 1.5rem 0;
            color: #E8E8E8;
        `;

    // Instructions list
    const instructions = document.createElement("ul");
    instructions.innerHTML = `
            <li>🔄 <strong>Rotate to landscape mode</strong> for matrix tables</li>
            <li>📱 <strong>Use tablet/desktop</strong> for best matrix interaction</li>
            <li>🎯 <strong>Matrix cells</strong> require precise input handling</li>
            <li>📊 <strong>Probability calculations</strong> need wider screen space</li>
        `;
    instructions.style.cssText = `
            text-align: left;
            font-size: 0.95rem;
            line-height: 1.7;
            margin: 0 0 1.5rem 0;
            padding-left: 0;
            list-style: none;
            color: #F0F0F0;
        `;

    // Instructions list items styling
    instructions.querySelectorAll("li").forEach((li, index) => {
      li.style.cssText = `
                margin-bottom: 0.8rem;
                padding-left: 0;
                animation-delay: ${index * 0.2}s;
            `;
      li.className = "pulse-animation";
    });

    // Feature highlights
    const features = document.createElement("div");
    features.innerHTML = `
            <div style="font-size: 0.85rem; color: #B0B0B0; margin-bottom: 1.5rem; font-style: italic;">
                ✨ Interactive transition matrices • Emission probability editing • Viterbi algorithm visualization
            </div>
        `;

    // Continue button
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue in Portrait Mode";
    continueBtn.style.cssText = `
            background: linear-gradient(45deg, #4FC3F7, #29B6F6);
            color: white;
            border: none;
            border-radius: 25px;
            padding: 14px 28px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin: 0.5rem 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
            min-width: 200px;
        `;

    // UPDATED: Continue button click handler to mark as dismissed
    continueBtn.addEventListener("click", () => {
      markAlertAsDismissed(); // Mark as dismissed before hiding
      hideAlert();
    });

    continueBtn.addEventListener("mouseover", () => {
      continueBtn.style.transform = "translateY(-2px)";
      continueBtn.style.boxShadow = "0 6px 20px rgba(79, 195, 247, 0.4)";
      continueBtn.style.background = "linear-gradient(45deg, #29B6F6, #0288D1)";
    });
    continueBtn.addEventListener("mouseout", () => {
      continueBtn.style.transform = "translateY(0)";
      continueBtn.style.boxShadow = "0 4px 15px rgba(79, 195, 247, 0.3)";
      continueBtn.style.background = "linear-gradient(45deg, #4FC3F7, #29B6F6)";
    });

    // Auto-dismiss info
    const autoInfo = document.createElement("div");
    autoInfo.innerHTML = `
            <div style="font-size: 0.8rem; color: #888; margin-top: 1.2rem; font-style: italic;">
                💡 Won't show again after you choose to continue in portrait mode
            </div>
        `;

    // Performance tip
    const performanceTip = document.createElement("div");
    performanceTip.innerHTML = `
            <div style="font-size: 0.75rem; color: #666; margin-top: 0.8rem; padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid #4FC3F7;">
                <strong>💡 Pro Tip:</strong> Matrix calculations and probability editing work best on screens ≥1024px wide
            </div>
        `;

    // Assemble the content
    content.appendChild(matrixIcon);
    content.appendChild(heading);
    content.appendChild(expTitle);
    content.appendChild(description);
    content.appendChild(instructions);
    content.appendChild(features);
    content.appendChild(continueBtn);
    content.appendChild(autoInfo);
    content.appendChild(performanceTip);

    overlay.appendChild(content);
    alertElement = overlay;

    debugLog("HMM Alert element created");
    return overlay;
  }

  /**
   * Show the orientation alert
   */
  function showAlert() {
    if (alertShown || !document.body || hasUserDismissedAlert()) {
      debugLog("Alert not shown - already shown, no body, or user dismissed");
      return;
    }

    debugLog("Showing HMM orientation alert");
    const alert = createAlertElement();
    document.body.appendChild(alert);
    alertShown = true;

    // Track analytics if available
    if (typeof gtag === "function") {
      gtag("event", "hmm_mobile_orientation_alert_shown", {
        device_width: window.innerWidth,
        device_height: window.innerHeight,
        orientation: getOrientation(),
        experiment: "pos_tagging_hmm",
      });
    }

    // Auto-hide after duration if still in portrait AND user hasn't dismissed
    setTimeout(() => {
      if (
        alertShown &&
        isMobileDevice() &&
        isPortraitOrientation() &&
        !hasUserDismissedAlert()
      ) {
        hideAlert();
      }
    }, CONFIG.alertDuration);
  }

  /**
   * Hide the orientation alert
   */
  function hideAlert() {
    if (!alertShown || !alertElement) return;

    debugLog("Hiding HMM orientation alert");

    // Fade out animation
    alertElement.style.transition =
      "opacity 0.4s ease-out, transform 0.4s ease-out";
    alertElement.style.opacity = "0";
    alertElement.style.transform = "scale(0.95)";

    setTimeout(() => {
      if (alertElement && alertElement.parentNode) {
        alertElement.parentNode.removeChild(alertElement);
      }
      alertElement = null;
      alertShown = false;
    }, 400);

    // Track analytics if available
    if (typeof gtag === "function") {
      gtag("event", "hmm_mobile_orientation_alert_dismissed", {
        orientation: getOrientation(),
        experiment: "pos_tagging_hmm",
        user_dismissed: hasUserDismissedAlert(),
      });
    }
  }

  /**
   * Check orientation and show/hide alert accordingly
   */
  function checkOrientationAndShowAlert() {
    const isMobile = isMobileDevice();
    const isTablet = isTabletDevice();
    const isPortrait = isPortraitOrientation();

    debugLog("HMM Orientation check", {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile,
      isTablet,
      isPortrait,
      orientation: getOrientation(),
      userDismissed: hasUserDismissedAlert(),
    });

    // UPDATED: Only show alert if user hasn't dismissed it
    if (isMobile && isPortrait && !alertShown && !hasUserDismissedAlert()) {
      setTimeout(showAlert, CONFIG.showAlertDelay);
    }
    // Hide alert if rotated to landscape or on larger screen
    else if (alertShown && (!isMobile || !isPortrait)) {
      hideAlert();
    }

    // UPDATED: Reset dismissal state if user goes to landscape mode
    // This allows the alert to show again if they rotate back to portrait
    if (!isMobile || !isPortrait) {
      if (hasUserDismissedAlert()) {
        resetDismissalState();
        debugLog(
          "Reset dismissal state - user is in landscape or on larger screen"
        );
      }
    }
  }

  /**
   * Handle orientation change events
   */
  function handleOrientationChange() {
    debugLog("HMM Orientation change detected");

    // Small delay to ensure accurate measurements after rotation
    setTimeout(() => {
      checkOrientationAndShowAlert();
    }, 150);
  }

  /**
   * Handle window resize events
   */
  function handleResize() {
    debugLog("HMM Window resize detected");
    checkOrientationAndShowAlert();
  }

  /**
   * Start periodic orientation checking
   */
  function startOrientationChecking() {
    if (orientationCheckInterval) return;

    orientationCheckInterval = setInterval(() => {
      checkOrientationAndShowAlert();
    }, CONFIG.recheckInterval);

    debugLog("Started HMM orientation checking interval");
  }

  /**
   * Stop periodic orientation checking
   */
  function stopOrientationChecking() {
    if (orientationCheckInterval) {
      clearInterval(orientationCheckInterval);
      orientationCheckInterval = null;
      debugLog("Stopped HMM orientation checking interval");
    }
  }

  /**
   * Initialize the mobile detection system
   */
  function initialize() {
    if (isInitialized) return;

    debugLog("Initializing HMM mobile detection system");

    // Initial check with slight delay to ensure page is ready
    setTimeout(() => {
      checkOrientationAndShowAlert();
    }, 200);

    // Event listeners
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleResize);

    // Start periodic checking for devices that don't fire orientation events reliably
    startOrientationChecking();

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopOrientationChecking();
      } else {
        startOrientationChecking();
        setTimeout(checkOrientationAndShowAlert, 100);
      }
    });

    // Handle focus events
    window.addEventListener("focus", () => {
      setTimeout(checkOrientationAndShowAlert, 100);
    });

    isInitialized = true;
    debugLog("HMM mobile detection system initialized");
  }

  /**
   * Public API for HMM experiment
   */
  window.HMMobileDetection = {
    init: initialize,
    checkOrientation: checkOrientationAndShowAlert,
    showAlert: showAlert,
    hideAlert: hideAlert,
    isInitialized: () => isInitialized,
    isMobile: isMobileDevice,
    isTablet: isTabletDevice,
    isPortrait: isPortraitOrientation,
    getOrientation: getOrientation,
    resetDismissal: resetDismissalState, // NEW: Allow manual reset
    config: CONFIG,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    // DOM is already ready
    setTimeout(initialize, 100);
  }

  debugLog("HMM Mobile detection script loaded");
})();
