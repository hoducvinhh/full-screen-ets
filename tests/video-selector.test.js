const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const selectorScript = fs.readFileSync(
  path.join(__dirname, "..", "utils", "video-selector.js"),
  "utf8"
);

function createVideo({
  left = 0,
  top = 0,
  width = 300,
  height = 200,
  paused = true,
  ended = false,
  connected = true,
  display = "block",
  visibility = "visible",
  opacity = "1"
} = {}) {
  return {
    paused,
    ended,
    isConnected: connected,
    getBoundingClientRect() {
      return { left, top, right: left + width, bottom: top + height, width, height };
    },
    computedStyle: { display, visibility, opacity }
  };
}

function selectVideo(videos) {
  const context = {
    document: {
      querySelectorAll() {
        return videos;
      }
    },
    window: {
      innerWidth: 1000,
      innerHeight: 800,
      getComputedStyle(video) {
        return video.computedStyle;
      }
    },
    Array,
    Math,
    Number
  };

  vm.runInNewContext(selectorScript, context);
  return context.__videoFullscreenSelector.findBestVideo();
}

test("selects the only visible playing video", () => {
  const playing = createVideo({ paused: false });
  const paused = createVideo({ left: 400, width: 700, height: 500 });

  assert.equal(selectVideo([paused, playing]), playing);
});

test("chooses the largest visible area among multiple playing videos", () => {
  const small = createVideo({ width: 300, height: 200, paused: false });
  const large = createVideo({ width: 700, height: 500, paused: false });

  assert.equal(selectVideo([small, large]), large);
});

test("falls back to the largest visible video when none is playing", () => {
  const small = createVideo({ width: 320, height: 180 });
  const large = createVideo({ width: 800, height: 600 });

  assert.equal(selectVideo([small, large]), large);
});

test("ignores hidden videos", () => {
  const hidden = createVideo({ width: 1000, height: 800, display: "none" });
  const visible = createVideo({ width: 400, height: 300 });

  assert.equal(selectVideo([hidden, visible]), visible);
});

test("ignores zero-sized videos", () => {
  const zeroSized = createVideo({ width: 0, height: 0 });

  assert.equal(selectVideo([zeroSized]), null);
});

test("uses viewport intersection area for partially offscreen videos", () => {
  const mostlyOutside = createVideo({ left: 900, width: 500, height: 500 });
  const fullyVisible = createVideo({ width: 300, height: 300 });

  assert.equal(selectVideo([mostlyOutside, fullyVisible]), fullyVisible);
});

test("ignores detached videos", () => {
  const detached = createVideo({ width: 900, height: 700, connected: false });
  const connected = createVideo({ width: 200, height: 100 });

  assert.equal(selectVideo([detached, connected]), connected);
});

test("returns null when the page contains no video", () => {
  assert.equal(selectVideo([]), null);
});
