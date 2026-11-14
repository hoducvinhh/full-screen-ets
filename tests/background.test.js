const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const backgroundScript = fs.readFileSync(
  path.join(__dirname, "..", "background.js"),
  "utf8"
);

test("injects immediately on toolbar click without waiting for badge updates", () => {
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
  assert.deepEqual(Array.from(injections[0].files), ["utils/video-selector.js", "content.js"]);
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
