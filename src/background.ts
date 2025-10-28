/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

const CHECK_INTERVAL_MINUTES = 1;

// INIT SiapDips Suspender
setupAlarmsFromStorage();

// React to setting changes
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === "local") {
		if (
			changes.timerSuspend ||
			changes.timerAutoCloseSuspend ||
			changes.timerAutoCloseTabs
		) {
			setupAlarmsFromStorage();
		}
	}
});

// SETUP ALARAM
function setupAlarmsFromStorage() {
	chrome.alarms.clearAll();

	chrome.storage.local.get(
		["timerSuspend", "timerAutoCloseSuspend", "timerAutoCloseTabs"],
		(result) => {
			if (result.timerSuspend && result.timerSuspend !== "never") {
				chrome.alarms.create("checkTabs", {
					periodInMinutes: CHECK_INTERVAL_MINUTES,
				});
			}

			if (
				result.timerAutoCloseSuspend &&
				result.timerAutoCloseSuspend !== "never"
			) {
				const autoCloseMinutes = suspendTimeToMinutes(
					result.timerAutoCloseSuspend
				);
				if (autoCloseMinutes) {
					chrome.alarms.create("closeSuspendedTabs", {
						periodInMinutes: autoCloseMinutes,
					});
				}
			}

			if (result.timerAutoCloseTabs && result.timerAutoCloseTabs !== "never") {
				chrome.alarms.create("autoCloseTabs", {
					periodInMinutes: CHECK_INTERVAL_MINUTES,
				});
			}
		}
	);
}

/* 
CHROME FIRST INSTALL LISTENER
  runtime.onInstalled
*/
chrome.runtime.onInstalled.addListener((details) => {
	// INIT SiapDips Suspender
	setupAlarmsFromStorage();
	// Context Menus
	chrome.contextMenus.create({
		id: "suspend-tab",
		title: "💤 Suspend this tab",
		contexts: ["page"],
	});
	chrome.contextMenus.create({
		id: "close-all-suspend-tab",
		title: "😶‍🌫️ Close all suspended tabs",
		contexts: ["page"],
	});
	// on boarding
	if (details.reason === "install") {
		chrome.runtime.openOptionsPage();
	}
});

// Run on browser start
chrome.runtime.onStartup.addListener(() => {
	setupAlarmsFromStorage();
});

/* 
CHROME TAB UPDATE LISTENER PER TAB BASIS
  tabs.onUpdated
*/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (tab.url === undefined) return;

	// FOOD TRUK
	if (
		changeInfo.status === "complete" &&
		tab.url.includes("https://form.undip.ac.id/makanansehat/pendaftaran")
	) {
		chrome.storage.local.get(["selectedLokasiFT"], function (result) {
			if (result.selectedLokasiFT) {
				chrome.scripting.executeScript({
					target: { tabId },
					args: [result.selectedLokasiFT],
					func: (selectedLokasiFT: string) => {
						console.log(selectedLokasiFT);

						const selectElement = document.getElementById(
							"tanggal"
						) as HTMLSelectElement | null;
						if (!selectElement) {
							console.warn("not found.");
							return;
						}

						const trimmedLokasi = selectedLokasiFT.trim();

						for (const option of selectElement.options) {
							if (option.textContent?.trim().includes(trimmedLokasi)) {
								selectElement.value = option.value;
								// @ts-ignore
								Toastify({
									text: "Siap DIps ~~> FT Auto Select",
									duration: 3000,
									close: true,
									position: "left",
								}).showToast();
								if (option.disabled) {
									// @ts-ignore
									Toastify({
										text: "Siap DIps ~~> FT Option disabled",
										duration: 3000,
										close: true,
										position: "left",
									}).showToast();
								}

								selectElement.dispatchEvent(
									new Event("change", { bubbles: true, cancelable: true })
								);
								break;
							}
						}
					},
				});
			}
		});
		// (Anda bisa mempertahankan skrip blur nomor HP jika diinginkan)
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			func: () => {
				const nomorHp = document.querySelector("#mobile_phone") as HTMLElement;
				if (nomorHp) {
					nomorHp.style.filter = "blur(5px)";
				}
			},
		});
	}
});

/* 
CHROME ALARAM LISTENER
  onAlarm
*/
chrome.alarms.onAlarm.addListener(async (alarm) => {
	switch (alarm.name) {
		case "checkTabs":
			await TabSuspenderAlarm();
			break;
		case "closeSuspendedTabs":
			await closeSuspendedTabsAlarm();
			break;
		case "autoCloseTabs":
			await AutoCloseTabsAlarm();
			break;
	}
});

/* 
CHROME CONTEXT MENU LISTENER
  contextMenus.onClicked
*/
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (
		info.menuItemId === "suspend-tab" &&
		tab?.id &&
		tab.url?.startsWith("http")
	) {
		const encodedUrl = encodeURIComponent(tab.url);
		const encodedTitle = encodeURIComponent(tab.title ?? "Sleeping Tab");
		const encodedFavicon = encodeURIComponent(tab.favIconUrl ?? "");

		const suspendUrl =
			chrome.runtime.getURL("suspended.html") +
			`#url=${encodedUrl}&title=${encodedTitle}&favicon=${encodedFavicon}`;

		chrome.tabs.update(tab.id, { url: suspendUrl });
	}
	if (info.menuItemId === "close-all-suspend-tab") {
		closeAllSuspendedTabs();
	}
});

/* 
CHROME MESSAGE LISTENER
  runtime.onMessage
*/
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "closeAllSuspendedTabsNow") {
		closeAllSuspendedTabs();
	}
	if (message.type === "suspendAllTabsNow") {
		SuspendAllThoseTabsNow();
	}
	if (message.type === "closeAllTabsNow") {
		CloseThoseTabsNow();
	}
});

// SiapDips Suspender //>>
// SiapDips Suspender //
// SiapDips Suspender //
// SiapDips Suspender //
// SiapDips Suspender //
async function TabSuspenderAlarm() {
	console.log("🔔 Checking tabs for suspension...");

	const result = await new Promise<any>((resolve) =>
		chrome.storage.local.get(
			[
				"timerSuspend",
				"suspendPinnedTabs",
				"suspendUnsavedInputs",
				"suspendActiveTab",
				"suspendAudioTabs",
			],
			resolve
		)
	);

	if (!result.timerSuspend || result.timerSuspend === "never") {
		console.log("🔔 No suspension timer set. Skipping...");
		return;
	}

	const SUSPEND_AFTER_MINUTES = suspendTimeToMinutes(result.timerSuspend) ?? 30;

	console.log("🔔 Suspend after minutes:", SUSPEND_AFTER_MINUTES);

	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			const tabId = tab.id;
			if (typeof tabId !== "number") return;

			if (
				!tab.url ||
				!tab.url.startsWith("http") ||
				tab.url.startsWith("chrome://")
			)
				return;

			if ((result.suspendPinnedTabs ?? true) && tab.pinned) return;
			if ((result.suspendActiveTab ?? true) && tab.active) return;
			if ((result.suspendAudioTabs ?? true) && tab.audible) return;

			const lastUsed = tab.lastAccessed ?? Date.now();
			const idleMinutes = (Date.now() - lastUsed) / 60000;

			console.log(
				`🔔 Tab ${tab.url} last accessed ${idleMinutes.toFixed(2)} minutes ago`
			);

			if (idleMinutes < SUSPEND_AFTER_MINUTES) return;

			if (result.suspendUnsavedInputs ?? true) {
				chrome.tabs.sendMessage(tabId, { action: "checkFormDirty" }, (res) => {
					if (chrome.runtime.lastError || res?.isDirty) {
						console.log(`❌ Tab ${tab.url} is dirty or errored. Skipping...`);
						return;
					}
					suspendTab(tab);
				});
			} else {
				suspendTab(tab);
			}
		});
	});
}

async function SuspendAllThoseTabsNow() {
	console.log("Suspening all those tabs now...");

	const result = await new Promise<any>((resolve) =>
		chrome.storage.local.get(
			[
				"suspendPinnedTabs",
				"suspendUnsavedInputs",
				"suspendActiveTab",
				"suspendAudioTabs",
			],
			resolve
		)
	);

	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			const tabId = tab.id;
			if (typeof tabId !== "number") return;

			if (
				!tab.url ||
				!tab.url.startsWith("http") ||
				tab.url.startsWith("chrome://")
			)
				return;

			if ((result.suspendPinnedTabs ?? true) && tab.pinned) return;
			if ((result.suspendActiveTab ?? true) && tab.active) return;
			if ((result.suspendAudioTabs ?? true) && tab.audible) return;

			const lastUsed = tab.lastAccessed ?? Date.now();
			const idleMinutes = (Date.now() - lastUsed) / 60000;

			console.log(
				`🔔 Tab ${tab.url} last accessed ${idleMinutes.toFixed(2)} minutes ago`
			);

			if (result.suspendUnsavedInputs ?? true) {
				chrome.tabs.sendMessage(tabId, { action: "checkFormDirty" }, (res) => {
					if (chrome.runtime.lastError || res?.isDirty) {
						console.log(`❌ Tab ${tab.url} is dirty or errored. Skipping...`);
						return;
					}
					suspendTab(tab);
				});
			} else {
				suspendTab(tab);
			}
		});
	});
}

async function closeSuspendedTabsAlarm() {
	const result = await new Promise<any>((resolve) =>
		chrome.storage.local.get(["timerAutoCloseSuspend"], resolve)
	);
	if (
		!result.timerAutoCloseSuspend ||
		result.timerAutoCloseSuspend === "never"
	) {
		console.log("🔔 No suspension timer set. Skipping...");
		return;
	}

	console.log("🔔 Closing all suspended tabs...");
	closeAllSuspendedTabs();
}

async function AutoCloseTabsAlarm() {
	const result = await new Promise<any>((resolve) =>
		chrome.storage.local.get(
			[
				"timerAutoCloseTabs",
				"closePinnedTabs",
				"closeUnsavedInputs",
				"closeActiveTab",
				"closeAudioTabs",
			],
			resolve
		)
	);

	if (!result.timerAutoCloseTabs || result.timerAutoCloseTabs === "never") {
		console.log("🔔 No auto tab close timer set. Skipping...");
		return;
	}
	console.log("🔔 Checking closing idle tabs...");

	const AUTO_CLOSE_MINUTES =
		suspendTimeToMinutes(result.timerAutoCloseTabs) ?? 30;
	chrome.tabs.query({}, (tabs) => {
		for (const tab of tabs) {
			const tabId = tab.id;
			if (typeof tabId !== "number") continue;

			if (
				!tab.url ||
				!tab.url.startsWith("http") ||
				tab.url.startsWith("chrome://")
			)
				continue;

			if ((result.closePinnedTabs ?? true) && tab.pinned) continue;
			if ((result.closeActiveTab ?? true) && tab.active) continue;
			if ((result.closeAudioTabs ?? true) && tab.audible) continue;

			console.log("🔔 Tab is eligible for auto close:", tab.url);

			const lastUsed = tab.lastAccessed ?? Date.now();
			const idleMinutes = (Date.now() - lastUsed) / 60000;

			console.log(
				`🔔 Tab ${tab.url} last accessed ${idleMinutes.toFixed(2)} minutes ago`
			);

			if (idleMinutes < AUTO_CLOSE_MINUTES) continue;

			if (result.closeUnsavedInputs ?? true) {
				chrome.tabs.sendMessage(tabId, { action: "checkFormDirty" }, (res) => {
					if (chrome.runtime.lastError || res?.isDirty) {
						console.log(`❌ Tab ${tab.url} is dirty or errored. Skipping...`);
						return;
					}
					chrome.tabs.remove(tabId, () => {
						console.log(
							`🔔 Closed tab ${tab.url} after ${idleMinutes.toFixed(2)} minutes`
						);
					});
				});
			} else {
				chrome.tabs.remove(tabId, () => {
					console.log(
						`🔔 Closed tab ${tab.url} after ${idleMinutes.toFixed(2)} minutes`
					);
				});
			}
		}
	});
}

async function CloseThoseTabsNow() {
	console.log("Closing all those tabs now...");
	const result = await new Promise<any>((resolve) =>
		chrome.storage.local.get(
			[
				"closePinnedTabs",
				"closeUnsavedInputs",
				"closeActiveTab",
				"closeAudioTabs",
			],
			resolve
		)
	);

	chrome.tabs.query({}, (tabs) => {
		for (const tab of tabs) {
			const tabId = tab.id;
			if (typeof tabId !== "number") continue;

			if (
				!tab.url ||
				!tab.url.startsWith("http") ||
				tab.url.startsWith("chrome://")
			)
				continue;

			if ((result.closePinnedTabs ?? true) && tab.pinned) continue;
			if ((result.closeActiveTab ?? true) && tab.active) continue;
			if ((result.closeAudioTabs ?? true) && tab.audible) continue;

			console.log("🔔 Tab is eligible for auto close:", tab.url);

			const lastUsed = tab.lastAccessed ?? Date.now();
			const idleMinutes = (Date.now() - lastUsed) / 60000;

			console.log(
				`🔔 Tab ${tab.url} last accessed ${idleMinutes.toFixed(2)} minutes ago`
			);

			if (result.closeUnsavedInputs ?? true) {
				chrome.tabs.sendMessage(tabId, { action: "checkFormDirty" }, (res) => {
					if (chrome.runtime.lastError || res?.isDirty) {
						console.log(`❌ Tab ${tab.url} is dirty or errored. Skipping...`);
						return;
					}
					chrome.tabs.remove(tabId, () => {
						console.log(
							`🔔 Closed tab ${tab.url} after ${idleMinutes.toFixed(2)} minutes`
						);
					});
				});
			} else {
				chrome.tabs.remove(tabId, () => {
					console.log(
						`🔔 Closed tab ${tab.url} after ${idleMinutes.toFixed(2)} minutes`
					);
				});
			}
		}
	});
}

function suspendTab(tab: chrome.tabs.Tab) {
	const encodedUrl = encodeURIComponent(tab.url ?? "");
	const encodedTitle = encodeURIComponent(tab.title ?? "Sleeping Tab");
	const encodedFavicon = encodeURIComponent(tab.favIconUrl ?? "");

	const suspendUrl =
		chrome.runtime.getURL("suspended.html") +
		`#url=${encodedUrl}&title=${encodedTitle}&favicon=${encodedFavicon}`;

	chrome.tabs.update(tab.id!, { url: suspendUrl });
}

function suspendTimeToMinutes(value: string): number | null {
	if (value === "never") return null;

	const num = parseInt(value);
	if (value.endsWith("s")) return num / 60;
	if (value.endsWith("m")) return num;
	if (value.endsWith("h")) return num * 60;
	if (value.endsWith("d")) return num * 60 * 24;
	if (value.endsWith("w")) return num * 60 * 24 * 7;

	return null;
}

function closeAllSuspendedTabs() {
	chrome.tabs.query({}, (tabs) => {
		for (const tab of tabs) {
			if (
				tab.url?.startsWith("chrome-extension://") ||
				tab.url?.startsWith("moz-extension://")
			) {
				if (tab.url.includes("suspended.html") && tab.id !== undefined) {
					chrome.tabs.remove(tab.id);
				}
			}
		}
	});
}
