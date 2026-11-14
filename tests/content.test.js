const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const contentScript = fs.readFileSync(
  path.join(__dirname, "..", "content.js"),
  "utf8"
);
const videoFullscreenScript = fs.readFileSync(
  path.join(__dirname, "..", "utils", "video-fullscreen.js"),
  "utf8"
);

function createVideo({ connected = true, requestFullscreen } = {}) {
  const properties = new Map();
  return {
    isConnected: connected,
    style: {
      getPropertyValue(property) {
        return properties.has(property) ? properties.get(property).value : "";
      },
      getPropertyPriority(property) {
        return properties.has(property) ? properties.get(property).priority : "";
      },
      setProperty(property, value, priority = "") {
        properties.set(property, { value, priority });
      },
      removeProperty(property) {
        properties.delete(property);
      }
    },
    requestFullscreen: requestFullscreen || (() => Promise.resolve())
  };
}

async function runContentScript({ video, fullscreenElement = null, fullscreenEnabled = true, exitFullscreen } = {}) {
  const messages = [];
  const listeners = new Map();
  const document = {
    fullscreenElement,
    fullscreenEnabled,
    exitFullscreen: exitFullscreen || (() => Promise.resolve()),
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
    removeEventListener(name, listener) {
      if (listeners.get(name) === listener) {
        listeners.delete(name);
      }
    }
  };
  const context = {
    chrome: {
      runtime: {
        lastError: null,
        sendMessage(message, callback) {
          messages.push(message);
          callback();
        }
      }
    },
    document,
    globalThis: {
      __videoFullscreenSelector: {
        findBestVideo() {
          return video || null;
        }
      }
    },
    Promise,
    console
  };

  await vm.runInNewContext(`${videoFullscreenScript}\n${contentScript}`, context);
  return { document, listeners, messages };
}

test("requests fullscreen and restores styles after fullscreenchange", async () => {
  const video = createVideo();
  const { document, listeners, messages } = await runContentScript({ video });

  assert.equal(video.style.getPropertyValue("object-fit"), "contain");
  assert.equal(messages[0].status, "success");

  document.fullscreenElement = null;
  listeners.get("fullscreenchange")();

  assert.equal(video.style.getPropertyValue("object-fit"), "");
  assert.equal(listeners.has("fullscreenchange"), false);
});

test("exits fullscreen when the selected video is already fullscreen", async () => {
  const video = createVideo();
  let exitCalls = 0;
  const { messages } = await runContentScript({
    video,
    fullscreenElement: video,
    exitFullscreen: () => {
      exitCalls += 1;
      return Promise.resolve();
    }
  });

  assert.equal(exitCalls, 1);
  assert.equal(messages[0].status, "exited");
});

test("does not replace another fullscreen element", async () => {
  const video = createVideo();
  const otherElement = {};
  const { messages } = await runContentScript({ video, fullscreenElement: otherElement });

  assert.equal(messages[0].status, "occupied");
  assert.equal(video.style.getPropertyValue("width"), "");
});

test("reports a removed video before making a fullscreen request", async () => {
  let requestCalls = 0;
  const video = createVideo({
    connected: false,
    requestFullscreen: () => {
      requestCalls += 1;
      return Promise.resolve();
    }
  });
  const { messages } = await runContentScript({ video });

  assert.equal(requestCalls, 0);
  assert.equal(messages[0].status, "removed");
});

test("reports when the fullscreen API is unavailable", async () => {
  const video = createVideo();
  video.requestFullscreen = undefined;
  const { messages } = await runContentScript({ video, fullscreenEnabled: false });

  assert.equal(messages[0].status, "unsupported");
});

test("classifies rejected user-activation requests clearly", async () => {
  const video = createVideo({
    requestFullscreen: () => Promise.reject(Object.assign(new Error("Not allowed"), { name: "NotAllowedError" }))
  });
  const { messages } = await runContentScript({ video });

  assert.equal(messages[0].status, "denied");
  assert.match(messages[0].message, /activate the extension again/i);
  assert.equal(video.style.getPropertyValue("object-fit"), "");
});
