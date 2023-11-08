window.onload = init;

const URL_SERVER = "http://localhost:3000";

function init() {
    // appelée quand la page est chargée, le DOM est prêt
    // on peut accéder aux éléments de la page

    soundDiv = document.getElementById("soundLoopsDiv");

    // On envoie une requête au serveur de loops
    fetch(URL_SERVER + "/api/audioloops")
        .then((responseJSON) => {
            // On récupère la réponse du serveur
            return responseJSON.json();
        }).then((data) => {
            // On récupère la réponse sous forme d'objet JavaScripr
            // on va parcourir la réponse pour afficher les loops
            const liste = document.createElement("ul");

            data.children.forEach(element => {
                generateStructure(element, liste);
            });

            soundDiv.appendChild(liste);
        }).catch((error) => {
            console.log(error);
        });

}

function generateStructure(element, liste) {
    switch (element.type) {
        case "file":
            console.log(element.name);
            const li = document.createElement("li");
            let player = createAudioPlayer(element);
            if (player) {
                li.innerHTML = player;
                liste.appendChild(li);
            }
            break;
        case "folder":
            // on ajoute à liste le nom du folder
            const liFolder = document.createElement("li");
            liFolder.innerHTML = `
              <span class='folder-span'>
                 <i class="folder-icon"></i>
              </span>&nbsp` + element.name;
            liste.appendChild(liFolder);

            // on demande à ajouter les enfants, dans une nouvelle liste subList
            const subList = document.createElement("ul");
            element.children.forEach(element => {
                generateStructure(element, subList);
            });
            liste.appendChild(subList);
            break;
    }
}

function createAudioPlayer(element) {
    // if element.name does not end with an audio suffix such as .wav .mp3 .ogg
    // return
    if (!element.name.match(/\.(wav|mp3|ogg)$/)) {
        return null;
    }
    
    return `
        <span> ${element.name} 
        <audio controls>
            <source src="${URL_SERVER}/${element.url}" type="audio/wav">
        </audio>
        </span>
    `;
}