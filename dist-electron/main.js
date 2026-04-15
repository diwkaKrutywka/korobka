import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import { fileURLToPath as r } from "node:url";
import i from "node:path";
import { spawn as a } from "node:child_process";
import o from "node:fs";
import s from "node:os";
//#region electron/printer.ts
var c = {
	enabled: !0,
	printerName: "CUSTOM TG2480-H",
	fontName: "Courier New",
	simulate: !1,
	clinicName: "МЕД-ЦЕНТР"
}, l = null;
function u() {
	if (l) return l;
	try {
		let e = i.join(t.getAppPath(), "config.json");
		if (o.existsSync(e)) {
			let t = JSON.parse(o.readFileSync(e, "utf-8"));
			return l = {
				...c,
				...t.printer ?? {}
			}, l;
		}
	} catch (e) {
		console.warn("[printer] config.json read failed:", e);
	}
	return l = { ...c }, l;
}
var d = {
	ru: {
		ticket: "ТАЛОН НА ПРИЁМ",
		patient: "Пациент",
		iin: "ИИН",
		doctor: "Врач",
		appt: "Приём",
		cabinet: "Кабинет",
		floorSuffix: "эт.",
		thanksLine1: "Спасибо,",
		thanksLine2: "что выбрали нас!",
		registry: "Регистратура",
		printed: "Распечатано"
	},
	kk: {
		ticket: "ҚАБЫЛДАУҒА ТАЛОН",
		patient: "Пациент",
		iin: "ЖСН",
		doctor: "Дәрігер",
		appt: "Қабылдау",
		cabinet: "Кабинет",
		floorSuffix: "қ.",
		thanksLine1: "Бізді таңдағаныңызға",
		thanksLine2: "рахмет!",
		registry: "Тіркеу",
		printed: "Басылған"
	}
}, f = 32;
"=".repeat(f), "-".repeat(f);
function p() {
	return (/* @__PURE__ */ new Date()).toLocaleString("ru-RU");
}
function m(e, t = 24) {
	let n = e.split(" "), r = [], i = "";
	for (let e of n) (i + " " + e).trim().length > t ? (r.push(i.trim()), i = e) : i += " " + e;
	return i && r.push(i.trim()), r;
}
function h(e, t) {
	let n = d[e.locale ?? "ru"], r = [], i = (...e) => r.push(...e);
	i({
		text: t.clinicName,
		bold: !0,
		center: !0,
		size: 16
	}), t.clinicAddress && i({
		text: t.clinicAddress,
		center: !0,
		size: 11
	}), i({ lf: 1 }), i({ text: "═".repeat(32) }), i({
		text: String(e.ticketNo ?? "—"),
		bold: !0,
		center: !0,
		size: 26
	}), i({ text: "═".repeat(32) }), i({ lf: 1 }), i({
		text: e.dateShort,
		bold: !0,
		center: !0,
		size: 18
	}), i({
		text: e.time,
		bold: !0,
		center: !0,
		size: 18
	}), i({
		text: e.dayOfWeek,
		bold: !0,
		center: !0,
		size: 18
	}), i({ lf: 2 }), i({ text: "─".repeat(32) });
	let a = (e, t) => {
		t && (i({
			text: e,
			bold: !0,
			size: 12
		}), m(t, 20).forEach((e) => i({
			text: e,
			size: 14
		})), i({ lf: 1 }));
	};
	a(`${n.patient}:`, e.fio), e.iin && a(`${n.iin}:`, e.iin), a(`${n.doctor}:`, e.doctor);
	let o = [e.specialty, e.service].filter(Boolean).join(" · ");
	if (o && a(`${n.appt}:`, o), e.cabinet) {
		let t = e.floor ? `${e.cabinet}, ${e.floor} ${n.floorSuffix}` : e.cabinet;
		a(`${n.cabinet}:`, t);
	}
	return i({ text: "─".repeat(32) }), i({ lf: 1 }), i({
		text: n.thanksLine1,
		bold: !0,
		center: !0,
		size: 13
	}), i({
		text: n.thanksLine2,
		bold: !0,
		center: !0,
		size: 13
	}), i({ lf: 1 }), t.clinicPhone && i({
		text: `${n.registry} · ${t.clinicPhone}`,
		center: !0,
		size: 11
	}), t.clinicSite && i({
		text: t.clinicSite,
		center: !0,
		size: 11
	}), i({ lf: 1 }), i({
		text: n.printed,
		center: !0,
		bold: !0,
		size: 11
	}), i({
		text: p(),
		center: !0,
		bold: !0,
		size: 11
	}), i({ lf: 6 }), r;
}
var g = "\n[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n[Console]::InputEncoding  = [System.Text.Encoding]::UTF8\n\nAdd-Type -AssemblyName System.Drawing\n\n[Console]::Out.WriteLine('{\"ready\":true}')\n[Console]::Out.Flush()\n\nwhile ($true) {\n    $rawLine = [Console]::In.ReadLine()\n    if ($null -eq $rawLine) { break }\n    $rawLine = $rawLine.Trim()\n    if ($rawLine -eq '') { continue }\n    try {\n        $req      = $rawLine | ConvertFrom-Json\n        $fontName = if ($req.fontName) { [string]$req.fontName } else { 'Courier New' }\n        $tLines   = $req.lines\n\n        $doc = New-Object System.Drawing.Printing.PrintDocument\n        $doc.PrinterSettings.PrinterName = [string]$req.printer\n        $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(5, 5, 5, 5)\n\n        $doc.add_PrintPage({\n            param($sender, $e)\n            [float]$y    = 5\n            [float]$maxW = $e.PageBounds.Width - 15\n\n            foreach ($tl in $tLines) {\n                # Blank lines\n                if ($null -ne $tl.lf -and [int]$tl.lf -gt 0) {\n                    $bfont = New-Object System.Drawing.Font($fontName, [float]9)\n                    $y += $bfont.GetHeight($e.Graphics) * [float][int]$tl.lf\n                    $bfont.Dispose()\n                    continue\n                }\n\n                $text     = if ($null -ne $tl.text)   { [string]$tl.text } else { '' }\n                $fs       = if ($null -ne $tl.size)    { [float]$tl.size } else { [float]9 }\n                $isBold   = ($null -ne $tl.bold)   -and [bool]$tl.bold\n                $isCenter = ($null -ne $tl.center) -and [bool]$tl.center\n                $style    = if ($isBold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }\n                $font     = New-Object System.Drawing.Font($fontName, $fs, $style)\n                $lh       = $font.GetHeight($e.Graphics)\n\n                if ($isCenter) {\n                    $sz = $e.Graphics.MeasureString($text, $font)\n                    $x  = [Math]::Max([float]5, ($maxW - $sz.Width) / 2 + [float]5)\n                    $e.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, $x, $y)\n                } else {\n                    $e.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, [float]5, $y)\n                }\n\n                $y += $lh\n                $font.Dispose()\n            }\n            $e.HasMorePages = $false\n        }.GetNewClosure())\n\n        $doc.Print()\n        $doc.Dispose()\n        $resp = '{\"ok\":true}'\n    } catch {\n        $resp = '{\"ok\":false,\"error\":' + ($_.Exception.Message | ConvertTo-Json -Compress) + '}'\n    }\n    [Console]::Out.WriteLine($resp)\n    [Console]::Out.Flush()\n}\n", _ = null, v = !1, y = "", b = [];
function x() {
	if (_) return;
	let e = i.join(s.tmpdir(), "med-print-server.ps1");
	o.writeFileSync(e, g, "utf-8"), _ = a("powershell.exe", [
		"-NoProfile",
		"-NonInteractive",
		"-ExecutionPolicy",
		"Bypass",
		"-File",
		e
	], { stdio: [
		"pipe",
		"pipe",
		"pipe"
	] }), _.stdout.on("data", (e) => {
		y += e.toString("utf8");
		let t = y.split("\n");
		y = t.pop() ?? "";
		for (let e of t) {
			let t = e.trim();
			if (t) try {
				let e = JSON.parse(t);
				e.ready ? (v = !0, console.info("[printer] PowerShell GDI server ready")) : b.shift()?.resolve(e);
			} catch {
				console.warn("[printer] PS stdout parse error:", t);
			}
		}
	}), _.stderr.on("data", (e) => {
		console.warn("[printer] PS stderr:", e.toString("utf8").trimEnd());
	}), _.on("exit", (e) => {
		console.warn("[printer] PS exited", e), _ = null, v = !1;
		let t = /* @__PURE__ */ Error("PowerShell server exited");
		for (let e of b.splice(0)) e.reject(t);
	});
}
function S() {
	let e = u();
	!e.enabled || e.simulate || x();
}
function C() {
	if (_) {
		try {
			_.stdin.end();
		} catch {}
		_.kill(), _ = null, v = !1;
	}
}
async function w(e) {
	let t = u();
	if (!t.enabled) return {
		ok: !1,
		error: "Принтер отключён в config.json"
	};
	if (t.simulate) {
		let n = h(e, t);
		return console.info("[printer] SIMULATE — lines:", n.length, "→", t.printerName), {
			ok: !0,
			mode: "simulate",
			bytes: n.length
		};
	}
	_ || x(), v || await new Promise((e, t) => {
		let n = setTimeout(() => t(/* @__PURE__ */ Error("PowerShell server warmup timed out (10 s)")), 1e4), r = setInterval(() => {
			v && (clearInterval(r), clearTimeout(n), e());
		}, 100);
	});
	let n = h(e, t), r = JSON.stringify({
		printer: t.printerName,
		fontName: t.fontName ?? "Courier New",
		lines: n
	});
	return {
		...await new Promise((e, t) => {
			b.push({
				resolve: e,
				reject: t
			});
			try {
				_.stdin.write(r + "\n");
			} catch (e) {
				b.pop(), t(e instanceof Error ? e : Error(String(e)));
			}
		}),
		mode: "windowsGdi",
		bytes: n.length
	};
}
//#endregion
//#region electron/main.ts
var T = i.dirname(r(import.meta.url)), E = process.env.VITE_DEV_SERVER_URL, D = null;
function O() {
	D = new e({
		width: 1920,
		height: 1080,
		fullscreen: !E,
		autoHideMenuBar: !0,
		webPreferences: {
			preload: i.join(T, "preload.cjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), E ? (D.loadURL(E), D.webContents.openDevTools()) : D.loadFile(i.join(T, "../dist/index.html"));
}
n.handle("terminal:print", async (e, t) => {
	try {
		return await w(t);
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		return console.error("[IPC terminal:print]", t), {
			ok: !1,
			error: t
		};
	}
}), t.whenReady().then(() => {
	S(), O(), t.on("activate", () => {
		e.getAllWindows().length === 0 && O();
	});
}), t.on("will-quit", () => {
	C();
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
