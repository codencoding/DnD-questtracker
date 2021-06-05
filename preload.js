const {contextBridge, ipcRenderer} = require('electron')
const fs = require('fs')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

const validChannels = ['save-dialog', 'close-window', 'saved-file']
contextBridge.exposeInMainWorld('ipc', {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
        }
    },
    on: (channel, func) => {
        if (validChannels.includes(channel)) {
            // Strip the event parameter as it includes `sender` and is a security risk
            ipcRenderer.on(channel, (event, ...args) => func(...args))
        }
    },
    saveFile: (path, content) => {
        console.log("Saving test file")
        fs.writeFile(path, content, (err) => {
            if(err) {
                console.error("File could not be created")
            }
        })
    }
})

contextBridge.exposeInMainWorld('fs', {
    writeFile: (path, content) => {
        console.log(path)
        // TODO: This strict equality (===) doesn't seem to be catching. Worth looking into more.
        if (path === undefined) {
            // User opened save dialog, but then closed it without opting to save.
            console.log("User opened save dialog, but then closed it without opting to save.")
            return
        }

        fs.writeFile(path, content, (err) => {
            if(err) {
                console.error("File could not be created")
            }
        })
    }
})