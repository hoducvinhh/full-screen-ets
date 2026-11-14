const RESULT_MESSAGE = "video-fullscreen-result";

chrome.action.onClicked.addListener((tab) => {
  if (typeof tab.id === "number") {
    openModeChooser(tab.id);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "fullscreen_video") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
      if (tab && typeof tab.id === "number") {
        fullscreenVideoInTab(tab.id);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    !message ||
    message.type !== RESULT_MESSAGE ||
    sender.id !== chrome.runtime.id ||
    !sender.tab ||
    typeof sender.tab.id !== "number"
  ) {
    return;
  }

  sendResponse({ received: true });
  void showResult(sender.tab.id, message);
});

async function openModeChooser(tabId) {
  void clearResult(tabId);

  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: [
        "utils/video-selector.js",
        "utils/video-fullscreen.js",
        "utils/image-selector.js",
        "comic-viewer.js"
      ]
    });

    const frameResults = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: () => globalThis.__comicImageSelector.findImages()
    });
    const orderedResults = frameResults.sort((left, right) => left.frameId - right.frameId);
    const readerImages = [];
    const pageImages = [];

    for (const frameResult of orderedResults) {
      const result = frameResult.result;
      if (!result) {
        continue;
      }
      readerImages.push(...result.readerImages);
      pageImages.push(...result.pageImages);
    }

    const images = readerImages.length ? readerImages : pageImages;
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      func: (comicImages) => globalThis.__comicViewer.open(comicImages),
      args: [images]
    });
  } catch (error) {
    console.error("Could not open the comic mode chooser.", error);
    await showResult(tabId, {
      status: "error",
      message: "This page does not allow the extension to access its images."
    });
  }
}

function fullscreenVideoInTab(tabId) {
  void clearResult(tabId);

  chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ["utils/video-selector.js", "utils/video-fullscreen.js", "content.js"]
  }).catch(async (error) => {
    console.error("Could not run the fullscreen action in this tab.", error);
    await showResult(tabId, {
      status: "error",
      message: "This page does not allow the extension to access its video."
    });
  });
}

async function clearResult(tabId) {
  try {
    await chrome.action.setBadgeText({ tabId, text: "" });
    await chrome.action.setTitle({
      tabId,
      title: "Fullscreen the video on this page"
    });
  } catch (error) {
    console.error("Could not clear the previous fullscreen result.", error);
  }
}

async function showResult(tabId, result) {
  let badge;
  let title;
  let color;

  switch (result.status) {
    case "success":
      badge = "ON";
      title = "Video is in fullscreen";
      color = "#18794e";
      break;
    case "exited":
      badge = "OFF";
      title = "Exited video fullscreen";
      color = "#475467";
      break;
    case "not-found":
      badge = "!";
      title = "No eligible visible HTML5 video was found";
      color = "#b42318";
      break;
    case "unsupported":
      badge = "!";
      title = "Fullscreen is unavailable for this video or page";
      color = "#b42318";
      break;
    case "denied":
      badge = "!";
      title = "Fullscreen was denied; try activating the extension again";
      color = "#b42318";
      break;
    case "removed":
      badge = "!";
      title = "The selected video was removed before fullscreen";
      color = "#b42318";
      break;
    case "occupied":
      badge = "!";
      title = "Another element is already in fullscreen";
      color = "#b54708";
      break;
    default:
      badge = "!";
      title = typeof result.message === "string" && result.message
        ? result.message
        : "The video could not enter fullscreen";
      color = "#b42318";
  }

  try {
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
    await chrome.action.setBadgeText({ tabId, text: badge });
    await chrome.action.setTitle({ tabId, title: title.slice(0, 64) });
  } catch (error) {
    console.error("Could not show the fullscreen result on the extension icon.", error);
  }
}
