const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const backgroundScript = fs.readFileSync(
  path.join(__dirname, "..", "background.js"),
  "utf8"
);

test("opens the mode chooser on toolbar click", async () => {
  let onActionClicked;
  const injections = [];
  const chrome = {
    action: {
      onClicked: {
        addListener(listener) {
          onActionClicked = listener;
        }
      },
      setBadgeText() {
        return new Promise(() => {});
      },
      setTitle() {
        return new Promise(() => {});
      }
    },
    commands: {
      onCommand: {
        addListener() {}
      }
    },
    tabs: {
      query() {}
    },
    runtime: {
      id: "test-extension",
      onMessage: {
        addListener() {}
      }
    },
    scripting: {
      executeScript(details) {
        injections.push(details);
        return new Promise(() => {});
      }
    }
  };

  vm.runInNewContext(backgroundScript, { chrome, console });
  onActionClicked({ id: 17 });

  assert.equal(injections.length, 1);
  assert.equal(injections[0].target.tabId, 17);
  assert.equal(injections[0].target.allFrames, true);
  assert.deepEqual(Array.from(injections[0].files), [
    "utils/video-selector.js",
    "utils/video-fullscreen.js",
    "utils/image-selector.js",
    "comic-viewer.js"
  ]);
});

test("acknowledges fullscreen results sent by the content script", () => {
  let onMessage;
  let response;
  const chrome = {
    action: {
      onClicked: {
        addListener() {}
      },
      setBadgeBackgroundColor: async () => {},
      setBadgeText: async () => {},
      setTitle: async () => {}
    },
    commands: { onCommand: { addListener() {} } },
    tabs: { query() {} },
    runtime: {
      id: "test-extension",
      onMessage: {
        addListener(listener) {
          onMessage = listener;
        }
      }
    }
  };

  vm.runInNewContext(backgroundScript, { chrome, console });
  onMessage(
    { type: "video-fullscreen-result", status: "success" },
    { id: "test-extension", tab: { id: 17 } },
    (value) => {
      response = value;
    }
  );

  assert.equal(response.received, true);
});

test("keeps the fullscreen video command separate from the chooser action", () => {
  let onCommand;
  let onActionClicked;
  const queriedTabs = [];
  const chrome = {
    action: {
      onClicked: {
        addListener(listener) {
          onActionClicked = listener;
        }
      },
      setBadgeText: async () => {},
      setTitle: async () => {}
    },
    commands: {
      onCommand: {
        addListener(listener) {
          onCommand = listener;
        }
      }
    },
    tabs: {
      query(query, callback) {
        queriedTabs.push(query);
        callback([{ id: 29 }]);
      }
    },
    runtime: { id: "test-extension", onMessage: { addListener() {} } },
    scripting: {
      executeScript() {
        return Promise.resolve([]);
      }
    }
  };

  vm.runInNewContext(backgroundScript, { chrome, console });
  onActionClicked({ id: 17 });
  onCommand("fullscreen_video");

  assert.equal(queriedTabs[0].active, true);
  assert.equal(queriedTabs[0].lastFocusedWindow, true);
});

test("prefers reader images across frames and preserves their frame order", async () => {
  let onActionClicked;
  let viewerInvocation;
  let injectionCount = 0;
  const frameResults = [
    {
      frameId: 2,
      result: {
        readerImages: [{ src: "https://example.com/page-2.jpg", width: 900, height: 1200 }],
        pageImages: [{ src: "https://example.com/ad.jpg", width: 900, height: 1200 }]
      }
    },
    {
      frameId: 0,
      result: {
        readerImages: [],
        pageImages: [{ src: "https://example.com/cover.jpg", width: 900, height: 1200 }]
      }
    },
    {
      frameId: 1,
      result: {
        readerImages: [{ src: "https://example.com/page-1.jpg", width: 900, height: 1200 }],
        pageImages: []
      }
    }
  ];
  const chrome = {
    action: {
      onClicked: {
        addListener(listener) {
          onActionClicked = listener;
        }
      },
      setBadgeText: async () => {},
      setTitle: async () => {}
    },
    commands: { onCommand: { addListener() {} } },
    tabs: { query() {} },
    runtime: { id: "test-extension", onMessage: { addListener() {} } },
    scripting: {
      executeScript(details) {
        injectionCount += 1;
        if (injectionCount === 1) {
          return Promise.resolve([]);
        }
        if (details.target.allFrames) {
          return Promise.resolve(frameResults);
        }
        viewerInvocation = details;
        return Promise.resolve([]);
      }
    }
  };

  vm.runInNewContext(backgroundScript, { chrome, console });
  onActionClicked({ id: 17 });
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(
    Array.from(viewerInvocation.args[0], (image) => image.src),
    ["https://example.com/page-1.jpg", "https://example.com/page-2.jpg"]
  );
  assert.deepEqual(Array.from(viewerInvocation.target.frameIds), [0]);
});
