let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("terminal", { print: (payload) => electron.ipcRenderer.invoke("terminal:print", payload) });
//#endregion
