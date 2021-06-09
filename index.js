const createFileBtn = document.getElementById("createFileBtn")
const readFileBtn = document.getElementById("readFileBtn")
const fileDataDiv = document.getElementById("fileData")
const dataStatus = document.getElementById("dataStatus")
const loadAllDataBtn = document.getElementById("loadAllDataBtn")
const dataControlsDiv = document.getElementById("dataControls")
const filterControls = document.getElementById("filterControls")
const filterSubmitBtn = document.getElementById("filterSubmitBtn")
var rawFileData
var fileData
var filterData = {}


function getFormData() {
    let formElems = filterControls.children

    try {
        for (const formElem of formElems) {
            let formInput = formElem.children[1]
            filterData[formInput.id] = {
                inputType:formInput.tagName,
                value:formInput.value
            }
        };
        return true;
    } catch (error) {
        console.error("Could not read filter inputs. ", error)
        return false
    }
}

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

function updateQuestCards(jsonData) {
    while (fileDataDiv.lastChild) {
        fileDataDiv.removeChild(fileDataDiv.lastChild)
    }

    jsonData.forEach(elem => {
        let questCard = createQuestCard(elem)
        fileDataDiv.appendChild(questCard)
        fileDataDiv.appendChild(document.createElement('br'))
    })
}

function checkQuestValidity(quest) {
    for (const key in filterData) {
        if (Object.hasOwnProperty.call(filterData, key)) {
            let filtVal = filterData[key];
            let questKey = key.slice(0, key.length-7)
            
            if (filtVal["inputType"] == "SELECT") {
                if (quest[questKey] != filtVal["value"]) {
                    return false
                }
            } else if(filtVal["inputType"] == "INPUT") {
                // TODO: Filtering based on input text instead of preselected options
                continue
            }
        }
    }
    return true
}

function filterFileData() {
    fileData = []

    for (const quest of rawFileData) {
        if (checkQuestValidity(quest)) {
            fileData.push(quest)
        }
    }

    return fileData
}

loadAllDataBtn.addEventListener("click", (e) => {
    updateQuestCards(rawFileData)
})

filterSubmitBtn.addEventListener("click", (e) => {
    getFormData()
    fileData = filterFileData()
    updateQuestCards(fileData)
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
        rawFileData = JSON.parse(fData)
        fileData = rawFileData

        dataStatus.innerHTML = `Selected data at: ${path}`
        dataControlsDiv.style.visibility = "visible"
    })
})

// Close window button
////////////////////////

document.getElementById("closeBtn").addEventListener("click", function (e) {
    console.log("Closing window")
    window.ipc.send('close-window')
})