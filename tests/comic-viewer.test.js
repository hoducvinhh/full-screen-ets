const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const viewerScript = fs.readFileSync(
  path.join(__dirname, "..", "comic-viewer.js"),
  "utf8"
);

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = new Map();
    this.className = "";
    this.textContent = "";
    this.style = {};
    this.attributes = {};
    this.removed = false;
  }

  append(...elements) {
    this.children.push(...elements);
  }

  appendChild(element) {
    this.children.push(element);
    return element;
  }

  replaceChildren(...elements) {
    this.children = [...elements];
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  dispatch(type, event = {}) {
    const listener = this.listeners.get(type);
    if (listener) {
      listener({ preventDefault() {}, ...event });
    }
  }

  attachShadow() {
    this.shadowRoot = new FakeElement("shadow-root");
    return this.shadowRoot;
  }

  remove() {
    this.removed = true;
  }

  querySelector() {
    return null;
  }
}

function createViewer(images) {
  const documentListeners = new Map();
  const elements = [];
  let fullscreenRequests = 0;
  const document = {
    fullscreenElement: null,
    fullscreenEnabled: true,
    documentElement: new FakeElement("html"),
    createElement(tagName) {
      const element = new FakeElement(tagName);
      element.requestFullscreen = () => {
        fullscreenRequests += 1;
        document.fullscreenElement = element;
        const listener = documentListeners.get("fullscreenchange");
        if (listener) {
          listener();
        }
        return Promise.resolve();
      };
      elements.push(element);
      return element;
    },
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (documentListeners.get(type) === listener) {
        documentListeners.delete(type);
      }
    },
    exitFullscreen() {
      document.fullscreenElement = null;
      const listener = documentListeners.get("fullscreenchange");
      if (listener) {
        listener();
      }
      return Promise.resolve();
    }
  };
  const window = {};
  window.top = window;
  const context = {
    document,
    window,
    globalThis: {
      __videoFullscreen: {
        activate() {
          return Promise.resolve();
        }
      }
    },
    Promise
  };

  vm.runInNewContext(viewerScript, context);
  context.globalThis.__comicViewer.open(images);
  const host = document.documentElement.children[0];
  const frame = host.shadowRoot.children[1];
  const actions = frame.children[2];

  return {
    document,
    documentListeners,
    elements,
    host,
    frame,
    actions,
    get fullscreenRequests() {
      return fullscreenRequests;
    }
  };
}

const pages = [
  { src: "https://example.com/one.jpg", alt: "Page 1", width: 900, height: 1300 },
  { src: "https://example.com/two.jpg", alt: "Page 2", width: 900, height: 1300 }
];

test("fullscreen viewer preserves the original image source and supports next-page navigation", async () => {
  const { document, host, frame, actions } = createViewer(pages);

  actions.children[1].dispatch("click");
  await Promise.resolve();

  assert.equal(document.fullscreenElement, host);
  assert.equal(frame.children[1].children[0].src, pages[0].src);
  assert.equal(frame.children[1].children[0].alt, pages[0].alt);
  assert.match(host.shadowRoot.children[0].textContent, /object-fit: contain/);
  assert.doesNotMatch(host.shadowRoot.children[0].textContent, /filter:/);

  frame.children[2].children[1].dispatch("click");
  assert.equal(frame.children[1].children[0].src, pages[1].src);
});

test("continuous reader displays all selected pages in order", async () => {
  const { document, host, frame, actions } = createViewer(pages);

  actions.children[2].dispatch("click");
  await Promise.resolve();

  const readerPages = frame.children[1];
  assert.equal(document.fullscreenElement, host);
  assert.deepEqual(
    readerPages.children.map((image) => image.src),
    pages.map((page) => page.src)
  );
  assert.equal(readerPages.children[0].loading, "lazy");
});

test("escape exits fullscreen and removes the viewer", async () => {
  const { document, documentListeners, host, actions } = createViewer(pages);

  actions.children[1].dispatch("click");
  await Promise.resolve();
  documentListeners.get("keydown")({ key: "Escape" });
  await Promise.resolve();

  assert.equal(document.fullscreenElement, null);
  assert.equal(host.removed, true);
});

test("does not replace another element that is already fullscreen", () => {
  const { document, actions, fullscreenRequests } = createViewer(pages);
  const otherElement = {};
  document.fullscreenElement = otherElement;

  actions.children[1].dispatch("click");

  assert.equal(document.fullscreenElement, otherElement);
  assert.equal(fullscreenRequests, 0);
});
