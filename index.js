import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const objAppSettings = {
    databaseURL: "https://realtime-database-b583d-default-rtdb.europe-west1.firebasedatabase.app/"
}

// Initialize firebase app
const fbApp = initializeApp(objAppSettings)
const db = getDatabase(fbApp)
const endorsements = ref(db, "endorsements")

// Grab elements
const btnPublishEl = document.getElementById("btn-publish")
const ulEndorsementsEl = document.getElementById("ul-endorsements-list")
const inptToEl = document.getElementById("inpt-to-el")
const inptFromEl = document.getElementById("inpt-from-el")
const inptEndorsementEl = document.getElementById("inpt-endorsement-el")

// onValue call, render list or call another function if db is empty
// Putting it here lets us see immediately core functionality when we open
// the .js file
onValue(endorsements, function(snapshot) {
    snapshot.exists() ? renderEndorsementList(snapshot.val()) : nothingHereYet()
})

// Putting event listeners here for the same reason as above—core functionalty
// near the top of the file makes it easier for other developers to review

// Add keypress event to revert warning when field no longer empty
const fieldEls = [inptToEl, inptFromEl, inptEndorsementEl]
for (const fieldEl of fieldEls) {
    fieldEl.addEventListener('keypress', function() {
        setFieldWarningClass(fieldEl, false)
    })
}

// Set up publish button event listener
btnPublishEl.addEventListener('click', function() {

    // Cleaner version from code review
    if (inptFromEl.value && inptEndorsementEl.value && inptToEl.value) {
        const newEndorsement = {
            to: inptToEl.value,
            from: inptFromEl.value,
            endorsement: inptEndorsementEl.value,
            hearts: 0
        }
        pushEndorsementToDb(newEndorsement)
        clearInputs()
    } else {
        const fieldEls = [inptToEl, inptFromEl, inptEndorsementEl]
        for (const fieldEl of fieldEls) {
            if (!fieldEl.value) {
                setFieldWarningClass(fieldEl, true)
            }
        }
    }
})

// Document event listener scoped to delete and like buttons
document.addEventListener('click', function(event) {
    const id = event.target.dataset.id
    if (id) {
        const op = event.target.dataset.type
        if (op === 'heart') {
            const endorsementData = JSON.parse(event.target.dataset.endorsement)
            toggleHeart(id, endorsementData)
        } else if (op === 'delete') {
            const endorsementToDelete = ref(db, `endorsements/${id}`)
            remove(endorsementToDelete)
        }
    }
})

// Function to render the list
function renderEndorsementList(val) {
    // First clear the current li's from the list...
    clearEndorsementList()

    // Now build each item from the array
    const allEndorsements = Object.entries(val).reverse()
    
    // Changed to modern style loop instead of C style
    for (const currentEndorsement of allEndorsements) {
        appendEndorsementToList(currentEndorsement)
    }
}

// Function to build and return a li from the endorsement object passed in
function buildEndorsementListItem(endorsement) {

    // Split out the id and object
    const id = endorsement[0]
    let endorsementData = endorsement[1]
    const endorsementTo = endorsementData.to
    const endorsementFrom = endorsementData.from
    const endorsementMsg = endorsementData.endorsement

    // encode as URI component to get rid of spaces that cause the json bug
    // when we stringify the endorsement object into the custom data
    for (const prop in endorsementData) {
        endorsementData[prop] = encodeURIComponent(endorsementData[prop])
    }

    // stringify the endorsement object
    const endorsementAsJSONString = (JSON.stringify(endorsementData))

    const html = `
        <li>
            <div>
                <h5>To ${endorsementTo}</h5>
                <p class='p-btn'>
                    <span data-id=${id} data-type=delete>&#x2715</span>
                </p>
            </div>
            <p>${decodeURIComponent(endorsementMsg)}</p>
            <div>
                <h5>From ${endorsementFrom}</h5>
                <p class='p-btn'>
                    <span
                        data-id=${id}
                        data-type=heart
                        data-endorsement=${endorsementAsJSONString}>
                            ${endorsementData.hearts > 0 ? "♥" : "♡"}
                    </span>
                    <span class='span-heart-count'>${endorsementData.hearts}</span>
                </p>
            </div>
        </li
    `

    return html
}

// Function to get the list item and append it
function appendEndorsementToList(endorsement) {
    // Grab the element
    const li = buildEndorsementListItem(endorsement)
    // Showtime
    ulEndorsementsEl.innerHTML += li
}

// Function for updating endorsement, at the moment just used when 
// we update heart count, but could use this to add an edit feature
function updateItemInDb(id, endorsementData) {
    // Get the ref and update the record
    const endorsementRef = ref(db, `endorsements/${id}`)

    // decode strings before we push back to the db, do we need to really?
    // guess we would only have to decode before using when we pull it back
    // if we didn't, so...swings and roundabouts
    for (const prop in endorsementData) {
        endorsementData[prop] = decodeURIComponent(endorsementData[prop])
    }

    set(endorsementRef, endorsementData)
}

// Function to add new endorsement to the database
function pushEndorsementToDb(newEndorsement) {
    push(endorsements, newEndorsement)
}

// Function to clear the endorsement list
function clearEndorsementList() {
    ulEndorsementsEl.innerHTML = ""
}

// Function to clear the inputs
function clearInputs() {
    const fieldEls = [inptToEl, inptFromEl, inptEndorsementEl]
    for (const fieldEl of fieldEls) {
       fieldEl.value = ''
    }
}

// Function to add/remove heart, update the db with heart count
// and drop an item in localStorage with the id of the endorsement
// we liked
function toggleHeart(id, endorsementData) {
    if (hasHearted(id)) {
        endorsementData.hearts--
        updateItemInDb(id, endorsementData)
        localStorage.removeItem(`${id}`)
    } else {
        endorsementData.hearts++
        updateItemInDb(id, endorsementData)
        localStorage.setItem(`${id}`, true)
    }
}

// Function to check if we already gave a heart
function hasHearted(id) {
    return id in localStorage
}

// Function to add or remove a 'warning' class from a specified input element
function setFieldWarningClass(fieldEl, shouldSet) {
    shouldSet ? fieldEl.classList.add('inpt-empty-field') : fieldEl.classList.remove('inpt-empty-field')
}

// Function: insert a specially formatted list item with text to display if there is
// nothing in the database
function nothingHereYet() {
    clearEndorsementList()
    let li = document.createElement('li')
    li.innerText = 'No endorsements to see...yet. Go on, you know you want to ;-)'
    li.classList.add("li-nothing-here-yet")
    ulEndorsementsEl.append(li)
}



