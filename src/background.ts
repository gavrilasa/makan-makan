/* eslint-disable @typescript-eslint/ban-ts-comment */

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
