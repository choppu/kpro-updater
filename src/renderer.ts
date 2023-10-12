import { UI } from "./ui";
const { ipcRenderer } = require('electron');

let pBarProgress = 0;

const fwUpdateBtn = document.getElementById("btn-fw-update") as HTMLButtonElement;
const dbUpdateBtn = document.getElementById("btn-erc20-update") as HTMLButtonElement;

export function handleLog(event: string, msg: string): void {
  ipcRenderer.on(event, (_ : any) => {
    UI.updateStatusMessage(msg);
  });
}

export function handleUpdateProgress(event: string) : void {
  ipcRenderer.on(event, (_ : any, progress: number) => {
    let { progressBar, finished } = UI.handleLoadProgress(pBarProgress, progress);
    pBarProgress = progressBar;

    if(finished) {
      ipcRenderer.send("last-chunk");
    }
  });
}

ipcRenderer.on("kpro-connected", (_ : any, connected: boolean) => {
  UI.handleConnected(connected);
});

ipcRenderer.on("kpro-disconnected", (_ : any, connected: boolean) => {
  UI.handleConnected(connected);
  UI.disableProgressBar();
  pBarProgress = 0;
});

ipcRenderer.on("firmware-length", (_: any, length: number) => {
  UI.setPBarMaxLength(length);
});

ipcRenderer.on("db-length", (_: any, length: number) => {
  UI.setPBarMaxLength(length);
});

ipcRenderer.on("set-version", (_: any, db_ver: number, fw_ver: string) => {
  UI.setVersion(db_ver, fw_ver);
});

ipcRenderer.on("updating-firmware", () => {
  pBarProgress = 0;
  UI.enableProgressBar();
});

ipcRenderer.on("firmware-updated", () => {
  UI.disableProgressBar();
  dbUpdateBtn.disabled = false;
  UI.updateStatusMessage("Firmware updated successfully");
});

ipcRenderer.on("updating-db", () => {
  pBarProgress = 0;
  UI.enableProgressBar();
});

ipcRenderer.on("db-updated", () => {
  UI.disableProgressBar();
  fwUpdateBtn.disabled = false;
  UI.updateStatusMessage("ERC20 database updated successfully");
});

ipcRenderer.on("disable-db-update", () => {
  dbUpdateBtn.disabled = true;
});

ipcRenderer.on("disable-fw-update", () => {
  fwUpdateBtn.disabled = true;
});

ipcRenderer.on("card-exceptions", function (_ : any, err: any) {
  UI.updateStatusMessage(err);
});

ipcRenderer.on("changelog", (_: any, data: string, fwVersion: string) => {
  const modalWindow = window.open('', 'modal', `width=500,height=550, title=Keycard Pro | Release Notes | Version ${fwVersion}`);
  UI.handleChangelog(modalWindow as Window, data)
})

handleLog("no-fw-update-needed", "Your firmware is up-to-date");
handleLog("no-db-update-needed", "Your ERC20 database is up-to-date");
handleUpdateProgress("chunk-loaded");

fwUpdateBtn.addEventListener("click", (e) => {
  ipcRenderer.send("update-firmware");
  e.preventDefault();
});

dbUpdateBtn.addEventListener("click", (e) => {
  ipcRenderer.send("update-erc20");
  e.preventDefault();
});

document.getElementById("kpro-message-close")?.addEventListener("click", (e) => {
  UI.hideStatusMessage();
});

document.getElementById("btn-fw-changelog")?.addEventListener("click", (e) => {
  ipcRenderer.send("get-changelog");
  e.preventDefault();
})


