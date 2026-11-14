(() => {
  const imageCandidates = (images) => (Array.isArray(images) ? images : [])
    .filter((image) =>
      image &&
      typeof image.src === "string" &&
      image.src &&
      typeof image.width === "number" &&
      typeof image.height === "number"
    );

  function open(images) {
    if (window !== window.top) {
      return;
    }

    const candidates = imageCandidates(images);
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const state = {
      mode: "chooser",
      index: 0,
      cleaned: false
    };

    const styles = document.createElement("style");
    styles.textContent = `
      :host {
        all: initial;
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: block;
      }
      * { box-sizing: border-box; }
      .screen {
        width: 100%;
        height: 100%;
        color: #f4f4f4;
        background: #111;
        font: 16px/1.45 system-ui, sans-serif;
      }
      .chooser {
        display: grid;
        place-content: center;
        gap: 12px;
        padding: 28px;
      }
      h1 { margin: 0; font-size: 22px; }
      .description, .status { margin: 0; color: #c9c9c9; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; }
      button {
        border: 1px solid #777;
        border-radius: 6px;
        padding: 10px 14px;
        color: inherit;
        background: #282828;
        font: inherit;
        cursor: pointer;
      }
      button:hover { background: #3a3a3a; }
      button:disabled { opacity: .5; cursor: not-allowed; }
      .reader, .image-view {
        width: 100%;
        height: 100%;
        overflow: auto;
        background: #111;
      }
      .reader-header, .image-header {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 14px;
        background: rgb(17 17 17 / 90%);
      }
      .reader-pages {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
      }
      .reader-pages img {
        display: block;
        max-width: 100%;
        height: auto;
        object-fit: contain;
      }
      .image-view {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        overflow: hidden;
      }
      .image-stage {
        display: grid;
        place-items: center;
        min-width: 0;
        min-height: 0;
        padding: 8px;
      }
      .image-stage img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .page-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 14px;
        padding: 10px;
        background: rgb(17 17 17 / 90%);
      }
      .close { margin-left: auto; }
    `;

    const frame = document.createElement("div");
    shadow.append(styles, frame);
    document.documentElement.appendChild(host);

    function makeButton(label, className, handler) {
      const button = document.createElement("button");
      button.textContent = label;
      if (className) {
        button.className = className;
      }
      button.addEventListener("click", handler);
      return button;
    }

    function cleanup() {
      if (state.cleaned) {
        return;
      }
      state.cleaned = true;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      host.remove();
    }

    async function close() {
      if (document.fullscreenElement === host && typeof document.exitFullscreen === "function") {
        try {
          await document.exitFullscreen();
        } catch (error) {
          showStatus(error && error.message ? error.message : "Could not exit fullscreen.");
          cleanup();
          return;
        }
      }
      cleanup();
    }

    function onFullscreenChange() {
      if (state.mode !== "chooser" && document.fullscreenElement !== host) {
        cleanup();
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        void close();
        return;
      }
      if (state.mode !== "image") {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showImage(state.index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showImage(state.index + 1);
      }
    }

    function showStatus(message) {
      const status = shadow.querySelector(".status");
      if (status) {
        status.textContent = message;
      }
    }

    function requestFullscreen() {
      if (document.fullscreenElement && document.fullscreenElement !== host) {
        showStatus("Another element is already in fullscreen.");
        return;
      }
      if (document.fullscreenEnabled === false) {
        showStatus("Fullscreen is unavailable on this page.");
        return;
      }
      if (typeof host.requestFullscreen !== "function") {
        showStatus("Fullscreen is unavailable on this page.");
        return;
      }

      host.requestFullscreen().catch((error) => {
        showStatus(error && error.message ? error.message : "The browser denied fullscreen.");
      });
    }

    function showChooser() {
      state.mode = "chooser";
      frame.className = "screen chooser";
      frame.replaceChildren();

      const heading = document.createElement("h1");
      heading.textContent = "Chọn chế độ";
      const description = document.createElement("p");
      description.className = "description";
      description.textContent = candidates.length
        ? `Tìm thấy ${candidates.length} ảnh truyện phù hợp.`
        : "Không tìm thấy ảnh truyện phù hợp trên trang này.";
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(
        makeButton("Fullscreen video", "", () => {
          cleanup();
          void globalThis.__videoFullscreen.activate();
        }),
        makeButton("Fullscreen ảnh", "", () => {
          if (candidates.length) {
            showImage(0);
            requestFullscreen();
          }
        }),
        makeButton("Đọc truyện cuộn dọc", "", () => {
          if (candidates.length) {
            showReader();
            requestFullscreen();
          }
        }),
        makeButton("Đóng", "close", () => void close())
      );
      actions.children[1].disabled = candidates.length === 0;
      actions.children[2].disabled = candidates.length === 0;
      const status = document.createElement("p");
      status.className = "status";
      frame.append(heading, description, actions, status);
    }

    function showImage(index) {
      state.mode = "image";
      state.index = (index + candidates.length) % candidates.length;
      frame.className = "screen image-view";
      frame.replaceChildren();

      const header = document.createElement("header");
      header.className = "image-header";
      const label = document.createElement("span");
      label.textContent = `${state.index + 1} / ${candidates.length}`;
      const status = document.createElement("span");
      status.className = "status";
      const closeButton = makeButton("Đóng", "close", () => void close());
      header.append(label, status, closeButton);

      const stage = document.createElement("main");
      stage.className = "image-stage";
      const image = document.createElement("img");
      image.src = candidates[state.index].src;
      image.alt = candidates[state.index].alt;
      image.draggable = false;
      image.addEventListener("error", () => {
        showStatus("Could not load this original image in the viewer.");
      });
      stage.appendChild(image);

      const controls = document.createElement("footer");
      controls.className = "page-controls";
      controls.append(
        makeButton("← Trang trước", "", () => showImage(state.index - 1)),
        makeButton("Trang sau →", "", () => showImage(state.index + 1))
      );
      frame.append(header, stage, controls);
    }

    function showReader() {
      state.mode = "reader";
      frame.className = "screen reader";
      frame.replaceChildren();

      const header = document.createElement("header");
      header.className = "reader-header";
      const label = document.createElement("span");
      label.textContent = `Đọc truyện · ${candidates.length} ảnh`;
      const status = document.createElement("span");
      status.className = "status";
      header.append(label, status, makeButton("Đóng", "close", () => void close()));

      const pages = document.createElement("main");
      pages.className = "reader-pages";
      for (const candidate of candidates) {
        const image = document.createElement("img");
        image.src = candidate.src;
        image.alt = candidate.alt;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          showStatus("Could not load one of the original images in the reader.");
        });
        pages.appendChild(image);
      }
      frame.append(header, pages);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    showChooser();

    globalThis.__comicViewer = { open };
  }

  globalThis.__comicViewer = { open };
})();
