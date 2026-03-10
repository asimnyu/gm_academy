/* =========================================
   GM ACADEMY - COMMANDER YUVAN (FINAL)
   ========================================= */

// 1. YOUR UNIQUE CLOUD DNA
const firebaseConfig = {
  apiKey: "AIzaSyBgWvOYPvHW1Ws4ewDCQJ0HGkWoC63zO8s",
  authDomain: "gm-academy-yuvan.firebaseapp.com",
  projectId: "gm-academy-yuvan",
  storageBucket: "gm-academy-yuvan.firebasestorage.app",
  messagingSenderId: "600149440659",
  appId: "1:600149440659:web:01a6b4ee6cf7eb631db566",
  measurementId: "G-RMWNZJ7VVW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. STATE & REASONING LIBRARY
let board = null, game = new Chess(), gmDatabase = {};
let moveCounter = 0, currentScore = 0, currentMusic = null;
let currentOpening = "White_Italian";

const tacticalLibrary = {
    "OUTPOST": { text: "Safe home for a Knight, immune to pawn attacks.", distractors: ["Temporary trade square.", "Defensive retreat."] },
    "F7_WEAKNESS": { text: "Weakest point, guarded only by the King.", distractors: ["Center outpost.", "Rook development path."] },
    "CENTER_LEVER": { text: "Pawn push to break open center for activity.", distractors: ["Defensive wall.", "Waiting move."] }
};

// 3. INITIALIZATION
async function initAcademy() {
    const res = await fetch('gm_master_database.json');
    gmDatabase = await res.json();
}

async function enterAcademy() {
    const name = document.getElementById('player-name').value;
    if (name.toLowerCase() !== "yuvan") return alert("ACCESS DENIED.");

    const doc = await db.collection("players").doc("yuvan").get();
    if (doc.exists) { currentScore = doc.data().score || 0; updateUI(); }

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-game').style.display = 'block';

    speak("WELCOME... COMMANDER... YUVAN.", 0.4);
    playTrack(1); 
    renderBoard();
}

// 4. CHESS CORE (NO IMAGE FOLDER NEEDED)
function renderBoard() {
    board = Chessboard('board', { 
        draggable: true, 
        position: 'start', 
        onDrop: handleMove, 
        // This pulls professional Wikipedia pieces from the cloud
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png' 
    });
}

async function handleMove(source, target) {
    let move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) return 'snapback';

    moveCounter++;
    let moveData = gmDatabase[currentOpening]?.next?.[move.san];

    if ((moveCounter === 4 || moveCounter === 7) && moveData?.biopsy) {
        triggerInquiry(move.to, moveData.biopsy.tag);
    } else if (moveData) {
        if (moveData.tag === "MASTER_REFUTATION") { currentScore += 10; flashBoard('hero-glow'); }
        else if (moveData.tag === "POPULAR_ERROR") { currentScore -= 5; flashBoard('cracked-tile'); }
    } else { activateLiveScout(); }
    
    updateUI(); saveToCloud();
}

// 5. TACTICAL HUD
function triggerInquiry(square, tag) {
    const entry = tacticalLibrary[tag] || tacticalLibrary["OUTPOST"];
    const box = document.getElementById('inquiry-box');
    let choices = [entry.text, ...entry.distractors].sort(() => Math.random() - 0.5);

    box.innerHTML = `
        <div class="hud-header">▼ SCANNING SECTOR: ${square.toUpperCase()}</div>
        <p style="color:white; margin-bottom:15px;">Identify the tactical value:</p>
        ${choices.map(c => `<button class="hud-btn" onclick="submitAnswer('${c}', '${entry.text}')">> ${c}</button>`).join('')}
    `;
    box.style.display = 'block';
    document.getElementById('board').style.filter = "brightness(0.2) blur(3px)";
}

async function submitAnswer(selected, correct) {
    if (selected === correct) { currentScore += 50; speak("Correct.", 1.1); }
    else { currentScore -= 10; speak("Negative.", 0.6); }
    
    document.getElementById('inquiry-box').style.display = 'none';
    document.getElementById('board').style.filter = "none";
    updateUI(); saveToCloud();
}

// 6. UTILS
async function activateLiveScout() {
    const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(game.fen())}`);
    const data = await res.json();
    if (data?.pvs) {
        const best = data.pvs[0].moves.split(' ')[0];
        document.getElementById('mission-text').innerText = `LIVE SCOUT: Target Move ${best}`;
    }
}

async function saveToCloud() {
    await db.collection("players").doc("yuvan").update({ score: currentScore, last_updated: new Date() });
}

function playTrack(id) {
    if (currentMusic) currentMusic.pause();
    currentMusic = new Audio(`assets/music/track${id}.mp3`);
    currentMusic.loop = true; currentMusic.volume = 0.15; currentMusic.play();
}

function speak(text, pitch) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.pitch = pitch; msg.rate = 0.8; window.speechSynthesis.speak(msg);
}

function updateUI() {
    document.getElementById('coins').innerText = currentScore;
    document.getElementById('rating').innerText = 950 + Math.floor(currentScore / 10);
}

function flashBoard(cls) { $('#board').addClass(cls); setTimeout(() => $('#board').removeClass(cls), 1000); }

initAcademy();