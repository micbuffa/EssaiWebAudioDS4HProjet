// bonne pratique : avoir une fonction appelé quand le DOM est prêt et quand les 
// ressources (lecteur audio, video etc.) sont prêtes
window.onload = init;
// audio context
let ctx;
// oscillateur
let osc, pan, filter, bufferSource;
let decodedBuffer;

function init() {
    console.log("Page affichée, DOM prêt, ressources prêtes");

    // audio contexte
    ctx = new AudioContext();

    defineListeners();
}

function defineListeners() {
    // on, récupère les boutons dans le DOM
    let btnStart = document.querySelector("#start");
    btnStart.onclick = () => {
        start();
        btnStart.disabled = true;
        btnStop.disabled = false;
    }

    let btnStop = document.querySelector("#stop");
    btnStop.onclick = () => {
        stop();
        btnStart.disabled = false;
        btnStop.disabled = true;
    }

    // frequence
    let inputFreq = document.querySelector("#freqSlider");
    inputFreq.oninput = () => {
        osc.frequency.value = inputFreq.value;

        // update span value
        let spanFreq = document.querySelector("#freqValue");
        spanFreq.innerHTML = `<b>${inputFreq.value}</b>Hz`;
    }

    // balance gauche/droite
    let inputPan = document.querySelector("#balanceSlider");
    inputPan.oninput = () => {
        pan.pan.value = inputPan.value;
    }

    // filtre passe bas
    let inputLP = document.querySelector("#freqLPFilterSlider");
    inputLP.oninput = () => {
        filter.frequency.value = inputLP.value;
        // update span value
        let spanFreq = document.querySelector("#freqValueLP");
        spanFreq.innerHTML = `<b>${inputLP.value}</b>Hz`;
    }

    // Selecteur de fichier
    let inputSelect = document.querySelector("#fileSelect");
     inputSelect.onchange =  () => {
        console.log(inputSelect.files[0].name);
        // lecture du fichier et dédage avec webaudio
        let reader = new FileReader();
        reader.onload = async () => {
            // on decode le fichier audio obtenu avec await
             decodedBuffer = await ctx.decodeAudioData(reader.result);
           console.log("Fichier audio décodé")
        }
        reader.readAsArrayBuffer(inputSelect.files[0]);
    }
}

function createWebAudioGraph() {
    // un oscillateur est un générateur de son
    osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 440; // en hertz (440 c'est un LA)

     // create buffer source
      bufferSource = ctx.createBufferSource();
     //source.buffer = decodedBuffer;

    // balance gauche/droite
    pan = ctx.createStereoPanner();

    // add lowpass filter
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    filter.gain.value = 25;

    osc.connect(pan);
    bufferSource.connect(pan);

    pan.connect(filter);
    filter.connect(ctx.destination); // on connecte l'oscillateur à la sortie (haut parleur)
}

function start() {
    // demarre le rendu du son
    createWebAudioGraph();

    if(decodedBuffer) {
        bufferSource.buffer = decodedBuffer;
        bufferSource.start();
    } else {
        osc.start();
    }
}

function stop() {
    // demarre le rendu du son
    if(decodedBuffer) {
        bufferSource.stop();
    } else {
        osc.stop();
    }
}