import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

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
const inptToEl = document.getElementById("ul-endorsements-list")
const inptFromEl = document.getElementById("ul-endorsements-list")
const inptEndorsementEl = document.getElementById("ul-endorsements-list")

// onValue call, render list or call another function if db is empty
onValue(endorsements, function(snapshot) {
    console.log(snapshot.exists());
    snapshot.exists() ? renderEndorsementList(snapshot.val()) : nothingToSeeHere()
})

function nothingToSeeHere() {
    let p = document.createElement("p")
    p.innerText = "Nothing to see here...yet"
    headerEndorsementsEl.after(p)
}

function renderEndorsementList(val) {
    // console.log(val)

}

function pushEndorsementToDb(endorsement) {
    console.log(endorsement)
}

btnPublishEl.addEventListener('click', function() {
    let endorsement = [

    ]
})