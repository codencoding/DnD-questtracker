/*
Easy equality comparison (eq)

    completed
        Completed, In-Progress, Not Started
    importance-level
        side-quest, minor-quest, major-quest
    level-at-assignment
        0-20 (Potentially more?)
    questline-index

Does string contain x? (cont)

    full-description
    summary
    main-location
    quest-name
    questline-name

Does list contain x, y, z...? (lst-cont)

    relevant-factions
    relevant-locations
    relevant-people

Date range (date)

    start-date
*/

const dateFilts = {
    'start-date': (valueCollection, compareValue) => {
        return dateFilt(valueCollection, compareValue, "ge")
    },
    'end-date': (valueCollection, compareValue) => {
        return dateFilt(valueCollection, compareValue, "le")
    },
}

const filterFuncs = {
    'eq': equalityFilt,
    'cont': containsFilt,
    'lst-cont': lstContFilt,
    'date': dateFilts
}


function trimExcessQuery(queryObj) {
    let trimQuery = {}

    // Loop through filter types
    for (const filterType in queryObj) {
        if (Object.hasOwnProperty.call(queryObj, filterType)) {
            const filters = queryObj[filterType];
            
            // Loop through each filter in each filter type
            for (const filter in filters) {
                if (Object.hasOwnProperty.call(filters, filter)) {
                    const filterVal = filters[filter];
                    
                    if (filterVal.trim()) {
                        if (!(filterType in trimQuery)) {
                            trimQuery[filterType] = {}
                        }
                        trimQuery[filterType][filter] = filterVal
                    }
                }
            }
        }
    }

    return trimQuery
}

function updateVals(storeObj, newKey) {
    // storeObj argument has rows as keys and old query key values as values.
    // Go through all the rows and inplace replace all the values with stored 
    // values corresponding to the newKey key.
    for (const rowKey in storeObj) {
        if (Object.hasOwnProperty.call(storeObj, rowKey)) {
            storeObj[rowKey] = window.store.getColVals(newKey + '.' + rowKey)
        }
    }

    return storeObj
}

function evalAllFilterTypes(queryKeys, validQuests, filterType) {
    for (const queryKey in queryKeys) {
        if (Object.hasOwnProperty.call(queryKeys, queryKey)) {
            const queryVal = queryKeys[queryKey];
            
            if (validQuests != undefined) {
                // Update current valid quest rows to retain new values held by the current
                // iteration's query key
                validQuests = updateVals(validQuests, queryKey)
            } else {
                // If validQuests hasn't yet been intialized, initialize it to all stored
                // values in the queryKey column
                validQuests = window.store.getColVals(queryKey)
            }

            if (filterType == "date") {
                // If filter is a date-type filter, use the date sub-filters
                validQuests = evalCollection(validQuests, queryVal, filterFuncs["date"][queryKey])
            } else {
                // Filter values based on corresponding filter function and desired filter value
                validQuests = evalCollection(validQuests, queryVal, filterFuncs[filterType])
            }

        }
    }

    return validQuests
}

function executeFilters(filterQuery) {
    filterQuery = trimExcessQuery(filterQuery)

    // If there are no filters left after trimming empty filters, return every row index as valid
    if (!Object.entries(filterQuery).length) {
        // TODO: Should redo this to return a more arbitrary "Everything is valid" object
        return Object.keys(window.store.getColVals("completed"))
    }

    // Assuming filterQuery is a list of {filterType:queryKey} objects
    let validQuests
    
    filterOrder = ["eq", "date", "cont", "lst-cont"]
    // Evaluate filters in the order specified above
    filterOrder.forEach((filterType) => {
        // Don't evaluate a filter if the key isn't present in the filterQuery
        if (Object.hasOwnProperty.call(filterQuery, filterType)) {
            validQuests = evalAllFilterTypes(filterQuery[filterType], validQuests, filterType)
        }
    })

    return Object.keys(validQuests)
}

function evalCollection(valueCollection, compareValue, validityFunc) {
    for (const rowIx in valueCollection) {
        if (Object.hasOwnProperty.call(valueCollection, rowIx)) {
            const rowVal = valueCollection[rowIx];
            // If row value isn't valid according to the passed-in validity function,
            // remove that row from the valid rows
            if (!validityFunc(rowVal, compareValue)) {
                delete valueCollection[rowIx]
                continue
            }
        }
    }

    return valueCollection
}

function equalityFilt(value, compareValue) {
    if (value == compareValue) {
        return true
    }
    return false
}

function containsFilt(value, containedValue) {
    // Filter for testing if key contains certain strings
    if (value.includes(containedValue)) {
        return true
    }
    return false
}

function lstContFilt(valueCollection, compareValue) {
    // Filter for if a list contains a certain string
    valueCollection = valueCollection.split(';')

    valueCollection.forEach(value => {
        if (containsFilt(value, compareValue)) {
            return true
        }
    });

    return false
}

function dateFilt(value, compareValue, compareOperator) {
    // Filters dates to be within a certain range
    // TODO
    const compareFuncs = {
        "ge":(val1, val2) => {
            return val1 >= val2
        },
        "le":(val1, val2) => {
            return val1 <= val2
        }
    }

    if (compareFuncs[compareOperator](Number(value), Number(compareValue))) {
        return true
    }
    return false
}