import "./App.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import Navbar from "./components/Navbar";
import SiteFooter from "./components/Footer";
import HeaderSection from "./components/Header";
import LokasiFoodTruk from "./components/Settings/Settingcard.ft";

const LandingPage = () => {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Navbar />
				<div className="min-h-screen main bg-background">
					<div className="container px-4 mx-auto sm:px-6 lg:px-8">
						<HeaderSection />
						<section id="settings" className="py-12">
							<h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
							<p className="text-muted-foreground">
								Atur lokasi Food Truck default Anda.
							</p>
							<div className="mt-6">
								<LokasiFoodTruk />
							</div>
						</section>
					</div>
				</div>
				<SiteFooter />
			</ThemeProvider>
			<Toaster />
		</>
	);
};

export default LandingPage;
