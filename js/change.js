(function () {
chrome.runtime.sendMessage({action: "generate-fingerprint"});
notifyUser(NotificationInfo.newHash.title, "da thay doi xong voi fingerprint moi: " + dataHash);
window.close();
}());