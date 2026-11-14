(() => {
  async function activate() {
    const report = (status, message) => {
      chrome.runtime.sendMessage(
        {
          type: "video-fullscreen-result",
          status,
          message
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Could not report the fullscreen result.", chrome.runtime.lastError.message);
          }
        }
      );
    };

    const video = globalThis.__videoFullscreenSelector.findBestVideo();
    if (!video) {
      report("not-found", "No eligible visible HTML5 video was found on this page.");
      return;
    }

    if (!video.isConnected) {
      report("removed", "The selected video was removed before fullscreen.");
      return;
    }

    if (document.fullscreenElement === video) {
      if (typeof document.exitFullscreen !== "function") {
        report("unsupported", "The browser does not support exiting fullscreen.");
        return;
      }

      try {
        await document.exitFullscreen();
        report("exited");
      } catch (error) {
        const message = error && error.message ? error.message : "The browser denied the fullscreen exit request.";
        report("error", message);
      }
      return;
    }

    if (document.fullscreenElement) {
      report("occupied", "Another element is already in fullscreen.");
      return;
    }

    if (
      document.fullscreenEnabled === false ||
      typeof video.requestFullscreen !== "function"
    ) {
      report("unsupported", "Fullscreen is not available for this video or page.");
      return;
    }

    const styleProperties = ["width", "height", "object-fit", "background-color"];
    const originalStyles = styleProperties.map((property) => ({
      property,
      value: video.style.getPropertyValue(property),
      priority: video.style.getPropertyPriority(property)
    }));
    let stylesRestored = false;

    const restoreStyles = () => {
      if (stylesRestored) {
        return;
      }
      stylesRestored = true;

      for (const original of originalStyles) {
        if (original.value) {
          video.style.setProperty(original.property, original.value, original.priority);
        } else {
          video.style.removeProperty(original.property);
        }
      }
    };

    const onFullscreenChange = () => {
      if (document.fullscreenElement !== video) {
        restoreStyles();
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      }
    };

    for (const [property, value] of [
      ["width", "100vw"],
      ["height", "100vh"],
      ["object-fit", "contain"],
      ["background-color", "black"]
    ]) {
      video.style.setProperty(property, value, "important");
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);

    try {
      await video.requestFullscreen();
      report("success");
    } catch (error) {
      restoreStyles();
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      const isDenied = error && (error.name === "NotAllowedError" || error.name === "SecurityError");
      const message = isDenied
        ? "The browser denied fullscreen. Activate the extension again from this page."
        : error && error.message
          ? error.message
          : "The browser denied the fullscreen request.";
      report(isDenied ? "denied" : "error", message);
    }
  }

  globalThis.__videoFullscreen = { activate };
})();
