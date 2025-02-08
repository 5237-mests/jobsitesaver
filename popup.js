// // Get elements from the popup
// const siteNameInput = document.getElementById("siteName");
// const siteUrlInput = document.getElementById("siteUrl");
// const saveButton = document.getElementById("saveButton");
// const sitesList = document.getElementById("sitesList");

// // Auto-fill current tab's title and URL
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   const currentTab = tabs[0];
//   siteNameInput.value = currentTab.title; // Auto-fill title
//   siteUrlInput.value = currentTab.url; // Auto-fill URL
// });

// // Load saved sites when the popup opens
// chrome.storage.sync.get({ sites: [] }, function (data) {
//   data.sites.forEach((site) => {
//     addSiteToList(site);
//   });
// });

// saveButton.addEventListener("click", () => {
//   const siteName = siteNameInput.value;
//   const siteUrl = siteUrlInput.value;

//   if (siteName && siteUrl) {
//     chrome.storage.sync.get({ sites: [] }, function (data) {
//       const newSite = { name: siteName, url: siteUrl };
//       data.sites.push(newSite);
//       chrome.storage.sync.set({ sites: data.sites }, () => {
//         addSiteToList(newSite);
//         siteNameInput.value = "";
//         siteUrlInput.value = "";
//         alert("Site saved successfully!"); // Confirmation message
//       });
//     });
//   }
// });

// // Helper function to add a site to the list
// function addSiteToList(site) {
//   const li = document.createElement("li");
//   const link = document.createElement("a");
//   link.href = site.url;
//   link.textContent = site.name;
//   link.target = "_blank";
//   li.appendChild(link);
//   sitesList.appendChild(li);
// }

// Get elements from the popup
const siteNameInput = document.getElementById("siteName");
const siteUrlInput = document.getElementById("siteUrl");
const folderSelect = document.getElementById("folderSelect");
const newFolderInput = document.getElementById("newFolderInput");
const addFolderButton = document.getElementById("addFolderButton");
const saveButton = document.getElementById("saveButton");
const sitesList = document.getElementById("sitesList");
const editFolderButton = document.getElementById("editFolderButton");
const deleteFolderButton = document.getElementById("deleteFolderButton");

// Auto-fill current tab's title and URL
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const currentTab = tabs[0];
  siteNameInput.value = currentTab.title; // Auto-fill title
  siteUrlInput.value = currentTab.url; // Auto-fill URL
});

// Load saved sites and folders when the popup opens
chrome.storage.sync.get({ sites: [], folders: ["Default"] }, function (data) {
  // Populate folders dropdown
  data.folders.forEach((folder) => {
    const option = document.createElement("option");
    option.value = folder;
    option.textContent = folder;
    folderSelect.appendChild(option);
  });

  // Load saved sites
  data.sites.forEach((site) => {
    addSiteToList(site);
  });
});

// Add a filter dropdown
const filterSelect = document.getElementById("select");

// Populate filter dropdown
chrome.storage.sync.get({ folders: [] }, function (data) {
  data.folders.forEach((folder) => {
    const option = document.createElement("option");
    option.value = folder;
    option.textContent = folder;
    filterSelect.appendChild(option);
  });
});

// Filter sites when a folder is selected
filterSelect.addEventListener("change", () => {
  const selectedFolder = filterSelect.value;
  sitesList.innerHTML = ""; // Clear the list

  chrome.storage.sync.get({ sites: [] }, function (data) {
    data.sites.forEach((site) => {
      if (selectedFolder === "all" || site.folder === selectedFolder) {
        addSiteToList(site);
      }
    });
  });
});

// Add a new folder
addFolderButton.addEventListener("click", () => {
  const newFolderName = newFolderInput.value.trim();
  if (newFolderName) {
    chrome.storage.sync.get({ folders: [] }, function (data) {
      if (!data.folders.includes(newFolderName)) {
        data.folders.push(newFolderName);
        chrome.storage.sync.set({ folders: data.folders }, () => {
          // Add the new folder to the dropdown
          const option = document.createElement("option");
          option.value = newFolderName;
          option.textContent = newFolderName;
          folderSelect.appendChild(option);
          newFolderInput.value = ""; // Clear input
        });
      }
    });
  }
});

// Save site when the button is clicked
saveButton.addEventListener("click", () => {
  const siteName = siteNameInput.value;
  const siteUrl = siteUrlInput.value;
  const selectedFolder = folderSelect.value;

  if (siteName && siteUrl) {
    chrome.storage.sync.get({ sites: [] }, function (data) {
      const newSite = { name: siteName, url: siteUrl, folder: selectedFolder };
      data.sites.push(newSite);
      chrome.storage.sync.set({ sites: data.sites }, () => {
        addSiteToList(newSite);
        siteNameInput.value = "";
        siteUrlInput.value = "";
        alert("Site saved successfully!"); // Confirmation message
      });
    });
  }
});

// Edit selected folder
editFolderButton.addEventListener("click", () => {
  const selectedFolder = filterSelect.value;
  const newFolderName = prompt("Enter new folder name:", selectedFolder);
  if (newFolderName && newFolderName !== selectedFolder) {
    chrome.storage.sync.get({ folders: [], sites: [] }, function (data) {
      // Update folder name in folders array
      const folderIndex = data.folders.indexOf(selectedFolder);
      if (folderIndex !== -1) {
        data.folders[folderIndex] = newFolderName;
      }

      // Update folder name in sites
      data.sites.forEach((site) => {
        if (site.folder === selectedFolder) {
          site.folder = newFolderName;
        }
      });

      // Save updated data
      chrome.storage.sync.set(
        { folders: data.folders, sites: data.sites },
        () => {
          populateFolderDropdown(data.folders);
          loadSites(data.sites);

          // Refresh popup
          reloadPopupContent();
        }
      );
    });
    reloadPopupContent();
  }
});

// Delete selected folder
deleteFolderButton.addEventListener("click", () => {
  const selectedFolder = filterSelect.value;
  if (
    confirm(`Are you sure you want to delete the folder "${selectedFolder}"?`)
  ) {
    chrome.storage.sync.get({ folders: [], sites: [] }, function (data) {
      // Remove folder from folders array
      data.folders = data.folders.filter((folder) => folder !== selectedFolder);

      // Remove sites in the deleted folder
      data.sites = data.sites.filter((site) => site.folder !== selectedFolder);

      // Save updated data
      chrome.storage.sync.set(
        { folders: data.folders, sites: data.sites },
        () => {
          populateFolderDropdown(data.folders);
          loadSites(data.sites);

          // Refresh popup
          reloadPopupContent();
        }
      );
    });
  }
});

// Helper function to add a site to the list
function addSiteToList(site) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = site.url;
  link.textContent = `${site.name} (${site.folder})`; // Show folder name
  link.target = "_blank";
  li.appendChild(link);
  sitesList.appendChild(li);
}

// Function to refresh the popup
function refreshPopup() {
  window.close(); // Close the popup
  chrome.action.openPopup(); // Reopen the popup (only works in response to user action)
}

// Function to reload the popup content
function reloadPopupContent() {
  chrome.storage.sync.get({ sites: [], folders: ["Default"] }, function (data) {
    populateFolderDropdown(data.folders);
    loadSites(data.sites);
  });
}
