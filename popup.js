// Get elements from the popup
const siteNameInput = document.getElementById("siteName");
const siteUrlInput = document.getElementById("siteUrl");
const saveButton = document.getElementById("saveButton");
const sitesList = document.getElementById("sitesList");

// Load saved sites when the popup opens
chrome.storage.sync.get({ sites: [] }, function (data) {
  data.sites.forEach((site) => {
    addSiteToList(site);
  });
});

// Save site when the button is clicked
saveButton.addEventListener("click", () => {
  const siteName = siteNameInput.value;
  const siteUrl = siteUrlInput.value;

  if (siteName && siteUrl) {
    chrome.storage.sync.get({ sites: [] }, function (data) {
      const newSite = { name: siteName, url: siteUrl };
      data.sites.push(newSite);
      chrome.storage.sync.set({ sites: data.sites }, () => {
        addSiteToList(newSite);
        siteNameInput.value = "";
        siteUrlInput.value = "";
      });
    });
  }
});

// Helper function to add a site to the list
function addSiteToList(site) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = site.url;
  link.textContent = site.name;
  link.target = "_blank";
  li.appendChild(link);
  sitesList.appendChild(li);
}
