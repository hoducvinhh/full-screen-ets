(() => {
  const READER_CONTAINER_SELECTOR = [
    '[class*="reader" i]',
    '[class*="comic" i]',
    '[class*="manga" i]',
    '[class*="chapter" i]',
    '[id*="reader" i]',
    '[id*="comic" i]',
    '[id*="manga" i]',
    '[id*="chapter" i]'
  ].join(",");
  const MIN_IMAGE_DIMENSION = 280;
  const MIN_IMAGE_AREA = 120000;

  function isVisibleImage(image) {
    if (
      !image.isConnected ||
      Math.max(image.naturalWidth, image.naturalHeight) < MIN_IMAGE_DIMENSION ||
      image.naturalWidth * image.naturalHeight < MIN_IMAGE_AREA ||
      !(image.currentSrc || image.src)
    ) {
      return false;
    }

    const rect = image.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    for (let element = image; element; element = element.parentElement) {
      const style = window.getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0
      ) {
        return false;
      }
    }

    return true;
  }

  function findImages() {
    const readerImages = [];
    const pageImages = [];

    for (const image of document.querySelectorAll("img")) {
      if (!isVisibleImage(image)) {
        continue;
      }

      const candidate = {
        src: image.currentSrc || image.src,
        alt: image.alt || "",
        width: image.naturalWidth,
        height: image.naturalHeight
      };

      pageImages.push(candidate);
      if (image.closest(READER_CONTAINER_SELECTOR)) {
        readerImages.push(candidate);
      }
    }

    return { readerImages, pageImages };
  }

  globalThis.__comicImageSelector = { findImages };
})();
