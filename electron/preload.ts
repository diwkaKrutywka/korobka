import { contextBridge, ipcRenderer } from 'electron'
import type { TicketPayload } from './printer'

contextBridge.exposeInMainWorld('terminal', {
  /**
   * Print a thermal ticket via ESC/POS RAW through Windows Print Spooler.
   * Returns { ok, mode, bytes } on success, { ok: false, error } on failure.
   */
  print: (payload: TicketPayload): Promise<{ ok: boolean; error?: string; mode?: string; bytes?: number }> =>
    ipcRenderer.invoke('terminal:print', payload),
})
