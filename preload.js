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


///////////////////////////////////////
// Context bridging
///////////////////////////////////////

const validChannels = ['save-dialog', 'close-window', 'saved-file', 'open-dialog', 'file-selected']
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
        fs.writeFile(path, content, (err) => {
            if(err) {
                console.error(`File could not be created at: ${path}`)
            }
        })
    },
    readFile: (path, encoding, callback) => {
        fs.readFile(path, encoding, (err, data) => {
            if (err) {
                console.log(`Error reading file from disk: ${err}`);
            } else {
                callback(data)
                // // parse JSON string to JSON object
                // const jsonData = JSON.parse(data)
                // callback(jsonData)
            }
        });
    }
})