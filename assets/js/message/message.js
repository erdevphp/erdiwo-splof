import axios from 'axios';

class Messenger {
    constructor() {
        this.form = document.querySelector('.new-message');
        this.chatContainer = document.querySelector(".chat-container");
        this.chatBox = document.querySelector(".chat-box");
        this.chatHeader = document.querySelector(".chat-header");
        this.linkActive = document.querySelector('a.messageActive');
        this.loadingIndicator = document.getElementById("loading-indicator");
        this.errorMessage = document.getElementById("error-message");
        this.activeClass = "active";

        this.init();
    }

    init() {
        // Initialisation des écouteurs d'événements
        document.addEventListener("DOMContentLoaded", () => this.handlePageLoad());
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Gestion des clics sur les conversations
        document.querySelectorAll(".messages").forEach(item => {
            item.addEventListener("click", (e) => this.handleConversationClick(e, item));
        });
    }

    showLoading() {
        this.loadingIndicator.classList.remove('d-none');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('d-none');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('d-none');
        setTimeout(() => this.hideError(), 5000); // Masquer l'erreur après 5 secondes
    }

    hideError() {
        this.errorMessage.classList.add('d-none');
    }

    // Fonction pour charger les messages quand un lien a l'attribut active
    handlePageLoad() {
        if (this.linkActive) {
            const conversationId = this.linkActive.getAttribute("data-id");
            this.loadMessages(conversationId);
        }
    }

    // Gérer le click sur les listes de conversation pour mettre à jour les liens
    handleConversationClick(e, item) {
        e.preventDefault();
        this.setActiveConversation(item);
        const conversationId = item.getAttribute("data-id");
        
        this.loadMessages(conversationId);
    }

    // Gérer l'envoie du messages vers le serveur
    handleFormSubmit(e) {
        e.preventDefault();
        const content = document.querySelector('.content').value;
        const conversationId = this.form.getAttribute('data-id');

        this.sendMessage(conversationId, content)
            .then(response => {

                this.updateUIAfterSend(response.data, conversationId);
                document.querySelector('.content').value = ""; // Vider le champ de message
            })
            .catch(error => this.showError("Erreur d'envoi du message. Veuillez réessayer."));
    }

    // Chargement des messages
    async loadMessages(conversationId) {
        this.showLoading();
        try {
            const response = await axios.get(`/messages/${conversationId}`);
            const { messages, recipient } = response.data;
            this.updateChatUI(messages, recipient, conversationId);
            this.updateUrl(conversationId);
        } catch (error) {
            console.error("Erreur lors du chargement des messages:", error);
        } finally {
            this.hideLoading();
        }
    }

    // Simple fonction pour envoyer le message via Axios
    async sendMessage(conversationId, content) {
        return axios.post(this.form.action, { id: conversationId, content: content });
    }

    // Mettre à jour la liste des conversations
    updateUIAfterSend(msg, conversationId) {
        const conversationItem = document.querySelector(`a[href="/messages/${conversationId}"]`);
        const contentMessage = conversationItem.querySelector('.contentMessage');
        const createdAtMessage = conversationItem.querySelector('.createdAtMessage');

        const newCreatedMessage = document.createElement("time");
        newCreatedMessage.textContent = msg.createdAt;
        newCreatedMessage.setAttribute('datetime', msg.createdAt);
        newCreatedMessage.classList.add('timeago', 'small', 'createdAtMessage');

        createdAtMessage.replaceWith(newCreatedMessage);

        contentMessage.innerHTML = `<i class="fa fa-envelope"></i> ${msg.content}`;

        // Déplacer la conversation en haut de la liste
        const parentList = conversationItem.parentNode;
        parentList.prepend(conversationItem);

        // Ajouter le message à la boîte de chat
        this.chatBox.innerHTML += this.updatedMessageHTML(msg.content, msg.createdAt, true)

        $("time.timeago").timeago();

        this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll vers le bas
    }

    // Mise à jour du Chat
    updateChatUI(messages, recipient, conversationId) {
        this.chatHeader.innerHTML = "";
        this.chatBox.innerHTML = "";
        this.chatContainer.classList.remove('d-none');

        // Mettre à jour l'en-tête du chat
        this.chatHeader.innerHTML = `
            <h6 class="mb-0"><a href="/user/profile/${recipient.id}">${recipient.fullname}</a></h6>
        `;

        // Afficher les messages
        if (messages.length > 0) {
            messages.forEach(msg => {
                this.chatBox.innerHTML += this.updatedMessageHTML(msg.content, msg.createdAt, msg.mine);
            });
            $("time.timeago").timeago();
            this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll vers le bas
        } else {
            this.chatBox.innerHTML = `
                <div class="text-info text-center">
                    Bienvenue sur la messagerie...
                </div>
            `;
        }

        // Mettre à jour le formulaire
        this.form.action = `/messages/${conversationId}`;
        this.form.setAttribute('data-id', conversationId);
    }

    // Mettre à jour et Afficher le contenu du chat.
    updatedMessageHTML(content, createdAt, isMine) {
        const justifyContent = isMine ? "justify-content-end" : "justify-content-start";
        const color = isMine ? "text-light" : "text-secondary";
        const badge = isMine ? "bg-primary" : "bg-light";
        const position = isMine ? "text-right" : "text-left";
        return `
            <div class="d-flex ${justifyContent} mb-3 p-3 rounded">
                <div class="${badge} rounded ${color} p-2 ${position}" style="max-width: 75%; word-wrap: break-word;">
                    <div>${content}</div>
                    <div class="small">
                        <i class="fa fa-clock"></i> <time class="timeago" datetime="${createdAt}"> ${createdAt} </time>
                    </div>
                </div>
            </div>
        `;
    }

    // Mise à jour du lien
    updateUrl(activeId) {
        const newUrl = `/conversations/?active=${activeId}`;
        window.history.replaceState(null, "", newUrl);
    }

    // Mettre un élément courant en active
    setActiveConversation(element) {
        document.querySelectorAll(".messages").forEach(item => item.classList.remove(this.activeClass));
        element.classList.add(this.activeClass);
    }
}

// Initialisation de la messagerie
new Messenger();
