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

Equality or contains (eq-cont)

    main-location
    quest-name
    questline-name

Does list contain x, y, z...? (lst-cont)

    relevant-factions
    relevant-locations
    relevant-people

Date range (date-range)

    start-date
*/


const filterFuncs = {
    'completed': equalityFilt,
    'full-description': containsFilt,
    'importance-level': equalityFilt,
    'level-at-assignment': equalityFilt,
    'main-location': eqOrContFilt,
    'quest-name': eqOrContFilt,
    'questline-index': equalityFilt,
    'questline-name': eqOrContFilt,
    'relevant-factions': lstContFilt,
    'relevant-locations': lstContFilt,
    'relevant-people': lstContFilt,
    'start-date': dateRangeFilt,
    'summary': containsFilt
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
            storeObj[rowKey] = window.store.getKeyVals(newKey + '.' + rowKey)
        }
    }

    return storeObj
}

function evalAllFilterTypes(queryKeys, validQuests) {
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
                validQuests = window.store.getKeyVals(queryKey)
            }
            // Filter values based on corresponding filter function and desired filter value
            validQuests = filterFuncs[queryKey](validQuests, queryVal)                
        }
    }

    return validQuests
}

async function executeFilters(filterQuery) {
    // Assuming filterQuery is a list of {filterType:queryKey} objects
    let validQuests
    
    filterOrder = ["eq", "eq-cont", "date-range", "cont", "lst-cont"]
    // Evaluate filters in the order specified above
    filterOrder.forEach((filterType) => {
        // Don't evaluate a filter if the key isn't present in the filterQuery
        if (Object.hasOwnProperty.call(filterQuery, filterType)) {
            validQuests = evalAllFilterTypes(filterQuery[filterType], validQuests)
        }
    })

    return validQuests
}

function equalityFilt(valueCollection, compareValue) {
    // Filter for testing equality
    for (const rowIx in valueCollection) {
        if (Object.hasOwnProperty.call(valueCollection, rowIx)) {
            const rowVal = valueCollection[rowIx];
            if (rowVal != compareValue) {
                delete valueCollection[rowIx]
            }
        }
    }

    return valueCollection
}

function containsFilt() {
    // Filter for testing if key contains certain strings
    // TODO
    return
}

function eqOrContFilt() {
    // Filter for testing equality or if key contains certain strings
    // TODO
    return
}

function lstContFilt() {
    // Filter for if a list contains a certain string
    // TODO
    return
}

function dateRangeFilt() {
    // Filters dates to be within a certain range
    // TODO
    return
}