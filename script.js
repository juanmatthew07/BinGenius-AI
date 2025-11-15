const URL = "https://teachablemachine.withgoogle.com/models/zEMSohxR8/";
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const webcamContainer = document.getElementById("webcam-container");
const labelContainer = document.getElementById("label-container");

const infoContainer = document.getElementById("info-container");
const historyLog = document.getElementById("history-log");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const HISTORY_KEY = "wasteSortingHistory";

const funFacts = {
    Plastic: [
        "Daur ulang 1 botol plastik dapat menghemat energi untuk menyalakan TV selama 3 jam.",
        "Plastik membutuhkan waktu hingga 500 tahun untuk terurai di alam.",
        "Banyak plastik dapat didaur ulang menjadi serat poliester untuk membuat pakaian, karpet, atau bantal.",
        "Diperkirakan pada tahun 2050, jumlah plastik di lautan bisa lebih banyak daripada jumlah ikan.",
        "Tas kresek yang kita gunakan rata-rata hanya selama 12 menit, namun butuh ratusan tahun untuk hancur.",
    ],
    Textile: [
        "Sekitar 95% tekstil yang dibuang sebenarnya dapat didaur ulang atau digunakan kembali.",
        "Produksi satu kaos katun membutuhkan sekitar 2.700 liter air, cukup untuk minum satu orang selama 2.5 tahun.",
        "Tekstil bekas dapat diubah menjadi bahan insulasi untuk mobil atau isian untuk furnitur.",
        "Industri fashion adalah salah satu pencemar lingkungan terbesar di dunia.",
        "Menyumbangkan pakaian bekas layak pakai adalah cara termudah untuk mendaur ulang tekstil.",
    ],
    "Hazardous and Toxic": [
        "Baterai bekas yang dibuang sembarangan dapat mencemari tanah dan air dengan logam berat seperti merkuri dan kadmium.",
        "Satu bola lampu CFL yang pecah dapat melepaskan uap merkuri yang cukup untuk mencemari 6.000 galon air.",
        "Limbah elektronik (e-waste) adalah jenis sampah dengan pertumbuhan tercepat di dunia.",
        "Emas dan perak dapat diekstraksi dari papan sirkuit ponsel bekas, lho!",
        "Cat, pestisida, dan produk pembersih kimia tidak boleh dibuang ke saluran air karena sangat beracun bagi ekosistem.",
    ],
    Paper: [
        "Satu ton kertas daur ulang dapat menyelamatkan sekitar 17 pohon besar.",
        "Mendaur ulang kertas membutuhkan energi 65% lebih sedikit dan air 50% lebih sedikit daripada membuat kertas baru.",
        "Kertas dapat didaur ulang sekitar 5-7 kali sebelum seratnya menjadi terlalu pendek.",
        "Hampir 40% dari semua sampah di beberapa negara adalah kertas.",
        "Setiap lembar kertas yang didaur ulang membantu mengurangi emisi gas rumah kaca.",
    ],
    Organic: [
        "Sampah organik bisa diolah menjadi kompos, pupuk alami yang sangat baik untuk tanaman.",
        "Saat sampah organik menumpuk di TPA tanpa oksigen, ia menghasilkan gas metana, gas rumah kaca yang 25 kali lebih kuat dari CO2.",
        "Lebih dari 30% sampah rumah tangga adalah sampah organik yang dapat dikomposkan.",
        "Sampah organik juga dapat diubah menjadi biogas, sumber energi terbarukan untuk memasak atau listrik.",
        "Membuat kompos di rumah dapat mengurangi jumlah sampah yang Anda buang hingga sepertiganya.",
    ],
    Metal: [
        "Kaleng aluminium dapat didaur ulang tanpa batas tanpa kehilangan kualitasnya sama sekali.",
        "Mendaur ulang satu kaleng aluminium bisa menghemat energi yang cukup untuk mendengarkan musik selama 4 jam.",
        "Baja adalah material yang paling banyak didaur ulang di dunia.",
        "Dalam waktu 60 hari, kaleng yang Anda daur ulang bisa kembali ke rak toko sebagai kaleng baru.",
        "Mendaur ulang logam mengurangi kebutuhan akan penambangan baru yang merusak lingkungan.",
    ],
    Glass: [
        "Kaca membutuhkan waktu sekitar 1 juta tahun untuk terurai di alam, jadi daur ulang sangat penting!",
        "Sama seperti aluminium, kaca 100% dapat didaur ulang berulang kali tanpa kehilangan kemurnian atau kualitasnya.",
        "Mendaur ulang satu botol kaca dapat menghemat energi untuk menyalakan bola lampu 100 watt selama 4 jam.",
        "Wadah kaca untuk makanan dan minuman dapat didaur ulang sepenuhnya.",
        "Kaca daur ulang harus dipisahkan berdasarkan warna (bening, coklat, hijau) untuk menjaga kualitas produk baru.",
    ],
};

// State and Model Variables
let model, webcam, maxPredictions;
let isPredicting = false;
let isWebcamInitialized = false;
let countdownInterval;
let animationFrameId;
const synth = window.speechSynthesis;

// memuat model AI
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        webcam = new tmImage.Webcam(300, 300, true);
        labelContainer.innerHTML = 'Click "Start" to begin';
        startButton.disabled = false;
    } catch (error) {
        console.error("Initialization failed:", error);
        labelContainer.innerHTML =
            "Error loading model. Please refresh the page.";
    }
}

// History
function renderHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyLog.innerHTML = "";
    history.forEach((item) => {
        const li = document.createElement("li");
        const nameSpan = document.createElement("span");
        nameSpan.textContent = `${item.className} (${item.probability}%)`;
        const timeSpan = document.createElement("span");
        timeSpan.className = "timestamp";
        timeSpan.textContent = new Date(item.timestamp).toLocaleTimeString(
            "id-ID"
        );
        li.appendChild(nameSpan);
        li.appendChild(timeSpan);
        historyLog.prepend(li);
    });
}

function addToHistory(prediction) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const newEntry = {
        className: prediction.className,
        probability: (prediction.probability * 100).toFixed(0),
        timestamp: new Date().toISOString(),
    };
    history.push(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

// Start deteksi gambar
async function startDetection() {
    if (isPredicting || !webcam) return;
    if (!isWebcamInitialized) {
        try {
            labelContainer.innerHTML = "Please allow webcam access...";
            await webcam.setup();
            webcamContainer.innerHTML = "";
            webcamContainer.appendChild(webcam.canvas);
            isWebcamInitialized = true;
        } catch (e) {
            console.error("Webcam access denied or failed:", e);
            labelContainer.innerHTML =
                "Webcam access is required. Please refresh and allow access.";
            return;
        }
    }

    isPredicting = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    infoContainer.innerHTML = "";

    await webcam.play();
    animationFrameId = window.requestAnimationFrame(loop);
    startCountdown(3);
}

// Loop utk frame video dari webcam
async function loop() {
    if (!isPredicting) return;
    webcam.update();
    if (countdownInterval) {
        await model.predict(webcam.canvas);
    }
    animationFrameId = window.requestAnimationFrame(loop);
}

// Countdown prediksinya
function startCountdown(seconds) {
    let count = seconds;
    const updateCountdownText = async () => {
        const prediction = await model.predict(webcam.canvas);
        const topPrediction = prediction.sort(
            (a, b) => b.probability - a.probability
        )[0];
        const livePredictionText = `Detecting: ${topPrediction.className}`;

        labelContainer.innerHTML = `
    <div>Get ready... ${count}</div>
    <small style="font-size: 14px; margin-top: 5px;">${livePredictionText}</small>
    `;
    };

    updateCountdownText();
    countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            updateCountdownText();
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            runFinalPrediction();
        }
    }, 1000);
}

// Prediction final AInya
async function runFinalPrediction() {
    if (!isPredicting) return;
    labelContainer.innerHTML = "Processing...";
    const prediction = await model.predict(webcam.canvas);
    prediction.sort((a, b) => b.probability - a.probability);
    const topPrediction = prediction[0];
    const resultText = `${topPrediction.className} (${(
        topPrediction.probability * 100
    ).toFixed(0)}%)`;
    labelContainer.innerHTML = resultText;

    if (topPrediction.probability > 0.8) {
        speak(topPrediction.className);

        const factsArray = funFacts[topPrediction.className];
        if (factsArray && factsArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * factsArray.length);
            infoContainer.innerHTML = factsArray[randomIndex];
        } else {
            infoContainer.innerHTML = "Fakta tidak ditemukan untuk item ini.";
        }

        addToHistory(topPrediction);
    } else {
        labelContainer.innerHTML = "Not sure. Please try again.";
        infoContainer.innerHTML = "";
        setTimeout(() => stopDetection(true), 2000);
    }
}

// function text to speak
function speak(text) {
    if (synth.speaking) synth.cancel();
    const responses = {
        Plastic: ". Please throw it in the yellow trash can.",
        Textile: ". Please throw it in the grey trash can.",
        "Hazardous and Toxic": ". Please throw it in the red trash can.",
        Paper: ". Please throw it in the blue trash can.",
        Organic: ". Please throw it in the green trash can.",
        Metal: ". Please throw it in the purple trash can.",
        Glass: ". Please throw it in the orange trash can.",
    };
    const extraText = responses[text] || ". Unknown item type.";
    const utterance = new SpeechSynthesisUtterance(text + extraText);
    utterance.lang = "en-US";
    openMatchingTrash(text);
    utterance.onend = () => {
        closeAllTrash();
        setTimeout(() => stopDetection(true), 1000);
    };
    synth.speak(utterance);
}

function openMatchingTrash(type) {
    const container = document.querySelector(
        `.trash-container[data-type="${type}"]`
    );
    if (container) {
        const lid = container.querySelector(".lid");
        gsap.to(lid, { rotate: -65, duration: 0.5, ease: "power2.out" });
    }
}

function closeAllTrash() {
    document.querySelectorAll(".trash-container .lid").forEach((lid) => {
        gsap.to(lid, { rotate: 0, duration: 0.5, ease: "power2.in" });
    });
}

function stopDetection(isFinished = false) {
    isPredicting = false;
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;
    if (synth.speaking) synth.cancel();

    if (webcam && webcam.isPlaying) {
        webcam.stop();
    }

    if (isFinished) {
        labelContainer.innerHTML = "Detection complete! Ready for next item.";
    } else {
        labelContainer.innerHTML =
            'Detection stopped. Click "Start" to begin.';
        infoContainer.innerHTML = "";
    }
    startButton.disabled = false;
    stopButton.disabled = true;
    closeAllTrash();
}

document.addEventListener("DOMContentLoaded", () => {
    renderHistory();
    init();
});
clearHistoryButton.addEventListener("click", clearHistory);