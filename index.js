const createFileBtn = document.getElementById("createFileBtn")
const readFileBtn = document.getElementById("readFileBtn")
const fileDataDiv = document.getElementById("fileData")
const dataStatus = document.getElementById("dataStatus")
const populateFileDataBtn = document.getElementById("populateFileData")
var fileData;


function createQuestCard(questData) {
    let questDiv = document.createElement("ol")
    questDiv.classList = "questCard"
    for (const key in questData) {
        const keyVal = questData[key]
        
        let listElem = document.createElement("li")

        listElem.innerHTML = `<b>${key}</b>: ${keyVal}`

        questDiv.appendChild(listElem)
    }
    return questDiv
}

function populateQuests(jsonData) {
    jsonData.forEach(elem => {
        let questCard = createQuestCard(elem)
        fileDataDiv.appendChild(questCard)
        fileDataDiv.appendChild(document.createElement('br'))
    })
}

populateFileDataBtn.addEventListener("click", (e) => {
    populateQuests(fileData)
})

///////////////////////////////////////
// Context bridging
///////////////////////////////////////

// Save file button
/////////////////////

createFileBtn.addEventListener("click", (e) => {
    window.ipc.send('save-dialog')
})

window.ipc.on("saved-file", (path) => {
    console.log("File path specified: ", path)
    window.fs.writeFile(path, "test file content")
    console.log("File save completed")
})

// Read file button
/////////////////////

readFileBtn.addEventListener("click", (e) => {
    window.ipc.send('open-dialog')
})

window.ipc.on("file-selected", (path) => {

    window.fs.readFile(path, "utf8", (fData) => {
        fileData = JSON.parse(fData)

        dataStatus.innerHTML = `Selected data at: ${path}`
        populateFileDataBtn.style.visibility = "visible"
    })
})

// Close window button
////////////////////////

document.getElementById("closeBtn").addEventListener("click", function (e) {
    console.log("Closing window")
    window.ipc.send('close-window')
})