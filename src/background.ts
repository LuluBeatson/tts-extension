// This is the background script for the extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("OpenAI TTS Chrome Extension Installed");

    // Create context menu item that appears when text is selected
    chrome.contextMenus.create({
        id: "readWithTTS",
        title: "Read with OpenAI TTS",
        contexts: ["selection"]  // Only show when text is selected
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "readWithTTS" && info.selectionText && tab && tab.id) {
        // Send the selected text to the content script
        chrome.tabs.sendMessage(tab.id, {
            action: "readText",
            text: info.selectionText
        });
    }
});