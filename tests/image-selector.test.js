const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const selectorScript = fs.readFileSync(
  path.join(__dirname, "..", "utils", "image-selector.js"),
  "utf8"
);

function createImage({
  src = "https://example.com/page.jpg",
  currentSrc = src,
  alt = "",
  width = 900,
  height = 1200,
  connected = true,
  displayed = true,
  inReader = false
} = {}) {
  return {
    src,
    currentSrc,
    alt,
    naturalWidth: width,
    naturalHeight: height,
    isConnected: connected,
    parentElement: null,
    getBoundingClientRect() {
      return { width: displayed ? 900 : 0, height: displayed ? 1200 : 0 };
    },
    closest() {
      return inReader ? {} : null;
    },
    computedStyle: {
      display: "block",
      visibility: "visible",
      opacity: "1"
    }
  };
}

function findImages(images) {
  const context = {
    document: {
      querySelectorAll(selector) {
        assert.equal(selector, "img");
        return images;
      }
    },
    window: {
      getComputedStyle(element) {
        return element.computedStyle;
      }
    },
    globalThis: {}
  };

  vm.runInNewContext(selectorScript, context);
  return context.globalThis.__comicImageSelector.findImages();
}

test("prioritizes eligible images inside a comic reader container", () => {
  const outside = createImage();
  const cover = createImage({
    src: "https://example.com/cover.jpg",
    inReader: true,
    alt: "Chapter page"
  });
  const nextPage = createImage({
    src: "https://example.com/page-2.jpg",
    inReader: true
  });

  const result = findImages([outside, cover, nextPage]);

  assert.deepEqual(
    Array.from(result.readerImages, (image) => image.src),
    ["https://example.com/cover.jpg", "https://example.com/page-2.jpg"]
  );
  assert.deepEqual(Array.from(result.pageImages, (image) => image.src), [
    "https://example.com/page.jpg",
    "https://example.com/cover.jpg",
    "https://example.com/page-2.jpg"
  ]);
  assert.equal(result.readerImages[0].alt, "Chapter page");
});

test("filters hidden, small, detached, and unloaded images", () => {
  const hidden = createImage({ displayed: false });
  const small = createImage({ width: 120, height: 120 });
  const detached = createImage({ connected: false });
  const unloaded = createImage({ width: 0, height: 0 });
  const faded = createImage();
  faded.computedStyle.opacity = "0";
  const eligible = createImage({ currentSrc: "https://cdn.example.com/original.webp" });

  const result = findImages([hidden, small, detached, unloaded, faded, eligible]);

  assert.deepEqual(Array.from(result.pageImages, (image) => image.src), [
    "https://cdn.example.com/original.webp"
  ]);
  assert.equal(result.pageImages[0].width, 900);
});

test("returns no candidates for a page without eligible images", () => {
  const result = findImages([
    createImage({ width: 200, height: 300 })
  ]);

  assert.equal(result.readerImages.length, 0);
  assert.equal(result.pageImages.length, 0);
});

test("keeps wide comic panels with enough original image area", () => {
  const panel = createImage({ width: 1200, height: 240 });

  const result = findImages([panel]);

  assert.equal(result.pageImages.length, 1);
});
