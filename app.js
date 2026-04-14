let isChatOpen = false;
let chatStep = 0;
let userData = {
    name: "",
    contact: "",
    reason: "",
    datetime: ""
};

const TARGET_EMAIL = "info@legalfenix.com.ar";

const chatWindow = document.getElementById("chat-window");
const chatLauncher = document.getElementById("chat-launcher");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send-btn");
const notifBadge = document.querySelector(".notification-badge");

document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initNavScroll();
    initFileInput();
    
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
});

function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    
    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            nav.classList.toggle("active");
        });
        
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                nav.classList.remove("active");
            });
        });
    }
}

function initNavScroll() {
    const navLinks = document.querySelectorAll(".nav-link");
    
    window.addEventListener("scroll", () => {
        const scrollPos = window.scrollY + 150;
        
        document.querySelectorAll("section[id]").forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    });
}

function initFileInput() {
    const fileInput = document.getElementById("cv");
    const fileName = document.getElementById("file-name");
    
    if (fileInput && fileName) {
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                fileName.textContent = fileInput.files[0].name;
            } else {
                fileName.textContent = "Elegí un archivo o arrastralo aquí";
            }
        });
    }
}

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

function startConversation() {
    appendBotMessage("<strong>Bienvenido a FÉNIX LEGAL GROUP</strong><br><br>Somos un equipo jurídico comprometido con la excelencia y los resultados. ¿En qué podemos ayudarte hoy?");
    setTimeout(() => {
        appendBotMessage("¿Cuál es su apellido y nombre completo?");
        enableInput("text", "Su nombre completo...");
        chatStep = 1;
    }, 800);
}

function handleUserInput() {
    let val = chatInput.value.trim();
    
    const datetimeInput = document.getElementById("chat-datetime");
    
    if (chatStep === 4 && datetimeInput) {
        if (!datetimeInput.value) {
            appendBotMessage("Por favor, seleccione una fecha y hora válida.");
            return;
        }
        val = datetimeInput.value.replace(" ", " a las ");
    } else if (!val) {
        return;
    }
    
    chatInput.value = "";
    disableInput();
    
    appendUserMessage(val);
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        processStep(val);
    }, 1000);
}

function processStep(value) {
    switch (chatStep) {
        case 1:
            userData.name = value;
            appendBotMessage("Gracias, " + value.split(" ")[0] + ". Ahora indíquenos su número de teléfono y/o correo electrónico para contactarlo.");
            enableInput("text", "Teléfono o email...");
            chatStep = 2;
            break;
        case 2:
            userData.contact = value;
            appendBotMessage("Perfecto. ¿Cuál es el motivo de su consulta?<br><br><em>Por ejemplo: laboral, familia, penal, inmobiliario, accidentes, contratos, etc.</em>");
            enableInput("text", "Motivo de consulta...");
            chatStep = 3;
            break;
        case 3:
            userData.reason = value;
            appendBotMessage("Entendido. Para finalizar, seleccione la fecha y hora de preferencia para su entrevista virtual o presencial.");
            enableCustomInput();
            chatStep = 4;
            break;
        case 4:
            userData.datetime = value;
            appendBotMessage("Procesando su solicitud...");
            chatStep = 5;
            submitToFormSubmit();
            break;
    }
}

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
    div.textContent = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function showTypingIndicator() {
    const div = document.createElement("div");
    div.className = "msg-bubble msg-bot";
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
    
    const customContainer = document.getElementById("custom-input-container");
    if (customContainer) {
        customContainer.remove();
        chatInput.style.display = "block";
    }
    
    chatInput.focus();
}

function enableCustomInput() {
    chatInput.style.display = "none";
    chatInput.disabled = true;
    
    const inputArea = document.getElementById("input-container");
    
    const old = document.getElementById("custom-input-container");
    if (old) old.remove();
    
    const container = document.createElement("div");
    container.id = "custom-input-container";
    container.className = "datetime-container";
    container.innerHTML = `
        <input type="text" id="chat-datetime" placeholder="Seleccione fecha y hora..." required readonly>
    `;
    
    inputArea.insertBefore(container, sendBtn);
    sendBtn.disabled = false;
    
    flatpickr("#chat-datetime", {
        enableTime: true,
        dateFormat: "d/m/Y H:i",
        minDate: "today",
        minTime: "10:00",
        maxTime: "17:00",
        disable: [
            function(date) {
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ],
        locale: "es",
        minuteIncrement: 30
    });
}

function disableInput() {
    chatInput.disabled = true;
    sendBtn.disabled = true;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function submitToFormSubmit() {
    const formData = new FormData();
    formData.append("Nombre", userData.name);
    formData.append("Contacto", userData.contact);
    formData.append("Motivo", userData.reason);
    formData.append("Fecha_y_Hora_Solicitada", userData.datetime);
    
    formData.append("_subject", "Nueva Solicitud de Entrevista - FÉNIX LEGAL GROUP");
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    
    try {
        const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json"
            }
        });
        
        if (response.ok) {
            showSuccessMessage();
        } else {
            showErrorMessage();
        }
    } catch (e) {
        showErrorMessage();
    }
}

function showSuccessMessage() {
    chatStep = 6;
    appendBotMessage(`<strong>¡Entrevista agendada con éxito!</strong><br><br>Hemos recibido su solicitud. Nos comunicaremos a la brevedad para confirmar la disponibilidad para el <strong>${userData.datetime}</strong>.<br><br>Gracias por confiar en FÉNIX LEGAL GROUP.`);
    
    if (chatInput) {
        chatInput.style.display = "block";
        const custom = document.getElementById("custom-input-container");
        if (custom) custom.remove();
        
        chatInput.placeholder = "Conversación finalizada";
        disableInput();
    }
}

function showErrorMessage() {
    appendBotMessage("Hubo un error al procesar su solicitud. Por favor, contáctenos directamente a <strong>info@legalfenix.com.ar</strong>.<br>Disculpe las molestias.");
    
    if (chatInput) {
        chatInput.style.display = "block";
        const custom = document.getElementById("custom-input-container");
        if (custom) custom.remove();
        chatInput.placeholder = "Error en el envío";
        disableInput();
    }
}
