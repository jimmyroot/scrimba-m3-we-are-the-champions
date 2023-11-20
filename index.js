// TODO 1: Pretty much all of the CSS
// TODO 5: Sort out fonts, import Inter, etc

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
onValue(endorsements, function(snapshot) {
    snapshot.exists() ? renderEndorsementList(snapshot.val()) : nothingHereYet()
})

function nothingHereYet() {
    clearEndorsementList()
    let li = document.createElement('li')
    li.innerText = 'No endorsements to see...yet. Go on, you know you want to ;-)'
    li.classList.add("li-nothing-here-yet")
    ulEndorsementsEl.append(li)
}

// Function to render the list
function renderEndorsementList(val) {
    // First clear the current li's from the list...
    clearEndorsementList()

    // Now build each item from the array
    let allEndorsements = Object.entries(val).reverse()
    
    for (let i = 0; i < allEndorsements.length; i++) {
        let currentEndorsement = allEndorsements[i]
        appendEndorsementToList(currentEndorsement)
    }
}

function buildEndorsementListItem(endorsement) {
    // Get id and object
    let id = endorsement[0]
    let endorsementObj = endorsement[1]
    
    // Create all the elements that we'll use for each list item
    let li = document.createElement('li')
    let hTo = document.createElement("h5")
    let hFrom = document.createElement("h5")
    let p = document.createElement("p")
    let pHeart = document.createElement("p")
    let pDel = document.createElement("p")
    let divFrom = document.createElement("div")
    let divTo = document.createElement("div")
    let spanHeart = document.createElement("span")
    let spanHeartCount = document.createElement("span")
    let spanDel = document.createElement("span")

    // Initialize the elements with their values 
    hTo.textContent = `To ${endorsementObj.to}`
    hFrom.textContent = `From ${endorsementObj.from}`
    p.textContent = endorsementObj.endorsement
    spanHeartCount.textContent = endorsementObj.hearts
    spanHeart.textContent = endorsementObj.hearts > 0 ? "♥" : "♡"
    spanDel.textContent = "Ⅹ"
    spanHeartCount.classList.add("span-heart-count")

    // Add any defaults we need
    pHeart.classList.add("p-btn")
    pDel.classList.add("p-btn")

    // Set up event listeners on the delete and heart buttons
    spanDel.addEventListener("click", function() {
        let endorsementInDb = ref(db, `endorsements/${id}`)
        remove(endorsementInDb)
    })

    spanHeart.addEventListener("click", function() {
        toggleHeart(id, endorsementObj)
    })

    // Insert all the elements into the parent li
    pHeart.append(spanHeart)
    pHeart.append(spanHeartCount)

    pDel.append(spanDel)

    divTo.append(hTo)
    divTo.append(pDel)

    divFrom.append(hFrom)
    divFrom.append(pHeart)

    li.append(divTo)
    li.append(p)
    li.append(divFrom)

    // Send back the fully built list item
    return li
}

// Function to get the list item and append it
function appendEndorsementToList(endorsement) {
    // Grab the element
    const li = buildEndorsementListItem(endorsement)
    // Showtime
    ulEndorsementsEl.append(li)
}

// Function for updating endorsement, at the moment just used when we update heart
// count, but could use this to add an edit feature
function updateItemInDb(id, endorsementObj) {
    // Get the ref and update the record
    const endorsementRef = ref(db, `endorsements/${id}`)
    set(endorsementRef, endorsementObj)
}

// Function to add new endorsement to the database
function pushEndorsementToDb(newEndorsement) {
    push(endorsements, newEndorsement)
}

// Function to clear the endorsement list
function clearEndorsementList() {
    ulEndorsementsEl.innerHTML = ""
}

// Function to clear the inputs - found a differnet way to iterate over an array, 
// hope this is OK? Any reason not to use it? 
function clearInputs() {
    const fieldEls = [inptToEl, inptFromEl, inptEndorsementEl]
    for (const fieldEl of fieldEls) {
       fieldEl.value = ''
    }
}

// Function to add/remove heart
function toggleHeart(id, endorsementObj) {
    if (hasHearted(id)) {
        endorsementObj.hearts--
        updateItemInDb(id, endorsementObj)
        localStorage.removeItem(`${id}`)
    } else {
        endorsementObj.hearts++
        updateItemInDb(id, endorsementObj)
        localStorage.setItem(`${id}`, true)
    }
}

// Function to check if we already gave a heart
function hasHearted(id) {
    return id in localStorage
}

// Function to check if a given field element is empty, and decorate it accordingly
function fieldIsEmpty(fieldEl) {
    if (fieldEl.value.length === 0) {
        fieldEl.classList.add("inpt-empty-field")
        return true
    } else {
        return false;
    }
}

// Function to add or remove a 'warning' class from the
function setFieldWarningClass(fieldEl, shouldSet) {
    shouldSet ? fieldEl.classList.add('inpt-empty-field') : fieldEl.classList.remove('inpt-empty-field')
}

// Set up event listeners
btnPublishEl.addEventListener('click', function() {

    // Test all the fields to see if they are empty, must be a simpler way?
    let goodToGo = true
    const fieldEls = [inptToEl, inptFromEl, inptEndorsementEl]

    for (const fieldEl of fieldEls) {
        if (fieldIsEmpty(fieldEl)) {
            goodToGo = false
            setFieldWarningClass(fieldEl, true);
        }
    }

    // If all the fields are filled out, build new obj and push to db
    if (goodToGo) {
        const newEndorsement = {
            to: inptToEl.value,
            from: inptFromEl.value,
            endorsement: inptEndorsementEl.value,
            hearts: 0
        }
        pushEndorsementToDb(newEndorsement)
        clearInputs()
    }
})

// Add keypress event to revert warning when field no longer empty
const fieldEls = [inptToEl, inptFromEl, inptEndorsementEl]
for (const fieldEl of fieldEls) {
    fieldEl.addEventListener('keypress', function(event) {
        setFieldWarningClass(fieldEl, false)
    })
}