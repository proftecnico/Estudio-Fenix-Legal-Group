// state
let isChatOpen = false;
let chatStep = 0;
let userData = {
    name: "",
    contact: "",
    reason: "",
    datetime: ""
};

// Target email for FormSubmit (This can be modified by the user later)
const TARGET_EMAIL = "consultas@fenixlegal.com"; 

// DOM Elements
const chatWindow = document.getElementById("chat-window");
const chatLauncher = document.getElementById("chat-launcher");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send-btn");
const notifBadge = document.querySelector(".notification-badge");

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
    // Basic setup if needed later
    
    // Add event listeners
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !sendBtn.disabled) {
            handleUserInput();
        }
    });
    
    sendBtn.addEventListener("click", () => {
        if (!sendBtn.disabled) {
            handleUserInput();
        }
    });

    // Auto trigger first msg logic setup
    setupChatLogic();
});

// Toggle visibility
window.toggleChat = function() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove("hidden");
        chatLauncher.classList.add("active");
        chatLauncher.classList.remove("pulse-animation");
        notifBadge.style.display = "none";
        
        if (chatStep === 0) {
            startConversation();
        }
    } else {
        chatWindow.classList.add("hidden");
        chatLauncher.classList.remove("active");
    }
};

// Flow Control
function setupChatLogic() {
    // Initial setup, ready to start when opened
}

function startConversation() {
    appendBotMessage("¡Hola! Bienvenido a Fénix Legal Abogados. Soy tu asistente virtual.");
    setTimeout(() => {
        appendBotMessage("Para agendar una entrevista con uno de nuestros profesionales, primero necesito algunos datos. ¿Cuál es su nombre completo?");
        enableInput("text", "Escriba su nombre...");
        chatStep = 1;
    }, 1000);
}

function handleUserInput() {
    let val = chatInput.value.trim();
    
    // In case of special date-time pickers replacing the input
    const dateInput = document.getElementById('chat-date');
    const timeInput = document.getElementById('chat-time');
    
    if (chatStep === 4 && dateInput && timeInput) {
        if(!dateInput.value || !timeInput.value){
           appendBotMessage("Por favor, seleccione una fecha y hora válidas.");
           return;
        }
        val = dateInput.value + " a las " + timeInput.value;
    } else if (!val) {
        return;
    }
    
    // Clear input
    chatInput.value = "";
    disableInput();
    
    let processedVal = val;
    appendUserMessage(processedVal);

    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        processStep(processedVal);
    }, 1200);
}

function processStep(value) {
    switch (chatStep) {
        case 1:
            userData.name = value;
            appendBotMessage(`Gracias, ${userData.name.split(' ')[0]}. ¿Cuál es su correo electrónico y/o número de teléfono para contactarlo?`);
            enableInput("text", "Su email o teléfono...");
            chatStep = 2;
            break;
        case 2:
            userData.contact = value;
            appendBotMessage("Perfecto. Brevemente, ¿cuál es el motivo de su consulta? (Ej: Laboral, Familia, Contrato comercial)");
            enableInput("text", "Motivo de la consulta...");
            chatStep = 3;
            break;
        case 3:
            userData.reason = value;
            appendBotMessage("Entendido. Por favor, seleccione la fecha y hora de preferencia para su entrevista.");
            enableCustomInput();
            chatStep = 4;
            break;
        case 4:
            // Custom date process handled in handleUserInput
            userData.datetime = value;
            appendBotMessage("Procesando su solicitud de entrevista...");
            chatStep = 5;
            submitToFormSubmit();
            break;
    }
}

// UI Helpers
function appendBotMessage(text) {
    const div = document.createElement("div");
    div.className = "msg-bubble msg-bot";
    div.innerHTML = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function appendUserMessage(text) {
    const div = document.createElement("div");
    div.className = "msg-bubble msg-user";
    div.innerText = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function showTypingIndicator() {
    const div = document.createElement("div");
    div.className = "msg-bubble msg-bot typing-indicator-container";
    div.id = "typing-id";
    div.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById("typing-id");
    if (el) el.remove();
}

function enableInput(type, placeholder) {
    chatInput.type = type;
    chatInput.placeholder = placeholder;
    chatInput.disabled = false;
    sendBtn.disabled = false;
    
    // Remove custom UI if it existed
    const customContainer = document.getElementById('custom-input-container');
    if (customContainer) {
        customContainer.remove();
        chatInput.style.display = 'block';
    }
    
    chatInput.focus();
}

function enableCustomInput() {
    // Hide standard input
    chatInput.style.display = 'none';
    chatInput.disabled = true;
    
    // Create custom date time
    const inputArea = document.getElementById('input-container');
    
    // Remove old if exists
    const old = document.getElementById('custom-input-container');
    if(old) old.remove();

    // Limit previous dates
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset*60*1000));
    const minDate = localToday.toISOString().split('T')[0];

    const container = document.createElement("div");
    container.id = "custom-input-container";
    container.className = "datetime-container";
    container.innerHTML = `
        <input type="date" id="chat-date" min="${minDate}" required title="De lunes a viernes">
        <input type="time" id="chat-time" min="10:00" max="17:00" required title="De 10:00 a 17:00 hs">
    `;
    
    inputArea.insertBefore(container, sendBtn);
    sendBtn.disabled = false;

    // Validations to restrict selection automatically
    const dateInput = document.getElementById('chat-date');
    dateInput.addEventListener('change', function() {
        if (!this.value) return;
        const day = new Date(this.value).getUTCDay();
        if(day === 0 || day === 6){
            alert("Las entrevistas solo pueden agendarse de Lunes a Viernes.");
            this.value = '';
        }
    });

    const timeInput = document.getElementById('chat-time');
    timeInput.addEventListener('change', function() {
        if (!this.value) return;
        if(this.value < "10:00" || this.value > "17:00") {
            alert("El horario de atención es de 10:00 a 17:00 hs.");
            this.value = '';
        }
    });
}

function disableInput() {
    chatInput.disabled = true;
    sendBtn.disabled = true;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Email logic
async function submitToFormSubmit() {
    // We send to FormSubmit using POST
    // They will email TARGET_EMAIL
    
    const formData = new FormData();
    formData.append("Nombre", userData.name);
    formData.append("Contacto", userData.contact);
    formData.append("Motivo", userData.reason);
    formData.append("Fecha_y_Hora_Solicitada", userData.datetime);
    
    // Configure FormSubmit hidden fields logic
    formData.append("_subject", "Nueva Solicitud de Entrevista - Fenix Legal");
    formData.append("_template", "table");
    formData.append("_captcha", "false"); // Disable captcha for API call

    try {
        const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
            method: "POST",
            body: formData,
            headers: {
                // 'Content-Type': 'application/json' // Omit for FormData
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccessMessage();
        } else {
            console.error(response);
            showErrorMessage();
        }
    } catch (e) {
        console.error(e);
        showErrorMessage();
    }
}

function showSuccessMessage() {
    chatStep = 6;
    appendBotMessage(`<b>¡Entrevista agendada con éxito!</b><br>Hemos enviado los detalles a nuestra firma. Nos pondremos en contacto a la brevedad para confirmar la disponibilidad para el <i>${userData.datetime}</i>.<br><br>¡Gracias por confiar en Fénix Legal!`);
    
    // Change input placeholder
    if(chatInput) {
        chatInput.style.display = 'block';
        const custom = document.getElementById('custom-input-container');
        if(custom) custom.remove();
        
        chatInput.placeholder = "Conversación finalizada";
        disableInput();
    }
}

function showErrorMessage() {
    appendBotMessage("Hubo un error al procesar su solicitud. Por favor, intente enviando un correo directamente a info@fenixlegal.com. Disculpe las molestias.");
    
    if(chatInput) {
        chatInput.style.display = 'block';
        const custom = document.getElementById('custom-input-container');
        if(custom) custom.remove();
        chatInput.placeholder = "Error en el envío";
        disableInput();
    }
}
