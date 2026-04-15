/**
 * Thermal ticket printer — GDI via Windows System.Drawing.Printing.PrintDocument
 *
 * Architecture:
 *   Electron main  →  IPC  →  printer.ts
 *   printer.ts spawns a persistent PowerShell process once (warmup).
 *   PowerShell loads System.Drawing (~100 ms, no C# compilation needed).
 *   Each print job: main writes JSON line to PS stdin
 *                   PS renders ticket lines with GDI PrintDocument
 *                   PS writes JSON result to stdout
 *
 * GDI rendering gives full Unicode support — Kazakh Ə Ғ Қ Ң Ө Ұ Ү Һ І
 * and any other Unicode characters print correctly via the system font.
 *
 * Config: config.json next to the app (see DEFAULT_CONFIG for all keys).
 */

import { app } from 'electron'
import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

// ─── Config ───────────────────────────────────────────────────────────────────

interface PrinterConfig {
  enabled:        boolean
  printerName:    string
  /** GDI font used for rendering — must be installed on the system */
  fontName:       string
  simulate:       boolean
  clinicName:     string
  clinicAddress?: string
  clinicPhone?:   string
  clinicSite?:    string
}

const DEFAULT_CONFIG: PrinterConfig = {
  enabled:     true,
  printerName: 'CUSTOM TG2480-H',
  fontName:    'Courier New',
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

// ─── Ticket payload ───────────────────────────────────────────────────────────

export interface TicketPayload {
  ticketNo?:   string | number | null
  fio:         string
  iin?:        string
  doctor:      string
  specialty?:  string
  service?:    string
  date:        string       // "16 сәуір 2026"
  dateShort:   string       // "16 сәуір"
  dayOfWeek:   string       // "сейсенбі"
  time:        string       // "10:30"
  cabinet?:    string
  floor?:      string
  locale?:     string       // 'ru' | 'kk'
}

// ─── Locale-aware labels ──────────────────────────────────────────────────────

interface TicketLabels {
  ticket:      string
  patient:     string
  iin:         string
  doctor:      string
  appt:        string
  cabinet:     string
  floorSuffix: string
  thanks:      string
  registry:    string
  printed:     string
}

const LABELS: Record<string, TicketLabels> = {
  ru: {
    ticket: 'ТАЛОН НА ПРИЁМ',
    patient: 'Пациент',
    iin: 'ИИН',
    doctor: 'Врач',
    appt: 'Приём',
    cabinet: 'Кабинет',
    floorSuffix: 'эт.',
    thanksLine1: 'Спасибо,',
    thanksLine2: 'что выбрали нас!',
    registry: 'Регистратура',
    printed: 'Распечатано',
  },
  kk: {
    ticket: 'ҚАБЫЛДАУҒА ТАЛОН',
    patient: 'Пациент',
    iin: 'ЖСН',
    doctor: 'Дәрігер',
    appt: 'Қабылдау',
    cabinet: 'Кабинет',
    floorSuffix: 'қ.',
    thanksLine1: 'Бізді таңдағаныңызға',
    thanksLine2: 'рахмет!',
    registry: 'Тіркеу',
    printed: 'Басылған',
  },
}
// ─── GDI line descriptor ──────────────────────────────────────────────────────

interface GdiLine {
  text?:    string
  size?:    number     // font size in pt — default 9
  bold?:    boolean
  center?:  boolean
  lf?:      number     // blank lines to insert
}

// ─── Ticket builder ───────────────────────────────────────────────────────────

const COLS  = 32
const SEP_H = '='.repeat(COLS)
const SEP_T = '-'.repeat(COLS)

function formatNow(): string {
  return new Date().toLocaleString('ru-RU')
}

function wrapText(text: string, max = 24): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if ((current + ' ' + word).trim().length > max) {
      lines.push(current.trim())
      current = word
    } else {
      current += ' ' + word
    }
  }

  if (current) lines.push(current.trim())
  return lines
}
export function buildTicketLines(p: TicketPayload, cfg: PrinterConfig): GdiLine[] {
  const L = LABELS[p.locale ?? 'ru']
  const lines: GdiLine[] = []
  const push = (...ls: GdiLine[]) => lines.push(...ls)

  push({ text: cfg.clinicName, bold: true, center: true, size: 16 })
  if (cfg.clinicAddress) push({ text: cfg.clinicAddress, center: true, size: 11 })

  push({ lf: 1 })

  push({ text: '═'.repeat(32) })
  push({ text: String(p.ticketNo ?? '—'), bold: true, center: true, size: 26 })
  push({ text: '═'.repeat(32) })

  push({ lf: 1 })

  push({ text: p.dateShort, bold: true, center: true, size: 18 })
  push({ text: p.time, bold: true, center: true, size: 18 })
  push({ text: p.dayOfWeek, bold: true, center: true, size: 18 })

  push({ lf: 2 })

  push({ text: '─'.repeat(32) })

  const block = (label: string, value?: string) => {
    if (!value) return

    push({ text: label, bold: true, size: 12 })

    const wrapped = wrapText(value, 20)
    wrapped.forEach(line => push({ text: line, size: 14 }))

    push({ lf: 1 })
  }

  block(`${L.patient}:`, p.fio)
  if (p.iin) block(`${L.iin}:`, p.iin)
  block(`${L.doctor}:`, p.doctor)

  const apptVal = [p.specialty, p.service].filter(Boolean).join(' · ')
  if (apptVal) block(`${L.appt}:`, apptVal)

  if (p.cabinet) {
    const cabVal = p.floor
      ? `${p.cabinet}, ${p.floor} ${L.floorSuffix}`
      : p.cabinet
    block(`${L.cabinet}:`, cabVal)
  }

  push({ text: '─'.repeat(32) })

  push({ lf: 1 })

  // 🔥 THANK YOU (2 строки отдельно)
  push({ text: L.thanksLine1, bold: true, center: true, size: 13 })
  push({ text: L.thanksLine2, bold: true, center: true, size: 13 })

  push({ lf: 1 })

  if (cfg.clinicPhone)
    push({ text: `${L.registry} · ${cfg.clinicPhone}`, center: true, size: 11 })

  if (cfg.clinicSite)
    push({ text: cfg.clinicSite, center: true, size: 11 })

  push({ lf: 1 })

  // 🔥 PRINTED (жирно + отдельно)
  push({ text: L.printed, center: true, bold: true, size: 11 })
  push({ text: formatNow(), center: true, bold: true, size: 11 })

  push({ lf: 6 })

  return lines
}
// ─── Persistent PowerShell GDI print server ───────────────────────────────────
/**
 * Protocol (same stdin/stdout JSON-lines as before):
 *   stdin  ← {"printer":"...","fontName":"Courier New","lines":[{...},...]}
 *   stdout → {"ok":true}  |  {"ok":false,"error":"..."}
 *
 * PowerShell uses System.Drawing.Printing.PrintDocument for GDI rendering.
 * No C# Add-Type compilation — warmup is fast (~100 ms).
 */
const PS_SCRIPT = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Drawing

[Console]::Out.WriteLine('{"ready":true}')
[Console]::Out.Flush()

while ($true) {
    $rawLine = [Console]::In.ReadLine()
    if ($null -eq $rawLine) { break }
    $rawLine = $rawLine.Trim()
    if ($rawLine -eq '') { continue }
    try {
        $req      = $rawLine | ConvertFrom-Json
        $fontName = if ($req.fontName) { [string]$req.fontName } else { 'Courier New' }
        $tLines   = $req.lines

        $doc = New-Object System.Drawing.Printing.PrintDocument
        $doc.PrinterSettings.PrinterName = [string]$req.printer
        $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(5, 5, 5, 5)

        $doc.add_PrintPage({
            param($sender, $e)
            [float]$y    = 5
            [float]$maxW = $e.PageBounds.Width - 15

            foreach ($tl in $tLines) {
                # Blank lines
                if ($null -ne $tl.lf -and [int]$tl.lf -gt 0) {
                    $bfont = New-Object System.Drawing.Font($fontName, [float]9)
                    $y += $bfont.GetHeight($e.Graphics) * [float][int]$tl.lf
                    $bfont.Dispose()
                    continue
                }

                $text     = if ($null -ne $tl.text)   { [string]$tl.text } else { '' }
                $fs       = if ($null -ne $tl.size)    { [float]$tl.size } else { [float]9 }
                $isBold   = ($null -ne $tl.bold)   -and [bool]$tl.bold
                $isCenter = ($null -ne $tl.center) -and [bool]$tl.center
                $style    = if ($isBold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
                $font     = New-Object System.Drawing.Font($fontName, $fs, $style)
                $lh       = $font.GetHeight($e.Graphics)

                if ($isCenter) {
                    $sz = $e.Graphics.MeasureString($text, $font)
                    $x  = [Math]::Max([float]5, ($maxW - $sz.Width) / 2 + [float]5)
                    $e.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, $x, $y)
                } else {
                    $e.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, [float]5, $y)
                }

                $y += $lh
                $font.Dispose()
            }
            $e.HasMorePages = $false
        }.GetNewClosure())

        $doc.Print()
        $doc.Dispose()
        $resp = '{"ok":true}'
    } catch {
        $resp = '{"ok":false,"error":' + ($_.Exception.Message | ConvertTo-Json -Compress) + '}'
    }
    [Console]::Out.WriteLine($resp)
    [Console]::Out.Flush()
}
`

// ─── PS process state (unchanged) ────────────────────────────────────────────

let psProc:    ChildProcessWithoutNullStreams | null = null
let psReady    = false
let psBuffer   = ''
const psQueue: Array<{
  resolve: (r: { ok: boolean; error?: string }) => void
  reject:  (e: Error) => void
}> = []

function startPs(): void {
  if (psProc) return

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
          console.info('[printer] PowerShell GDI server ready')
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

/** Call on app.whenReady() — starts PS and warms up System.Drawing */
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

/** Print a ticket. Resolves with { ok, mode } */
export async function printTicket(
  payload: TicketPayload,
): Promise<{ ok: boolean; error?: string; mode?: string; bytes?: number }> {
  const cfg = loadConfig()

  if (!cfg.enabled) {
    return { ok: false, error: 'Принтер отключён в config.json' }
  }

  if (cfg.simulate) {
    const lines = buildTicketLines(payload, cfg)
    console.info('[printer] SIMULATE — lines:', lines.length, '→', cfg.printerName)
    return { ok: true, mode: 'simulate', bytes: lines.length }
  }

  if (!psProc) startPs()

  // Wait for PS warmup (up to 10 s)
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

  const lines   = buildTicketLines(payload, cfg)
  const request = JSON.stringify({
    printer:  cfg.printerName,
    fontName: cfg.fontName ?? 'Courier New',
    lines,
  })

  const result = await new Promise<{ ok: boolean; error?: string }>((resolve, reject) => {
    psQueue.push({ resolve, reject })
    try {
      psProc!.stdin.write(request + '\n')
    } catch (e) {
      psQueue.pop()
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })

  return { ...result, mode: 'windowsGdi', bytes: lines.length }
}
