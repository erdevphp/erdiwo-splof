import axios from 'axios';

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".messages").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault(); // Empêcher la navigation normale

            let conversationId = this.getAttribute("data-id");
            let chatContainer = document.querySelector(".chat-container");
            let chatBox = document.querySelector(".chat-box"); // Zone de chat
            let chatHeader = document.querySelector(".chat-header"); // Zone de chat

            // Requête AJAX avec Axios
            axios.get(`/messages/${conversationId}`)
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

                    messages.forEach(msg => {
                        let isMe = msg.mine ? "align-items-end text-white bg-primary" : "align-items-start bg-light";
                        //let author = msg.mine ? "" : `<h2>${recipient.fullname}</h2>`;
                        chatBox.innerHTML += `
                            <div class="d-flex flex-column ${isMe} mb-3 p-3 rounded">
                                ${msg.content}
                                <time class="timeago text-info small" datetime="${msg.createdAt}"> ${msg.createdAt} </time>
                            </div>
                        `;
                    });
                    $("time.timeago").timeago();
                    chatBox.scrollTop = chatBox.scrollHeight; // Scroll vers le bas
                })
                .catch(error => console.error("Erreur lors du chargement des messages:", error));
        });
    });
});
