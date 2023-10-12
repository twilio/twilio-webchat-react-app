window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isLightTheme = urlParams.get("theme") === "light";
  const el = document.querySelector("[data-theme-pref]");

  el && el.setAttribute("data-theme-pref", isLightTheme ? "light-theme" : "dark-theme");

  Twilio.initLogger("info");
  Twilio.initWebchat({
    deploymentKey: urlParams.get("deploymentKey"),
    region: urlParams.get("region"),
    appStatus: urlParams.get("appStatus") || "open",
    theme: {
      isLight: isLightTheme
    }
  })
});
