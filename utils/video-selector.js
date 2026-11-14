(() => {
  function getVisibleArea(video) {
    if (!video.isConnected) {
      return 0;
    }

    const rect = video.getBoundingClientRect();
    const style = window.getComputedStyle(video);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0 ||
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return 0;
    }

    const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    return width * height;
  }

  function findBestVideo() {
    const visibleVideos = Array.from(document.querySelectorAll("video"))
      .map((video) => ({ video, area: getVisibleArea(video) }))
      .filter(({ area }) => area > 0);

    const playingVideos = visibleVideos
      .filter(({ video }) => !video.paused && !video.ended)
      .sort((left, right) => right.area - left.area);

    const candidate = playingVideos[0] || visibleVideos.sort((left, right) => right.area - left.area)[0];
    return candidate ? candidate.video : null;
  }

  globalThis.__videoFullscreenSelector = { findBestVideo };
})();
