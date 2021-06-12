const {contextBridge, ipcRenderer} = require('electron')
const fs = require('fs')
const Store = require('electron-store')

const store = new Store()

// window.addEventListener('DOMContentLoaded', () => {
//     const replaceText = (selector, text) => {
//         const element = document.getElementById(selector)
//         if (element) element.innerText = text
//     }

//     for (const dependency of ['chrome', 'node', 'electron']) {
//         replaceText(`${dependency}-version`, process.versions[dependency])
//     }
// })

function transposeJSONData(colData) {
    let rowData = {}
    for (const colKey in colData) {
        if (Object.hasOwnProperty.call(colData, colKey)) {
            const colVals = colData[colKey];
            
            for (const rowIx in colVals) {
                if (Object.hasOwnProperty.call(colVals, rowIx)) {
                    const rowVal = colVals[rowIx];

                    // TODO: Find out a cleaner way to do this nested object initialization
                    if (rowData[rowIx] === undefined) {
                        rowData[rowIx] = new Object()
                    }
                    rowData[rowIx][colKey] = rowVal
                }
            }
        }
    }

    return rowData
}

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
                console.error(`Error reading file from disk: ${err}`);
            } else {
                callback(data)
                // // parse JSON string to JSON object
                // const jsonData = JSON.parse(data)
                // callback(jsonData)
            }
        });
    }
})

contextBridge.exposeInMainWorld('store', {
    initStore: (path) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                console.error(`Error reading file from disk: ${err}`);
            } else {
                let jsonData
                try {
                    jsonData = JSON.parse(data)
                } catch (error) {
                    console.error(`Error reading file from disk: ${error}`);
                }
                store.set({
                    "colData":jsonData,
                    "rowData":transposeJSONData(jsonData)
                })
            }
        })
    },
    getRowVals: (rowIx) => {
        return store.get("rowData." + rowIx)
    },
    getColVals: (col) => {
        return store.get("colData." + col)
    }
})