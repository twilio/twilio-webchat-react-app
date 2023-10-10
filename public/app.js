window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  Twilio.initLogger("info");
  Twilio.initWebchat({
    deploymentKey: urlParams.get("deploymentKey"),
    region: urlParams.get("region"),
    theme: {
      isLight: true
    }
  })
});

