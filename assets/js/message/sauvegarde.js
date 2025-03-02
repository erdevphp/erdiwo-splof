import axios from 'axios';

const form = document.querySelector('.new-message');
const active = "active";
let chatContainer = document.querySelector(".chat-container"); // Le conteneur de Messages
let chatBox = document.querySelector(".chat-box"); // Zone de chat
let chatHeader = document.querySelector(".chat-header"); // Entete

document.addEventListener("DOMContentLoaded", function () {

    const linkActive = document.querySelector('a.messageActive');

    if (linkActive) {
        let conversationId = linkActive.getAttribute("data-id"); // L'attribut data-id pour envoyer le formulaire

        getMessagesByAxios(conversationId);
    }

    document.querySelectorAll(".messages").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault(); // Empêcher la navigation normale

            $('.messages').removeClass(active);
            this.classList.add(active);

            let conversationId = this.getAttribute("data-id"); // L'attribut data-id pour envoyer le formulaire
            getMessagesByAxios(conversationId)
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault(); 
        let chatBox = document.querySelector(".chat-box"); // Zone de chat
        let content = document.querySelector('.content').value;
        
        axios
            .post(this.action, { id: this.getAttribute('data-id'), content: content })
            .then(response => {
                // Récupère les données du message envoyé
                let msg = response.data;

                // On récupère le lien du message en cours pour le mettre à jour
                let conversationItem = document.querySelector(`a[href="/messages/${this.getAttribute('data-id')}"]`);
                
                // On récupère le contenu et la date du dernier message
                let contentMessage = conversationItem.querySelector('.contentMessage');
                let createdAtMessage = conversationItem.querySelector('.createdAtMessage');

                // On crée un nouvel élement time pour afficher dans jquery timeago
                let newCreatedMessage = document.createElement("time");
                newCreatedMessage.textContent = msg.createdAt;
                newCreatedMessage.setAttribute('datetime', msg.createdAt);
                newCreatedMessage.classList.add('timeago', 'small', 'createdAtMessage');
                
                // On met à jour la date du dernier message
                createdAtMessage.replaceWith(newCreatedMessage);
                $("time.timeago").timeago();
                
                // On met à jour le contenu du dernier message
                contentMessage.innerHTML = `<i class="fa fa-envelope"></i> ${msg.content}`;

                // On met à jour la boite de réception
                let parentList = conversationItem.parentNode;
                parentList.prepend(conversationItem);

                // On met à jour le ChatBox qui contient tous les messages envoyés et réçus
                chatBox.innerHTML += `
                    <div class="d-flex justify-content-end mb-3 p-3 rounded">
                        <div class="bg-primary rounded text-light p-2 text-right" style="max-width: 75%; word-wrap: break-word;">
                            <div>${msg.content}</div>
                            <div class="small">
                                <i class="fa fa-clock"></i> <time class="timeago" datetime="${msg.createdAt}"> ${msg.createdAt} </time>
                            </div>
                        </div>
                    </div>
                `; 
                // On met à jour le temps
                $("time.timeago").timeago();

                // On scroll vers le bas c'est-à-dire vers le dernier message envoyé
                chatBox.scrollTop = chatBox.scrollHeight;

                // On vide le contenu du message
                document.querySelector('.content').value = ""
            })
            .catch(error => console.error("erreur d'envoie du message : ", error));
    });
});


function getMessagesByAxios(conversationId) {
    // Requête AJAX avec Axios
    axios
    .get(`/messages/${conversationId}`)
    .then(response => {
        let data = response.data;
        
        let messages = data.messages;
        let recipient = data.recipient;

        chatHeader.innerHTML = "";
        chatBox.innerHTML = "";
        
        chatContainer.classList.remove('d-none');

        // Mettre à jour l'en-tête du chat
        chatHeader.innerHTML = `
            <h6 class="mb-0"><a href="/user/profile/${recipient.id}">${recipient.fullname}</a></h6>
        `;

        updateUrl(conversationId);

        // On vérifie s'il y a des messages
        if (messages.length > 0) {
            messages.forEach(msg => {
                let justifyContent = msg.mine ? "end" : "start";
                let color = msg.mine ? "light" : "secondary";
                let bagde = msg.mine ? "primary" : "light";
                let position = msg.mine ? "right" : "left";

                //let author = msg.mine ? "" : `<h2>${recipient.fullname}</h2>`;
                chatBox.innerHTML += `
                    <div class="d-flex justify-content-${justifyContent} mb-3 p-3 rounded">
                        <div class="bg-${bagde} rounded text-${color} p-2 text-${position}" style="max-width: 75%; word-wrap: break-word;">
                            <div>${msg.content}</div>
                            <div class="small">
                                <i class="fa fa-clock"></i> <time class="timeago" datetime="${msg.createdAt}"> ${msg.createdAt} </time>
                            </div>
                        </div>
                    </div>
                `;                     
            });
            $("time.timeago").timeago();
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll vers le bas
        } else { // Sinon on affiche bienvenue sur la messagerie
            chatBox.innerHTML += `
                <div class="text-info text-center">
                    Bienvenue sur la messagerie...
                </div>
            `;
        }
        // Mise à jour de l'attribut action du formulaire d'envoie
        form.action = `/messages/${conversationId}`;  
        form.setAttribute('data-id', conversationId);                     
    })
    .catch(error => console.error("Erreur lors du chargement des messages:", error));
}

function updateUrl(activeId) {
    let newUrl = `/conversations/?active=${activeId}`;
    window.history.replaceState(null, "", newUrl);
}