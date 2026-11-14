const RESULT_MESSAGE = "video-fullscreen-result";

chrome.action.onClicked.addListener((tab) => {
  if (typeof tab.id === "number") {
    fullscreenVideoInTab(tab.id);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (
    !message ||
    message.type !== RESULT_MESSAGE ||
    sender.id !== chrome.runtime.id ||
    !sender.tab ||
    typeof sender.tab.id !== "number"
  ) {
    return;
  }

  void showResult(sender.tab.id, message);
});

function fullscreenVideoInTab(tabId) {
  void clearResult(tabId);

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["utils/video-selector.js", "content.js"]
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
