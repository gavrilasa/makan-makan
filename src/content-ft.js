// content-ft.js

const STORAGE_KEY_LOKASI_FT = "selectedLokasiFT";

// Opsi Lokasi Food Truck
const lokasiOptions = [
	{ value: "NONE", label: "- Pilih Lokasi Default -" },
	{ value: "Auditorium Imam Bardjo", label: "Auditorium Imam Bardjo" },
	{ value: "Student Center", label: "Student Center" },
	{ value: "Auditorium FPIK", label: "Auditorium FPIK" },
	{
		value: "Halaman Parkir Gedung SA-MWA",
		label: "Halaman Parkir Gedung SA-MWA",
	},
	{
		value: "ART Center",
		label: "Gedung ART Center",
	},
];

function createHelper() {
	const helper = document.createElement("div");
	Object.assign(helper.style, {
		position: "fixed",
		top: "20px",
		right: "20px",
		width: "300px", // Sedikit lebih sempit
		minHeight: "auto", // Tinggi otomatis
		backgroundColor: "rgba(255, 255, 255, 0.98)", // Putih lebih solid
		borderRadius: "8px", // Radius sudut lebih kecil
		boxShadow: "0 4px 15px rgba(0,0,0,0.1)", // Shadow disesuaikan
		padding: "12px 16px", // Padding disesuaikan
		zIndex: "9999",
		resize: "both",
		overflow: "auto",
		border: "1px solid #e0e0e0", // Border lebih terang
		backdropFilter: "blur(5px)",
		transition: "box-shadow 0.3s ease, width 0.3s ease, min-height 0.3s ease", // Transisi untuk minimize
		transform: "translate(0, 0)",
		color: "#333",
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	});

	// Header (drag handle and title)
	const header = document.createElement("div");
	Object.assign(header.style, {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "10px", // Margin bawah dikurangi
		userSelect: "none",
		paddingBottom: "8px", // Padding bawah dikurangi
		borderBottom: "1px solid #eee", // Border lebih terang
	});

	// Title container ( text only)
	const titleContainer = document.createElement("div");
	Object.assign(titleContainer.style, {
		display: "flex",
		alignItems: "center",
		cursor: "move", // Kursor move
	});

	const titleText = document.createElement("span");
	titleText.textContent = "Makan Makan";
	Object.assign(titleText.style, {
		fontSize: "16px", // Sedikit lebih kecil
		fontWeight: "600", // Semi-bold
	});

	// --- Tombol Kontrol (Minimize, Close) ---
	const controlsContainer = document.createElement("div");
	controlsContainer.style.display = "flex";
	controlsContainer.style.alignItems = "center";
	controlsContainer.style.gap = "4px"; // Jarak antar tombol kontrol

	// Tombol Minimize
	const minimizeButton = document.createElement("button");
	Object.assign(minimizeButton.style, {
		border: "none",
		background: "none",
		cursor: "pointer",
		padding: "4px", // Padding lebih kecil
		borderRadius: "4px",
		color: "#999", // Abu-abu lebih terang
		fontSize: "20px", // Sesuaikan ukuran jika perlu
		transition: "all 0.2s ease",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		lineHeight: "1",
	});
	minimizeButton.textContent = "−";
	minimizeButton.title = "Minimize";

	minimizeButton.addEventListener("mouseenter", () => {
		minimizeButton.style.backgroundColor = "#f0f0f0";
		minimizeButton.style.color = "#555";
	});
	minimizeButton.addEventListener("mouseleave", () => {
		minimizeButton.style.backgroundColor = "transparent";
		minimizeButton.style.color = "#999";
	});

	// Tombol Close
	const closeButton = document.createElement("button");
	Object.assign(closeButton.style, {
		border: "none",
		background: "none",
		cursor: "pointer",
		padding: "4px", // Padding lebih kecil
		borderRadius: "4px",
		color: "#999", // Abu-abu lebih terang
		fontSize: "16px", // Sesuaikan ukuran jika perlu
		transition: "all 0.2s ease",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		lineHeight: "1",
	});
	closeButton.textContent = "✕";
	closeButton.title = "Close";

	closeButton.addEventListener("mouseenter", () => {
		closeButton.style.backgroundColor = "#fdd";
		closeButton.style.color = "#c82333";
	});
	closeButton.addEventListener("mouseleave", () => {
		closeButton.style.backgroundColor = "transparent";
		closeButton.style.color = "#999";
	});
	closeButton.addEventListener("click", () => helper.remove());

	// Store original styles for restoring later
	const originalStyles = {
		width: helper.style.width,
		minHeight: helper.style.minHeight,
		padding: helper.style.padding,
		borderRadius: helper.style.borderRadius,
		resize: helper.style.resize,
	};

	let isMinimized = false;
	minimizeButton.addEventListener("click", () => {
		isMinimized = !isMinimized;
		if (isMinimized) {
			content.style.display = "none";
			helper.style.minHeight = "auto";
			helper.style.height = "auto";
			helper.style.resize = "none";
			minimizeButton.textContent = "□";
			minimizeButton.title = "Restore";
			helper.style.width = "auto"; // Lebar otomatis saat minimize
		} else {
			content.style.display = "flex";
			// Kembalikan minHeight jika diperlukan, atau biarkan auto
			// helper.style.minHeight = originalStyles.minHeight;
			helper.style.resize = originalStyles.resize;
			minimizeButton.textContent = "−";
			minimizeButton.title = "Minimize";
			helper.style.width = originalStyles.width;
		}
	});

	titleContainer.appendChild(titleText);

	controlsContainer.appendChild(minimizeButton);
	controlsContainer.appendChild(closeButton);

	header.appendChild(titleContainer);
	header.appendChild(controlsContainer);
	helper.appendChild(header);

	// Content container
	const content = document.createElement("div");
	Object.assign(content.style, {
		width: "100%",
		display: "flex",
		flexDirection: "column",
		gap: "10px", // *** GAP UTAMA ANTAR ELEMEN DIKURANGI ***
		alignItems: "stretch", // Elemen mengisi lebar container
	});

	function formatTimeWithMilliseconds(date) {
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
		const ms = date.getMilliseconds().toString().padStart(3, "0");
		return `${hours}:${minutes}:${seconds}.${ms}`;
	}

	const infoText = document.createElement("div");
	infoText.textContent =
		"This clock is local and may not accurate, use time.is for accurate time";
	Object.assign(infoText.style, {
		fontSize: "11px", // Teks lebih kecil
		color: "#666", // Abu-abu lebih gelap
		textAlign: "center",
		// Margin diatur oleh gap
	});
	content.appendChild(infoText);

	const liveClock = document.createElement("div");
	Object.assign(liveClock.style, {
		fontSize: "28px", // Jam sedikit lebih besar
		fontWeight: "600", // Semi-bold
		textAlign: "center",
		letterSpacing: "0.5px", // Spasi antar karakter
		color: "#222", // Warna lebih gelap
		// Margin diatur oleh gap
	});
	liveClock.textContent = formatTimeWithMilliseconds(new Date());
	const clockInterval = setInterval(() => {
		liveClock.textContent = formatTimeWithMilliseconds(new Date());
	}, 50);

	const observer = new MutationObserver((mutationsList, observerInstance) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList") {
				mutation.removedNodes.forEach((node) => {
					if (node === helper) {
						clearInterval(clockInterval);
						observerInstance.disconnect();
					}
				});
			}
		}
	});
	observer.observe(document.body, { childList: true });
	content.appendChild(liveClock);

	// --- Lokasi Default Section ---
	const lokasiContainer = document.createElement("div");
	Object.assign(lokasiContainer.style, {
		display: "flex",
		flexDirection: "column",
		gap: "4px", // Jarak kecil antara label dan select
		width: "100%",
		// Margin diatur oleh gap
	});

	const lokasiLabel = document.createElement("label");
	lokasiLabel.textContent = "Default Lokasi FT:";
	Object.assign(lokasiLabel.style, {
		fontSize: "13px", // Ukuran label standar
		fontWeight: "500", // Medium
		color: "#444",
		textAlign: "left", // Rata kiri
	});

	const lokasiSelect = document.createElement("select");
	Object.assign(lokasiSelect.style, {
		fontSize: "14px",
		padding: "8px 10px", // Padding standar
		width: "100%",
		border: `1px solid #ccc`,
		borderRadius: "6px", // Radius sudut sedikit lebih besar
		backgroundColor: "#fff",
		color: "#333",
		boxSizing: "border-box",
		appearance: "none", // Hilangkan panah default
		backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, // Panah custom
		backgroundRepeat: "no-repeat",
		backgroundPosition: "right 10px center",
		backgroundSize: "10px 10px",
		cursor: "pointer",
	});

	lokasiOptions.forEach((option) => {
		const optElement = document.createElement("option");
		optElement.value = option.value;
		optElement.textContent = option.label;
		lokasiSelect.appendChild(optElement);
	});

	chrome.storage.local.get([STORAGE_KEY_LOKASI_FT], (result) => {
		if (result[STORAGE_KEY_LOKASI_FT]) {
			lokasiSelect.value = result[STORAGE_KEY_LOKASI_FT];
		}
	});

	lokasiSelect.addEventListener("change", () => {
		const selectedValue = lokasiSelect.value;
		chrome.storage.local.set({ [STORAGE_KEY_LOKASI_FT]: selectedValue }, () => {
			Toastify({
				text: "Lokasi default disimpan!",
				duration: 2000,
				close: true,
				gravity: "top",
				position: "right",
			}).showToast();
		});
	});

	lokasiContainer.appendChild(lokasiLabel);
	lokasiContainer.appendChild(lokasiSelect);
	content.appendChild(lokasiContainer);
	// --- End Lokasi Default Section ---

	// Container for scheduling auto-refresh.
	const scheduleContainer = document.createElement("div");
	Object.assign(scheduleContainer.style, {
		display: "flex",
		flexDirection: "column",
		gap: "6px", // Jarak antara input waktu, indikator, dan tombol
		alignItems: "stretch", // Elemen mengisi lebar
		width: "100%",
	});

	// Enhanced time input
	const timeInput = document.createElement("input");
	timeInput.type = "time";
	timeInput.value = "10:00:00.000";
	timeInput.step = "0.001";
	Object.assign(timeInput.style, {
		fontSize: "16px",
		padding: "8px 10px", // Padding standar
		width: "100%",
		textAlign: "center",
		border: `1px solid #ccc`,
		borderRadius: "6px", // Radius sudut sedikit lebih besar
		backgroundColor: "#fff",
		color: "#333",
		boxSizing: "border-box",
	});
	scheduleContainer.appendChild(timeInput);

	// Indicator
	const scheduleIndicator = document.createElement("div");
	scheduleIndicator.textContent = "Belum Auto Refresh X";
	Object.assign(scheduleIndicator.style, {
		fontSize: "12px", // Sedikit lebih kecil
		color: "#666", // Abu-abu lebih gelap
		textAlign: "center", // Tengah
	});
	scheduleContainer.appendChild(scheduleIndicator);

	// Button schedule auto refresh
	const scheduleButton = document.createElement("button");
	scheduleButton.textContent = "Gas Auto Refresh Jam";
	Object.assign(scheduleButton.style, {
		padding: "10px 12px", // Padding standar tombol
		fontSize: "15px", // Ukuran font tombol
		fontWeight: "500", // Medium
		cursor: "pointer",
		border: "none",
		borderRadius: "6px",
		backgroundColor: "#28a745", // Warna hijau
		color: "#ffffff",
		transition: "background-color 0.2s ease",
		width: "100%",
		boxSizing: "border-box",
	});

	scheduleButton.addEventListener("mouseenter", () => {
		scheduleButton.style.backgroundColor = "#218838";
	});
	scheduleButton.addEventListener("mouseleave", () => {
		scheduleButton.style.backgroundColor = "#28a745";
	});

	scheduleButton.addEventListener("click", () => {
		const timeValue = timeInput.value;
		if (!timeValue) {
			scheduleIndicator.textContent = "Format waktu salah!";
			scheduleIndicator.style.color = "red";
			return;
		}
		const parts = timeValue.split(/[:.]/);
		if (parts.length < 3) {
			scheduleIndicator.textContent = "Format waktu salah!";
			scheduleIndicator.style.color = "red";
			return;
		}
		const inputHour = Number(parts[0]);
		const inputMinute = Number(parts[1]);
		const inputSecond = Number(parts[2]);
		const inputMillisecond =
			parts.length > 3 ? Number(parts[3].padEnd(3, "0")) : 0;

		if (
			isNaN(inputHour) ||
			isNaN(inputMinute) ||
			isNaN(inputSecond) ||
			isNaN(inputMillisecond) ||
			inputHour < 0 ||
			inputHour > 23 ||
			inputMinute < 0 ||
			inputMinute > 59 ||
			inputSecond < 0 ||
			inputSecond > 59 ||
			inputMillisecond < 0 ||
			inputMillisecond > 999
		) {
			scheduleIndicator.textContent = "Format waktu salah!";
			scheduleIndicator.style.color = "red";
			return;
		}

		const now = new Date();
		const target = new Date();
		target.setHours(inputHour, inputMinute, inputSecond, inputMillisecond);
		if (now >= target) {
			target.setDate(target.getDate() + 1);
		}
		const delay = target - now;

		if (delay < 0) {
			scheduleIndicator.textContent = "Waktu target sudah lewat!";
			scheduleIndicator.style.color = "red";
			return;
		}

		scheduleIndicator.textContent = `Auto refresh jam ${formatTimeWithMilliseconds(
			target
		)}`;
		scheduleIndicator.style.color = "#555";

		setTimeout(() => {
			location.reload();
		}, delay);

		Toastify({
			text: "Auto Refresh Jam 10",
			duration: 3000,
			close: true,
			gravity: "top",
			position: "right",
		}).showToast();
	});
	scheduleContainer.appendChild(scheduleButton);
	content.appendChild(scheduleContainer);

	// Container untuk dua tombol bawah agar gapnya sama
	const bottomButtonsContainer = document.createElement("div");
	Object.assign(bottomButtonsContainer.style, {
		display: "flex",
		flexDirection: "column",
		gap: "8px", // *** JARAK ANTAR TOMBOL BAWAH ***
		width: "100%",
		// Margin atas diatur oleh gap dari `content`
	});

	// "Refresh Now" button.
	const refreshNowButton = document.createElement("button");
	refreshNowButton.textContent = "Refresh Now";
	Object.assign(refreshNowButton.style, {
		padding: "10px 12px", // Padding standar tombol
		fontSize: "15px", // Ukuran font tombol
		fontWeight: "500", // Medium
		cursor: "pointer",
		border: "none",
		borderRadius: "6px",
		backgroundColor: "#dc3545", // Warna merah
		color: "#ffffff",
		transition: "background-color 0.2s ease",
		width: "100%",
		boxSizing: "border-box",
	});

	refreshNowButton.addEventListener("mouseenter", () => {
		refreshNowButton.style.backgroundColor = "#c82333";
	});
	refreshNowButton.addEventListener("mouseleave", () => {
		refreshNowButton.style.backgroundColor = "#dc3545";
	});
	refreshNowButton.addEventListener("click", () => {
		location.reload();
	});
	bottomButtonsContainer.appendChild(refreshNowButton); // Tambahkan ke container bawah

	// Time.is button.
	const TimeIsButton = document.createElement("button");
	TimeIsButton.textContent = "Time.is {More Accurate time}";
	Object.assign(TimeIsButton.style, {
		padding: "10px 12px", // Padding standar tombol
		fontSize: "15px", // Ukuran font tombol
		fontWeight: "500", // Medium
		cursor: "pointer",
		border: "none",
		borderRadius: "6px",
		backgroundColor: "#007bff", // Warna biru primer
		color: "#ffffff",
		transition: "background-color 0.2s ease",
		width: "100%",
		boxSizing: "border-box",
	});

	TimeIsButton.addEventListener("mouseenter", () => {
		TimeIsButton.style.backgroundColor = "#0056b3"; // Biru lebih gelap
	});
	TimeIsButton.addEventListener("mouseleave", () => {
		TimeIsButton.style.backgroundColor = "#007bff";
	});
	TimeIsButton.addEventListener("click", () => {
		window.open("https://time.is", "_blank", "noopener,noreferrer");
	});
	bottomButtonsContainer.appendChild(TimeIsButton); // Tambahkan ke container bawah

	content.appendChild(bottomButtonsContainer); // Tambahkan container tombol bawah ke content

	// Assemble the helper card.
	helper.appendChild(content);
	document.body.appendChild(helper);

	// Enable dragging for the helper using the title container as the handle.
	new Draggable({ element: helper, handle: titleContainer });
	return helper;
}

// A simple draggable implementation.
if (typeof window.Draggable === "undefined") {
	class Draggable {
		constructor({ element, handle }) {
			this.element = element;
			this.handle = handle;
			this.dragging = false;
			this.offsetX = 0;
			this.offsetY = 0;
			this.initialX = 0;
			this.initialY = 0;

			// Bind all event handlers
			this.onMouseMove = this.onMouseMove.bind(this);
			this.onMouseUp = this.onMouseUp.bind(this);
			this.onTouchMove = this.onTouchMove.bind(this);
			this.onTouchEnd = this.onTouchEnd.bind(this);

			// Add mouse and touch event listeners
			this.handle.addEventListener("mousedown", this.onMouseDown.bind(this));
			this.handle.addEventListener("touchstart", this.onTouchStart.bind(this), {
				passive: false,
			});
		}
		onMouseDown(e) {
			if (e.button !== 0) return;
			this.dragging = true;
			this.initialX = parseInt(this.element.style.left || "0", 10);
			this.initialY = parseInt(this.element.style.top || "0", 10);
			this.offsetX = e.clientX - this.initialX;
			this.offsetY = e.clientY - this.initialY;
			this.handle.style.cursor = "grabbing";
			document.body.style.cursor = "grabbing";
			document.addEventListener("mousemove", this.onMouseMove);
			document.addEventListener("mouseup", this.onMouseUp);
		}
		onMouseMove(e) {
			if (this.dragging) {
				e.preventDefault();
				const newX = e.clientX - this.offsetX;
				const newY = e.clientY - this.offsetY;
				this.element.style.left = newX + "px";
				this.element.style.top = newY + "px";
			}
		}
		onMouseUp() {
			if (this.dragging) {
				this.dragging = false;
				this.handle.style.cursor = "move";
				document.body.style.cursor = "default";
				document.removeEventListener("mousemove", this.onMouseMove);
				document.removeEventListener("mouseup", this.onMouseUp);
			}
		}
		onTouchStart(e) {
			e.preventDefault();
			this.dragging = true;
			const touch = e.touches[0];
			this.initialX = parseInt(this.element.style.left || "0", 10);
			this.initialY = parseInt(this.element.style.top || "0", 10);
			this.offsetX = touch.clientX - this.initialX;
			this.offsetY = touch.clientY - this.initialY;
			document.addEventListener("touchmove", this.onTouchMove, {
				passive: false,
			});
			document.addEventListener("touchend", this.onTouchEnd);
			document.addEventListener("touchcancel", this.onTouchEnd);
		}
		onTouchMove(e) {
			if (this.dragging) {
				e.preventDefault();
				const touch = e.touches[0];
				const newX = touch.clientX - this.offsetX;
				const newY = touch.clientY - this.offsetY;
				this.element.style.left = newX + "px";
				this.element.style.top = newY + "px";
			}
		}
		onTouchEnd() {
			if (this.dragging) {
				this.dragging = false;
				document.removeEventListener("touchmove", this.onTouchMove);
				document.removeEventListener("touchend", this.onTouchEnd);
				document.removeEventListener("touchcancel", this.onTouchEnd);
			}
		}
	}
	window.Draggable = Draggable;
}

function triggerScroll(elementId) {
	setTimeout(() => {
		const element = document.querySelector(elementId);
		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			element.style.transition = "outline 0.1s ease-out";
			element.style.outline = "2px solid #3C7CFE"; // Blue outline
			setTimeout(() => {
				element.style.outline = "none";
			}, 1000);
		} else {
			console.warn("Element " + elementId + " not found for scrolling.");
		}
	}, 100);
}

// Initialize the helper when the content script loads.
if (!document.getElementById("siap-dips-ft-helper")) {
	const helperElement = createHelper();
	helperElement.id = "siap-dips-ft-helper";
	Toastify({
		text: "Script Loaded",
		duration: 3000,
		close: true,
		gravity: "top",
		position: "right",
	}).showToast();
	triggerScroll("#tanggal");
} else {
	console.log("Makan makan already exists.");
}
