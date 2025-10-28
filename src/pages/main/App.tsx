import "./App.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/Footer";
import AutoFoodTruk from "@/components/AutoFoodTruck/AutoFoodTruck"; // <-- TAMBAHKAN INI

function App() {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Navbar />
				<div className="flex flex-col bg-gray-100 dark:bg-gray-900">
					<div className="flex flex-col gap-3 p-4 overflow-y-auto main">
						<AutoFoodTruk />
					</div>
				</div>
				<SiteFooter />
			</ThemeProvider>
			<Toaster />
		</>
	);
}

export default App;
