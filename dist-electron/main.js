import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import { fileURLToPath as r } from "node:url";
import i from "node:path";
//#region electron/main.ts
var a = i.dirname(r(import.meta.url)), o = process.env.VITE_DEV_SERVER_URL, s = null;
function c() {
	s = new e({
		width: 1920,
		height: 1080,
		fullscreen: !o,
		autoHideMenuBar: !0,
		webPreferences: {
			preload: i.join(a, "preload.cjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), o ? (s.loadURL(o), s.webContents.openDevTools()) : s.loadFile(i.join(a, "../dist/index.html"));
}
n.handle("get-printer-name", async () => {
	if (!s) return "";
	let e = await s.webContents.getPrintersAsync();
	return e.find((e) => e.isDefault)?.name ?? e[0]?.name ?? "";
}), n.handle("print-ticket", (t, n) => new Promise((t) => {
	let r = new e({
		show: !1,
		webPreferences: { contextIsolation: !0 }
	});
	r.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(n)), r.webContents.once("did-finish-load", () => {
		r.webContents.print({
			silent: !0,
			printBackground: !0
		}, (e, n) => {
			r.destroy(), t(e ? { ok: !0 } : {
				ok: !1,
				error: n
			});
		});
	}), r.webContents.once("did-fail-load", (e, n, i) => {
		r.destroy(), t({
			ok: !1,
			error: i
		});
	});
})), t.whenReady().then(() => {
	c(), t.on("activate", () => {
		e.getAllWindows().length === 0 && c();
	});
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
