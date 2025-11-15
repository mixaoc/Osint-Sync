// OSINT Username Tracker Pro - Background Script
// Developed by https://github.com/mixaoc

// Regular expressions for detection
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;

// Create context menu items
browser.contextMenus.create({
    id: "osint-search-username",
    title: "🔍 Search '%s' as USERNAME",
    contexts: ["selection"]
});

browser.contextMenus.create({
    id: "osint-search-email",
    title: "📧 Analyze '%s' (Email)",
    contexts: ["selection"]
});

browser.contextMenus.create({
    id: "osint-search-phone",
    title: "📱 Search '%s' (Phone)",
    contexts: ["selection"]
});

browser.contextMenus.create({
    id: "separator",
    type: "separator",
    contexts: ["selection"]
});

browser.contextMenus.create({
    id: "osint-open-extension",
    title: "🎯 Open OSINT Tracker Pro",
    contexts: ["all"]
});

// Update context menu based on selection
browser.contextMenus.onShown.addListener((info) => {
    if (info.contexts.includes("selection")) {
        const selectedText = info.selectionText.trim();
        const isEmail = EMAIL_REGEX.test(selectedText);
        const isPhone = PHONE_REGEX.test(selectedText.replace(/\s/g, ''));
        
        // Update username menu item
        browser.contextMenus.update("osint-search-username", {
            visible: true,
            title: `🔍 Search '${truncateText(selectedText)}' as USERNAME`
        });
        
        // Update email menu item
        if (isEmail) {
            browser.contextMenus.update("osint-search-email", {
                visible: true,
                title: `📧 Analyze '${truncateText(selectedText)}' (Email detected)`
            });
        } else {
            browser.contextMenus.update("osint-search-email", {
                visible: true,
                title: `📧 Analyze '${truncateText(selectedText)}' as EMAIL`
            });
        }
        
        // Update phone menu item
        if (isPhone) {
            browser.contextMenus.update("osint-search-phone", {
                visible: true,
                title: `📱 Search '${truncateText(selectedText)}' (Phone detected)`
            });
        } else {
            browser.contextMenus.update("osint-search-phone", {
                visible: false
            });
        }
        
        browser.contextMenus.refresh();
    }
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
    const selectedText = info.selectionText ? info.selectionText.trim() : '';
    
    switch (info.menuItemId) {
        case "osint-search-username":
            openExtensionWithSearch('username', selectedText);
            break;
            
        case "osint-search-email":
            openExtensionWithSearch('email', selectedText);
            break;
            
        case "osint-search-phone":
            openExtensionWithSearch('phone', selectedText);
            break;
            
        case "osint-open-extension":
            browser.browserAction.openPopup();
            break;
    }
});

// Open extension with pre-filled search
function openExtensionWithSearch(type, query) {
    // Store the search query temporarily
    browser.storage.local.set({
        pendingSearch: {
            type: type,
            query: query,
            timestamp: Date.now()
        }
    }, () => {
        // Open the extension popup
        browser.browserAction.openPopup();
        
        // Send message to popup when it opens
        setTimeout(() => {
            browser.runtime.sendMessage({
                action: 'performSearch',
                type: type,
                query: query
            });
        }, 500);
    });
}

// Truncate text for menu display
function truncateText(text, maxLength = 30) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPendingSearch') {
        browser.storage.local.get(['pendingSearch'], (result) => {
            if (result.pendingSearch) {
                // Check if search is recent (within last 10 seconds)
                const isRecent = (Date.now() - result.pendingSearch.timestamp) < 10000;
                if (isRecent) {
                    sendResponse(result.pendingSearch);
                    // Clear pending search after sending
                    browser.storage.local.remove(['pendingSearch']);
                } else {
                    sendResponse(null);
                }
            } else {
                sendResponse(null);
            }
        });
        return true; // Will respond asynchronously
    }
});

// Handle installation
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Set initial data
        browser.storage.local.set({
            installed: true,
            installDate: new Date().toISOString(),
            searchHistory: []
        });
        
        // Open welcome page
        browser.tabs.create({
            url: 'https://github.com/mixaoc'
        });
        
        console.log('OSINT Username Tracker Pro installed successfully!');
    } else if (details.reason === 'update') {
        console.log('OSINT Username Tracker Pro updated to latest version!');
    }
});

// Badge management for notifications
function updateBadge(count) {
    if (count > 0) {
        browser.browserAction.setBadgeText({ text: count.toString() });
        browser.browserAction.setBadgeBackgroundColor({ color: '#00ff88' });
    } else {
        browser.browserAction.setBadgeText({ text: '' });
    }
}

// Track active searches
let activeSearches = 0;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'searchStarted') {
        activeSearches++;
        updateBadge(activeSearches);
    } else if (request.action === 'searchCompleted') {
        activeSearches = Math.max(0, activeSearches - 1);
        updateBadge(activeSearches);
    }
});

// Periodic cleanup of old data
setInterval(() => {
    browser.storage.local.get(['searchHistory'], (result) => {
        if (result.searchHistory && result.searchHistory.length > 100) {
            // Keep only last 100 searches
            const trimmedHistory = result.searchHistory.slice(-100);
            browser.storage.local.set({ searchHistory: trimmedHistory });
        }
    });
}, 3600000); // Run every hour

console.log('OSINT Username Tracker Pro - Background script loaded');
console.log('Developed by https://github.com/mixaoc');