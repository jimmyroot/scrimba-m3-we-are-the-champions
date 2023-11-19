// TODO 1: Pretty much all of the CSS
// TODO 2: We don't want any empty fields
// TODO 3: Move the delete button to the top right
// TODO 4: Clean up the empty list appearance
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
const headerEndorsementsEl = document.getElementById("h2-endorsements")
const ulEndorsementsEl = document.getElementById("ul-endorsements-list")
const inptToEl = document.getElementById("inpt-to-el")
const inptFromEl = document.getElementById("inpt-from-el")
const inptEndorsementEl = document.getElementById("inpt-endorsement-el")

// onValue call, render list or call another function if db is empty
onValue(endorsements, function(snapshot) {
    snapshot.exists() ? renderEndorsementList(snapshot.val()) : nothingToSeeHere()
})

function nothingToSeeHere() {
    clearEndorsementList()
    let p = document.createElement("p")
    p.innerText = "Nothing here yet. Why not give your endorsement?"
    headerEndorsementsEl.after(p)
}

function renderEndorsementList(val) {
    // First clear the current li's from the list...
    clearEndorsementList()

    // Now build each item from the array
    let allEndorsements = Object.entries(val)
    
    for (let i = 0; i < allEndorsements.length; i++) {
        let currentEndorsement = allEndorsements[i]
        appendEndorsementToList(currentEndorsement)
    }
}

function appendEndorsementToList(endorsement) {
    let id = endorsement[0]
    let endorsementObj = endorsement[1]
    
    let li = document.createElement("li")
    let hTo = document.createElement("h5")
    let hFrom = document.createElement("h5")
    let p = document.createElement("p")
    let pBtn = document.createElement("p")
    let div = document.createElement("div")
    let spanHeart = document.createElement("span")
    let spanHeartCount = document.createElement("span")
    let spanDel = document.createElement("span")

    hTo.textContent = `To ${endorsementObj.to}`
    hFrom.textContent = `From ${endorsementObj.from}`
    p.textContent = endorsementObj.endorsement
    spanHeartCount.textContent = endorsementObj.hearts
    spanHeart.textContent = endorsementObj.hearts > 0 ? "♥" : "♡"
    spanDel.textContent = "Ⅹ"
    spanHeart.classList.add("btn-heart")
    spanHeartCount.classList.add("span-heart-count")

    spanDel.classList.add("btn-del")
    pBtn.classList.add("p-btn")

    spanDel.addEventListener("click", function() {
        let endorsementInDb = ref(db, `endorsements/${id}`)
        remove(endorsementInDb)
    })

    spanHeart.addEventListener("click", function() {
        toggleHeart(id, endorsementObj)
    })

    pBtn.append(spanDel)
    pBtn.append(spanHeartCount)
    pBtn.append(spanHeart)

    div.append(hFrom)
    div.append(pBtn)

    li.append(hTo)
    li.append(p)
    li.append(div)

    ulEndorsementsEl.append(li)
}

function updateItemInDb(id, endorsementObj) {
    const endorsementRef = ref(db, `endorsements/${id}`)
    set(endorsementRef, endorsementObj)
}

function pushEndorsementToDb(newEndorsement) {
    push(endorsements, newEndorsement)
}

function clearEndorsementList() {
    ulEndorsementsEl.innerHTML = ""
}

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

function hasHearted(id) {
    // As above, check with local storage to see if we already liked this endorsement
    return id in localStorage
}

btnPublishEl.addEventListener('click', function() {
    // Build endorsement obj
    let newEndorsement = {
        to: inptToEl.value,
        from: inptFromEl.value,
        endorsement: inptEndorsementEl.value,
        hearts: 0 
    }
    // Send it to the db
    pushEndorsementToDb(newEndorsement)
})