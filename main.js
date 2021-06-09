/*
    NOTE: main.js is the main process app that controls the entire
    Electron application. This function has access to Node.js and
    Electron.js methods. 

    Also to note, when using {curly braces} in a require statement,
    only the sub-modules corresponding to the arguments in the curly
    braces will be retrieved and correspondingly assigned. 
*/
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')


// Globally defining the Electron window
let win = null

function createWindow() {
    const windowOptions = {
        width: 800,
        height: 600,
        minWidth: 650,
        minHeight: 600,
        frame: true,
        title: app.getName(),
        webPreferences: {
            preload: path.join(__dirname,  'preload.js')
        //   // Setting nodeIntegration to true allows scripts in
        //   // windows intialized with these options to access node.js methods.
        //   nodeIntegration: true,
        //   /*
        //     contextIsolation restricts node access for security measures.
        //     Optimally, this should be kept to its default of true
        //     to prevent users from accessing node/electron methods.
            
        //     When using the ipcRenderer to communicate between the main
        //     process and the renderer process, certain channel phrases
        //     can be whitelisted through contextBridge. This seems to be
        //     the most secure way to communicate from the renderer process
        //     to the main process.
            
        //     https://www.electronjs.org/docs/tutorial/context-isolation
        //   */
        //   contextIsolation: true
        },
        icon: "icon.ico"
    }

    win = new BrowserWindow(windowOptions)

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

///////////////////////////////////////
// Context bridging
///////////////////////////////////////

/*
'save-dialog' is received here in the main process from the
 renderer process whenever it runs
`ipcRenderer.send('save-dialog')`
ipc.Renderer.send pings the channel specified in the parameters
it sends when it's called. In this case, it pings the 'save-dialog'
channel, which is then picked up here in the main process by
ipcMain.on('save-dialog')
*/
ipcMain.on('save-dialog', (event) => {
    const options = {
      title: 'Save an Image'
    //   filters: [
    //     { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
    //   ]
    }
// console.log("Beginning promise")
    dialog.showSaveDialog(options).then((filename) => {
// console.log("Promise resolved")
        /*
        The following will send back `filename` once
        the save dialog promise has completed. It'll send
        this back on the 'saved-file' channel. 
        
        The renderer process will receive this with
        `ipcRenderer.on("saved-file", listenerFunction(args))`.
        The listenerFunction will then be called with args
        returned from the below line of code, namely the
        data held in `filename`.
        */
        if (!filename.canceled) {
            event.sender.send('saved-file', filename.filePath)
        }
    })
// console.log("Promise made")
})

ipcMain.on('close-window', (event) => {
    app.quit()
})

ipcMain.on('open-dialog', (event) => {
    const options = {
        title: "Open a file"
    }

    dialog.showOpenDialog(options).then((filename) => {
        if (!filename.canceled) {
            event.sender.send("file-selected", filename.filePaths[0])
        }
    })
})