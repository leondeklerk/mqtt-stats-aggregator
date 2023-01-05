const preventInstall = process.env.CI !== undefined || process.env.NODE_ENV === "production";
if (!preventInstall) {
	import("husky").then((husky) => {
		husky.install();
	});
}
