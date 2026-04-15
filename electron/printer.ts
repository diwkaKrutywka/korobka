/**
 * Thermal ticket printer — ESC/POS via Windows Print Spooler (RAW datatype)
 *
 * Architecture:
 *   Electron main  →  IPC  →  printer.ts
 *   printer.ts spawns a persistent PowerShell process once (warmup).
 *   PowerShell loads a C# P/Invoke helper via Add-Type (≈2 s cold start).
 *   Each print job:  main writes JSON line to PS stdin
 *                    PS calls winspool.drv WritePrinter with RAW datatype
 *                    PS writes JSON result to stdout
 *
 * Config: config.json next to the app (see DEFAULT_CONFIG for all keys).
 */

import { app } from 'electron'
import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { createRequire } from 'node:module'

const _require = createRequire(import.meta.url)

// ─── Config ───────────────────────────────────────────────────────────────────

interface PrinterConfig {
  enabled:     boolean
  printerName: string
  encoding:    string
  codepageId:  number
  simulate:    boolean
  clinicName:  string
}

const DEFAULT_CONFIG: PrinterConfig = {
  enabled:     true,
  printerName: 'CUSTOM TG2480-H',
  encoding:    'cp866',
  codepageId:  17,
  simulate:    false,
  clinicName:  'МЕД-ЦЕНТР',
}

let _cfg: PrinterConfig | null = null

export function loadConfig(): PrinterConfig {
  if (_cfg) return _cfg
  try {
    const p = path.join(app.getAppPath(), 'config.json')
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, 'utf-8'))
      _cfg = { ...DEFAULT_CONFIG, ...(raw.printer ?? {}) }
      return _cfg!
    }
  } catch (e) {
    console.warn('[printer] config.json read failed:', e)
  }
  _cfg = { ...DEFAULT_CONFIG }
  return _cfg
}

// ─── Ticket data ──────────────────────────────────────────────────────────────

export interface TicketPayload {
  ticketNo?:   string | number | null
  fio:         string
  doctor:      string
  specialty?:  string
  service?:    string
  date:        string      // long form:  "16 апреля 2026"
  dateShort:   string      // short form: "16 апреля"
  dayOfWeek:   string      // "вторник"
  time:        string      // "10:30"
  cabinet?:    string
  floor?:      string
}

// ─── ESC/POS receipt builder ──────────────────────────────────────────────────

const COLS = 32   // Font A on 80 mm paper — exactly 32 columns

export function buildEscPos(p: TicketPayload, cfg: PrinterConfig): Buffer {
  // iconv-lite is an external CJS module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconv: any = _require('iconv-lite')

  const ESC = 0x1b
  const GS  = 0x1d
  const LF  = 0x0a

  /** Encode UTF-8 string → printer codepage Buffer */
  const enc = (text: string): Buffer =>
    iconv.encode(String(text ?? ''), cfg.encoding) as Buffer

  /** Centre text within `w` character columns */
  const centre = (text: string, w = COLS): string => {
    const s = String(text).slice(0, w)
    return ' '.repeat(Math.floor((w - s.length) / 2)) + s
  }

  /** Two-column row: label left, value right, total = COLS chars */
  const twoCol = (label: string, value: string): string => {
    const l = String(label).slice(0, 18)
    const v = String(value).slice(0, COLS - l.length - 1)
    return l + ' '.repeat(Math.max(1, COLS - l.length - v.length)) + v
  }

  const SEP = '-'.repeat(COLS)

  const chunks: Buffer[] = []
  const push = (...b: Buffer[]) => b.forEach(x => chunks.push(x))
  const lf   = ()                => push(Buffer.from([LF]))
  const cmd  = (...b: number[])  => push(Buffer.from(b))

  // ── Init ────────────────────────────────────────────────────────────────
  cmd(ESC, 0x40)                        // ESC @   — initialise
  cmd(ESC, 0x74, cfg.codepageId)        // ESC t n — select codepage (17 = PC866)

  // ── Header ──────────────────────────────────────────────────────────────
  cmd(ESC, 0x61, 0x01)                  // ESC a 1 — centre
  cmd(ESC, 0x45, 0x01)                  // bold ON
  push(enc(cfg.clinicName)); lf()
  cmd(ESC, 0x45, 0x00)                  // bold OFF
  push(enc('ТАЛОН НА ПРИЁМ')); lf()

  // ── Ticket number — GS ! 0x21 = 2× width, 3× height ────────────────────
  push(enc(SEP)); lf()
  cmd(GS, 0x21, 0x21)
  cmd(ESC, 0x45, 0x01)
  // with 2× width, effective columns = COLS/2 = 16
  push(enc(centre(p.ticketNo != null ? `#${p.ticketNo}` : '—', 16)))
  lf()
  cmd(GS, 0x21, 0x00)
  cmd(ESC, 0x45, 0x00)

  // ── Date + time — GS ! 0x11 = 2× width, 2× height ───────────────────────
  push(enc(SEP)); lf()
  cmd(GS, 0x21, 0x11)
  cmd(ESC, 0x45, 0x01)
  push(enc(centre(`${p.dateShort}  ${p.time}`, 16)))
  lf()
  cmd(GS, 0x21, 0x00)
  cmd(ESC, 0x45, 0x00)
  push(enc(centre(p.dayOfWeek))); lf()

  // ── Details ─────────────────────────────────────────────────────────────
  push(enc(SEP)); lf()
  cmd(ESC, 0x61, 0x00)                  // left

  if (p.cabinet) {
    cmd(ESC, 0x45, 0x01)
    push(enc(twoCol('Кабинет', p.cabinet))); lf()
    cmd(ESC, 0x45, 0x00)
  }
  if (p.floor)     { push(enc(twoCol('Этаж',          p.floor)));     lf() }
  if (p.doctor)    { push(enc(twoCol('Врач',           p.doctor)));    lf() }
  if (p.specialty) { push(enc(twoCol('Специальность',  p.specialty))); lf() }
  if (p.service)   { push(enc(twoCol('Услуга',         p.service)));   lf() }

  push(enc(SEP)); lf()

  // ── Patient name ────────────────────────────────────────────────────────
  cmd(ESC, 0x61, 0x01)
  cmd(ESC, 0x45, 0x01)
  push(enc(p.fio.slice(0, COLS))); lf()
  cmd(ESC, 0x45, 0x00)

  // ── Footer ──────────────────────────────────────────────────────────────
  push(enc(SEP)); lf()
  cmd(ESC, 0x61, 0x01)
  push(enc(`Распечатано: ${new Date().toLocaleString('ru-RU')}`)); lf()
  push(enc('Просьба прийти за 10 минут')); lf()

  // 8 empty lines so ticket clears the cutter slot (≈ 30 mm)
  for (let i = 0; i < 8; i++) lf()

  // Atomic feed 16 lines + full cut — GS V 65 16
  // Must be atomic: split feed+cut commands cause 5-10 s spooler delay
  cmd(GS, 0x56, 0x41, 16)

  return Buffer.concat(chunks)
}

// ─── Persistent PowerShell RAW-print server ───────────────────────────────────

/**
 * The PS script compiles a C# P/Invoke helper (Add-Type ≈ 2.5 s one-time cost),
 * then loops on stdin reading JSON print jobs and writing JSON results to stdout.
 *
 * Protocol:
 *   stdin  ← {"printer":"CUSTOM TG2480-H","data":"<base64 ESC/POS bytes>"}\n
 *   stdout → {"ok":true}\n  |  {"ok":false,"error":"..."}\n
 */
const PS_SCRIPT = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8

Add-Type -Language CSharp -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public class RawPrinter {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    struct DOCINFO {
        [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
    }
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool OpenPrinter(string n, out IntPtr h, IntPtr d);
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool ClosePrinter(IntPtr h);
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern int  StartDocPrinter(IntPtr h, int lvl, ref DOCINFO di);
    [DllImport("winspool.drv", SetLastError=true)]
    static extern bool EndDocPrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)]
    static extern bool StartPagePrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)]
    static extern bool EndPagePrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)]
    static extern bool WritePrinter(IntPtr h, IntPtr p, int n, out int w);

    public static string Send(string printer, byte[] data) {
        IntPtr hPrinter;
        if (!OpenPrinter(printer, out hPrinter, IntPtr.Zero))
            return "OpenPrinter failed: " + Marshal.GetLastWin32Error();
        try {
            var di = new DOCINFO { pDocName="Ticket", pOutputFile=null, pDataType="RAW" };
            if (StartDocPrinter(hPrinter, 1, ref di) == 0)
                return "StartDocPrinter failed: " + Marshal.GetLastWin32Error();
            StartPagePrinter(hPrinter);
            IntPtr ptr = Marshal.AllocCoTaskMem(data.Length);
            Marshal.Copy(data, 0, ptr, data.Length);
            int written;
            bool ok = WritePrinter(hPrinter, ptr, data.Length, out written);
            Marshal.FreeCoTaskMem(ptr);
            EndPagePrinter(hPrinter);
            EndDocPrinter(hPrinter);
            if (!ok) return "WritePrinter failed: " + Marshal.GetLastWin32Error();
            return "ok";
        } finally { ClosePrinter(hPrinter); }
    }
}
'@

[Console]::Out.WriteLine('{"ready":true}')
[Console]::Out.Flush()

while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    $line = $line.Trim()
    if ($line -eq '') { continue }
    try {
        $req   = $line | ConvertFrom-Json
        $bytes = [Convert]::FromBase64String($req.data)
        $res   = [RawPrinter]::Send($req.printer, $bytes)
        if ($res -eq 'ok') {
            $resp = '{"ok":true}'
        } else {
            $resp = '{"ok":false,"error":' + ($res | ConvertTo-Json -Compress) + '}'
        }
    } catch {
        $resp = '{"ok":false,"error":' + ($_.Exception.Message | ConvertTo-Json -Compress) + '}'
    }
    [Console]::Out.WriteLine($resp)
    [Console]::Out.Flush()
}
`

let psProc:    ChildProcessWithoutNullStreams | null = null
let psReady    = false
let psBuffer   = ''
const psQueue: Array<{
  resolve: (r: { ok: boolean; error?: string }) => void
  reject:  (e: Error) => void
}> = []

function startPs(): void {
  if (psProc) return

  // Write script to a temp file — avoids command-line length limits
  const scriptPath = path.join(os.tmpdir(), 'med-print-server.ps1')
  fs.writeFileSync(scriptPath, PS_SCRIPT, 'utf-8')

  psProc = spawn('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath,
  ], { stdio: ['pipe', 'pipe', 'pipe'] })

  psProc.stdout.on('data', (chunk: Buffer) => {
    psBuffer += chunk.toString('utf8')
    const lines = psBuffer.split('\n')
    psBuffer = lines.pop() ?? ''

    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue
      try {
        const msg = JSON.parse(line) as { ready?: boolean; ok?: boolean; error?: string }
        if (msg.ready) {
          psReady = true
          console.info('[printer] PowerShell server ready')
        } else {
          psQueue.shift()?.resolve(msg as { ok: boolean; error?: string })
        }
      } catch {
        console.warn('[printer] PS stdout parse error:', line)
      }
    }
  })

  psProc.stderr.on('data', (d: Buffer) => {
    console.warn('[printer] PS stderr:', d.toString('utf8').trimEnd())
  })

  psProc.on('exit', (code) => {
    console.warn('[printer] PS exited', code)
    psProc  = null
    psReady = false
    const err = new Error('PowerShell server exited')
    for (const w of psQueue.splice(0)) w.reject(err)
  })
}

/** Call on app.whenReady() — starts PS and warms up Add-Type in the background */
export function warmupPrinter(): void {
  const cfg = loadConfig()
  if (!cfg.enabled || cfg.simulate) return
  startPs()
}

/** Call on app.on('will-quit') — closes PS cleanly */
export function shutdownPrinter(): void {
  if (!psProc) return
  try { psProc.stdin.end() } catch { /* ignore */ }
  psProc.kill()
  psProc  = null
  psReady = false
}

/** Print a ticket. Resolves with { ok, mode, bytes } */
export async function printTicket(
  payload: TicketPayload,
): Promise<{ ok: boolean; error?: string; mode?: string; bytes?: number }> {
  const cfg = loadConfig()

  if (!cfg.enabled) {
    return { ok: false, error: 'Принтер отключён в config.json' }
  }

  // ── Simulate mode (dev / test without physical printer) ─────────────────
  if (cfg.simulate) {
    const buf = buildEscPos(payload, cfg)
    console.info('[printer] SIMULATE — bytes:', buf.length, '→', cfg.printerName)
    return { ok: true, mode: 'simulate', bytes: buf.length }
  }

  // ── Real print via PowerShell RAW server ─────────────────────────────────
  if (!psProc) startPs()

  // Wait for PS to finish Add-Type warmup (up to 10 s)
  if (!psReady) {
    await new Promise<void>((resolve, reject) => {
      const deadline = setTimeout(
        () => reject(new Error('PowerShell server warmup timed out (10 s)')),
        10_000,
      )
      const poll = setInterval(() => {
        if (psReady) { clearInterval(poll); clearTimeout(deadline); resolve() }
      }, 100)
    })
  }

  const buf     = buildEscPos(payload, cfg)
  const request = JSON.stringify({ printer: cfg.printerName, data: buf.toString('base64') })

  const result = await new Promise<{ ok: boolean; error?: string }>((resolve, reject) => {
    psQueue.push({ resolve, reject })
    try {
      psProc!.stdin.write(request + '\n')
    } catch (e) {
      psQueue.pop()
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })

  return { ...result, mode: 'windowsRaw', bytes: buf.length }
}
