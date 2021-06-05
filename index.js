var createFileBtn = document.getElementById("createFileBtn")

createFileBtn.addEventListener("click", (e) => {
    window.ipc.send('save-dialog')
    // ipcRenderer.send('save-dialog')
})

document.getElementById("closeBtn").addEventListener("click", function (e) {
    console.log("Closing window")
    window.ipc.send('close-window')
    // ipcRenderer.send('close-window')
})

// ipcRenderer.on("saved-file", (e, path) => {
window.ipc.on("saved-file", (path) => {
    console.log("File path specified: ", path)
    window.fs.writeFile(path, "test file content")
    console.log("File save completed")
})