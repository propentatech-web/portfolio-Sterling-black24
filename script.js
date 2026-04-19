/**
 * ============================================================
 *  PORTFOLIO — NATHANAËL MICHEL LOWE KAMGANG
 *  script.js — v2.0 | Refactorisé & Amélioré
 * ============================================================
 *
 *  Modules :
 *  1.  ThemeManager        — Gestion dark/light mode
 *  2.  NavigationManager   — Menu mobile + active links
 *  3.  ScrollManager       — Barre de progression + header scroll
 *  4.  TypingEffect        — Animation de texte
 *  5.  IntersectionManager — Animations d'apparition (Observer)
 *  6.  StatCounter         — Compteurs animés dans le hero
 *  7.  ParallaxEffect      — Parallaxe souris sur l'image hero
 *  8.  ContactForm         — Validation + feedback formulaire
 *  9.  ChatWidget          — Assistant virtuel complet
 *  10. Init                — Point d'entrée unique
 * ============================================================
 */

'use strict';

/* ============================================================
   1. THEME MANAGER
   ============================================================ */
const ThemeManager = (() => {
    const STORAGE_KEY  = 'nm-theme';
    const DARK         = 'dark';
    const LIGHT        = 'light';

    let currentTheme   = DARK;
    let toggleBtn      = null;
    let themeIcon      = null;

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);

        if (themeIcon) {
            themeIcon.className = theme === DARK ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    function toggle() {
        apply(currentTheme === DARK ? LIGHT : DARK);
    }

    function init() {
        toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        themeIcon = toggleBtn.querySelector('i');

        // Lire la préférence stockée ou utiliser la préférence système
        const stored  = localStorage.getItem(STORAGE_KEY);
        const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? LIGHT : DARK;
        apply(stored || preferred);

        toggleBtn.addEventListener('click', toggle);
    }

    return { init };
})();


/* ============================================================
   2. NAVIGATION MANAGER
   ============================================================ */
const NavigationManager = (() => {
    let mobileMenuBtn = null;
    let navLinksEl    = null;
    let isOpen        = false;

    function openMenu() {
        isOpen = true;
        mobileMenuBtn.classList.add('active');
        navLinksEl.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        isOpen = false;
        mobileMenuBtn.classList.remove('active');
        navLinksEl.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const links    = document.querySelectorAll('.nav-link');
        let   current  = '';

        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${current}`
            );
        });
    }

    function init() {
        mobileMenuBtn = document.getElementById('mobile-menu');
        navLinksEl    = document.getElementById('nav-menu');
        if (!mobileMenuBtn || !navLinksEl) return;

        mobileMenuBtn.addEventListener('click', () => {
            isOpen ? closeMenu() : openMenu();
        });

        // Fermer le menu au clic sur un lien
        navLinksEl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Fermer avec Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && isOpen) closeMenu();
        });

        // Active link au scroll (throttlé dans ScrollManager)
        window.addEventListener('nm:scroll', updateActiveLink, { passive: true });
    }

    return { init };
})();


/* ============================================================
   3. SCROLL MANAGER — dispatch un event throttlé
   ============================================================ */
const ScrollManager = (() => {
    const scrollEvent = new Event('nm:scroll');
    let   ticking     = false;
    let   progressBar = null;
    let   header      = null;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateProgress();
                updateHeader();
                window.dispatchEvent(scrollEvent);
                ticking = false;
            });
            ticking = true;
        }
    }

    function updateProgress() {
        if (!progressBar) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const percent = scrollHeight === clientHeight
            ? 0
            : (scrollTop / (scrollHeight - clientHeight)) * 100;

        progressBar.style.width = percent.toFixed(1) + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(percent));
    }

    function updateHeader() {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 20);
    }

    function init() {
        progressBar = document.querySelector('.scroll-progress');
        header      = document.querySelector('header');
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    return { init };
})();


/* ============================================================
   4. TYPING EFFECT
   ============================================================ */
const TypingEffect = (() => {
    const WORDS = [
        'Développeur Full-Stack',
        'Créateur Digital',
        'Consultant Géosciences',
        'Passionné d\'Anime',
    ];

    let el         = null;
    let wordIdx    = 0;
    let charIdx    = 0;
    let deleting   = false;
    let timerId    = null;

    function getSpeed() {
        if (deleting) return 45;
        if (charIdx === WORDS[wordIdx].length) return 2200; // pause en fin de mot
        return 95;
    }

    function tick() {
        const word = WORDS[wordIdx];

        if (deleting) {
            el.textContent = word.slice(0, charIdx - 1);
            charIdx--;
        } else {
            el.textContent = word.slice(0, charIdx + 1);
            charIdx++;
        }

        // Transitions d'état
        if (!deleting && charIdx === word.length) {
            deleting = true;
        } else if (deleting && charIdx === 0) {
            deleting = false;
            wordIdx  = (wordIdx + 1) % WORDS.length;
        }

        timerId = setTimeout(tick, getSpeed());
    }

    function init() {
        el = document.getElementById('typing-text');
        if (!el) return;

        // Démarrage différé pour laisser le DOM peindre
        setTimeout(tick, 800);
    }

    function destroy() {
        clearTimeout(timerId);
    }

    return { init, destroy };
})();


/* ============================================================
   5. INTERSECTION MANAGER — Animations d'apparition
   ============================================================ */
const IntersectionManager = (() => {
    function init() {
        const options = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // On observe une seule fois par section pour les performances
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.section-container').forEach(el => {
            observer.observe(el);
        });
    }

    return { init };
})();


/* ============================================================
   6. STAT COUNTER — Compteurs animés
   ============================================================ */
const StatCounter = (() => {
    function animateCount(el, target, duration = 1200) {
        const start    = performance.now();
        const startVal = 0;

        function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing ease-out
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = Math.round(startVal + (target - startVal) * eased);
            el.textContent = current;

            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function init() {
        const statsSection = document.querySelector('.hero-stats');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                document.querySelectorAll('.stat-number').forEach(el => {
                    const target = parseInt(el.dataset.target, 10);
                    if (!isNaN(target)) animateCount(el, target);
                });
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    return { init };
})();


/* ============================================================
   7. PARALLAX EFFECT — Image hero au mouvement de souris
   ============================================================ */
const ParallaxEffect = (() => {
    let img    = null;
    let ticking = false;
    let mouseX  = 0;
    let mouseY  = 0;

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!ticking) {
            requestAnimationFrame(applyTransform);
            ticking = true;
        }
    }

    function applyTransform() {
        if (!img) { ticking = false; return; }

        const x = (window.innerWidth  / 2 - mouseX) / 28;
        const y = (window.innerHeight / 2 - mouseY) / 28;
        img.style.transform = `translate(${x}px, ${y}px)`;
        ticking = false;
    }

    function init() {
        img = document.querySelector('.hero-image img');
        if (!img || window.matchMedia('(max-width: 768px)').matches) return;

        // Réinitialiser la transform à 0 quand la souris quitte la fenêtre
        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseleave', () => {
            if (img) img.style.transform = 'translate(0, 0)';
        });
    }

    return { init };
})();


/* ============================================================
   8. CONTACT FORM — Validation & feedback
   ============================================================ */
const ContactForm = (() => {
    let form      = null;
    let submitBtn = null;
    let btnText   = null;

    function validateField(field) {
        const group = field.closest('.form-group');
        const errEl = group && group.querySelector('.field-error');
        let   msg   = '';

        if (!field.checkValidity()) {
            if (field.validity.valueMissing)  msg = 'Ce champ est requis.';
            else if (field.validity.typeMismatch && field.type === 'email') msg = 'Adresse email invalide.';
            else msg = field.validationMessage;
        }

        field.classList.toggle('invalid', !!msg);
        if (errEl) errEl.textContent = msg;
        return !msg;
    }

    function setLoading(loading) {
        if (loading) {
            submitBtn.classList.add('loading');
            btnText.textContent = 'Envoi en cours…';
            submitBtn.querySelector('i').className = 'fas fa-spinner fa-spin';
        } else {
            submitBtn.classList.remove('loading');
            btnText.textContent = 'Envoyer le message';
            submitBtn.querySelector('i').className = 'fas fa-paper-plane';
        }
    }

    function setSuccess() {
        submitBtn.classList.add('success');
        btnText.textContent = '✓ Message envoyé !';
        submitBtn.querySelector('i').className = '';
    }

    function resetBtn() {
        submitBtn.classList.remove('success', 'loading');
        btnText.textContent = 'Envoyer le message';
        submitBtn.querySelector('i').className = 'fas fa-paper-plane';
        submitBtn.style.opacity = '1';
    }

    function init() {
        form      = document.getElementById('contact-form');
        submitBtn = document.getElementById('submit-btn');
        if (!form || !submitBtn) return;

        btnText = submitBtn.querySelector('.btn-text');

        // Validation en temps réel à la sortie du champ
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('invalid')) validateField(field);
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Valider tous les champs
            const fields  = [...form.querySelectorAll('[required]')];
            const allOk   = fields.map(f => validateField(f)).every(Boolean);
            if (!allOk) return;

            setLoading(true);

            // Simulation d'envoi (remplacer par un fetch réel si nécessaire)
            await new Promise(resolve => setTimeout(resolve, 1800));

            setLoading(false);
            setSuccess();

            setTimeout(() => {
                resetBtn();
                form.reset();
                // Retirer les classes de validation
                form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
            }, 3500);
        });
    }

    return { init };
})();


/* ============================================================
   9. CHAT WIDGET
   ============================================================ */
const ChatWidget = (() => {
    /* ---- Base de connaissances du bot ---- */
    const INITIAL_MSG = `Salut 👋 Je suis l'assistant de **Nathanaël**. Comment puis-je vous aider ?`;

    const BOT_RESPONSES = [
        {
            keywords: ['service', 'proposez', 'faire', 'offre', 'travail'],
            replies: [
                'Je propose 4 types de services 💼 :\n\n• **Développement Web** (React, JS, e-commerce)\n• **Logiciels de gestion** (Java)\n• **Design graphique** (flyers, logos)\n• **Tutorat / Conseil**\n\nLequel vous intéresse ?'
            ]
        },
        {
            keywords: ['contact', 'joindre', 'appel', 'whatsapp', 'téléphone', 'email'],
            replies: [
                '📬 Plusieurs façons de me contacter :\n\n• **WhatsApp** : +237 658 644 721\n• **Email** : nathanaellowe4@gmail.com\n• **LinkedIn** : /in/nathanael-lowe\n\nOu remplissez le formulaire ci-dessus !'
            ]
        },
        {
            keywords: ['projet', 'portfolio', 'travaux', 'réalisation', 'exemple'],
            replies: [
                '🚀 Voici mes projets phares :\n\n• **OtakuTech** — E-commerce React\n• **Student Manager** — Logiciel Java POO\n• **Banking System** — Gestion bancaire Java\n• **Flyers & Branding** — Design Graphique\n\nScrollez jusqu\'à la section Projets pour les détails !'
            ]
        },
        {
            keywords: ['prix', 'tarif', 'coût', 'budget', 'combien'],
            replies: [
                '💰 Les tarifs varient selon la complexité de votre projet. Je préfère discuter directement pour vous faire une offre adaptée à votre budget.\n\nContactez-moi sur WhatsApp : **+237 658 644 721** 😊'
            ]
        },
        {
            keywords: ['délai', 'temps', 'durée', 'quand', 'rapide'],
            replies: [
                '⏱️ Les délais dépendent du projet :\n\n• **Flyer/Design** : 24–48h\n• **Site vitrine** : 1–2 semaines\n• **E-commerce** : 2–4 semaines\n• **Logiciel** : selon complexité\n\nContactez-moi pour un devis précis !'
            ]
        },
        {
            keywords: ['compétence', 'technologie', 'stack', 'langage', 'java', 'react'],
            replies: [
                '🛠️ Mon stack technique :\n\n• **Front-end** : React, JS, TypeScript, HTML/CSS\n• **Back-end** : Java (POO, design patterns)\n• **Design** : Photoshop, Premiere Pro\n• **Outils** : Git, VS Code\n\nJe suis toujours en train d\'apprendre !'
            ]
        },
        {
            keywords: ['localisation', 'situé', 'yaoundé', 'cameroun', 'où'],
            replies: [
                '📍 Je suis basé à **Yaoundé, Cameroun**. Je travaille en remote pour des clients partout dans le monde 🌍'
            ]
        },
        {
            keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey', 'hi'],
            replies: [
                'Bonjour ! 😊 Ravi de vous accueillir sur le portfolio de Nathanaël. Comment puis-je vous aider aujourd\'hui ?',
                'Salut ! 👋 Que puis-je faire pour vous ?',
            ]
        },
        {
            keywords: ['merci', 'thanks', 'parfait', 'super', 'cool', 'nickel'],
            replies: [
                'Avec plaisir ! 😄 N\'hésitez pas si vous avez d\'autres questions.',
                'De rien ! Je suis là si vous avez besoin d\'autre chose 🙂',
            ]
        },
        {
            keywords: ['géoscience', 'géophysique', 'hydro', 'sol', 'terrain'],
            replies: [
                '🌍 Nathanaël a également une expertise en **Géosciences** :\n\n• Géophysique appliquée\n• Hydrogéologie\n• Études et analyses de sol\n\nCette double compétence lui permet d\'aborder des projets multidisciplinaires !'
            ]
        },
    ];

    const FALLBACK_REPLIES = [
        "Je ne suis qu'un assistant simplifié 😅 Pour une réponse précise, contactez Nathanaël directement sur WhatsApp : **+237 658 644 721**",
        "Bonne question ! Je vous suggère de contacter Nathanaël directement pour en discuter 📬",
        "Je ne suis pas sûr de comprendre. Essayez de reformuler ou utilisez le formulaire de contact ci-dessus !",
    ];

    /* ---- État ---- */
    let isOpen       = false;
    let isTyping     = false;
    let msgCount     = 0;
    let fallbackIdx  = 0;

    /* ---- Éléments DOM ---- */
    let widget       = null;
    let toggleBtn    = null;
    let chatWindow   = null;
    let messagesEl   = null;
    let inputEl      = null;
    let formEl       = null;
    let closeBtn     = null;
    let suggestionsEl = null;
    let notifDot     = null;

    /* ---- Utilitaires ---- */

    function getTime() {
        return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Transforme le markdown basique (*bold*) en HTML
     */
    function parseMd(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function scrollToBottom() {
        messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }

    /* ---- Rendu des bulles ---- */

    function addMessage(text, sender = 'bot', withTyping = false) {
        if (withTyping) {
            // On affiche d'abord l'indicateur de typing
            const typingEl = document.createElement('div');
            typingEl.className = 'chat-bubble bot';
            typingEl.innerHTML = `
                <div class="typing-indicator" aria-label="En cours de saisie">
                    <span></span><span></span><span></span>
                </div>`;
            messagesEl.appendChild(typingEl);
            scrollToBottom();
            return typingEl; // retourné pour être remplacé
        }

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;

        // Calcul du délai pour l'animation d'entrée
        bubble.style.cssText = 'opacity:0; transform:translateY(8px); transition:opacity 0.3s ease, transform 0.3s ease;';
        bubble.innerHTML = `
            <div class="bubble-text">${parseMd(text)}</div>
            <div class="bubble-time">${getTime()}</div>`;

        messagesEl.appendChild(bubble);
        scrollToBottom();

        // Animation d'entrée
        requestAnimationFrame(() => {
            bubble.style.opacity  = '1';
            bubble.style.transform = 'translateY(0)';
        });

        msgCount++;
        return bubble;
    }

    function replaceTyping(typingEl, text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot';
        bubble.style.cssText = 'opacity:0; transform:translateY(8px); transition:opacity 0.3s ease, transform 0.3s ease;';
        bubble.innerHTML = `
            <div class="bubble-text">${parseMd(text)}</div>
            <div class="bubble-time">${getTime()}</div>`;

        typingEl.replaceWith(bubble);
        scrollToBottom();

        requestAnimationFrame(() => {
            bubble.style.opacity  = '1';
            bubble.style.transform = 'translateY(0)';
        });

        msgCount++;
    }

    /* ---- Logique de réponse ---- */

    function findResponse(input) {
        const lower = input.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

        for (const rule of BOT_RESPONSES) {
            if (rule.keywords.some(kw => lower.includes(kw))) {
                const pool = rule.replies;
                return pool[Math.floor(Math.random() * pool.length)];
            }
        }

        // Réponse de secours (rotation)
        const reply = FALLBACK_REPLIES[fallbackIdx % FALLBACK_REPLIES.length];
        fallbackIdx++;
        return reply;
    }

    async function botReply(userInput) {
        if (isTyping) return;
        isTyping = true;

        const delay     = 800 + Math.random() * 600; // délai réaliste
        const typingEl  = addMessage('', 'bot', true);

        await new Promise(r => setTimeout(r, delay));

        const reply = findResponse(userInput);
        replaceTyping(typingEl, reply);
        isTyping = false;
    }

    /* ---- Envoi d'un message utilisateur ---- */

    function sendUserMessage(text) {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        // Cacher les suggestions après le premier message
        if (suggestionsEl && msgCount > 1) {
            suggestionsEl.style.display = 'none';
        }

        addMessage(trimmed, 'user');
        inputEl.value = '';
        botReply(trimmed);
    }

    /* ---- Ouvrir / Fermer ---- */

    function openChat() {
        isOpen = true;
        chatWindow.classList.add('open');
        chatWindow.setAttribute('aria-hidden', 'false');
        toggleBtn.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');

        // Cacher la pastille
        if (notifDot) notifDot.classList.add('hidden');

        // Focus sur le champ de saisie
        setTimeout(() => inputEl && inputEl.focus(), 350);
    }

    function closeChat() {
        isOpen = false;
        chatWindow.classList.remove('open');
        chatWindow.setAttribute('aria-hidden', 'true');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
    }

    /* ---- Init ---- */

    function init() {
        widget       = document.getElementById('chat-widget');
        toggleBtn    = document.getElementById('chat-toggle');
        chatWindow   = document.getElementById('chat-window');
        messagesEl   = document.getElementById('chat-messages');
        inputEl      = document.getElementById('chat-input');
        formEl       = document.getElementById('chat-form');
        closeBtn     = document.getElementById('chat-close');
        suggestionsEl = document.getElementById('chat-suggestions');
        notifDot     = toggleBtn && toggleBtn.querySelector('.chat-notification-dot');

        if (!widget || !toggleBtn || !chatWindow) return;

        // Événements d'ouverture/fermeture
        toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
        if (closeBtn) closeBtn.addEventListener('click', closeChat);

        // Fermer avec Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && isOpen) closeChat();
        });

        // Envoi via le formulaire
        if (formEl) {
            formEl.addEventListener('submit', e => {
                e.preventDefault();
                sendUserMessage(inputEl.value);
            });
        }

        // Chips de suggestions
        if (suggestionsEl) {
            suggestionsEl.querySelectorAll('.suggestion-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    sendUserMessage(chip.dataset.message || chip.textContent);
                });
            });
        }

        // Message de bienvenue (après un délai discret)
        setTimeout(() => {
            addMessage(INITIAL_MSG, 'bot');
        }, 600);
    }

    return { init };
})();


/* ============================================================
   10. POINT D'ENTRÉE UNIQUE
   ============================================================ */
function initPortfolio() {
    ThemeManager.init();
    NavigationManager.init();
    ScrollManager.init();
    TypingEffect.init();
    IntersectionManager.init();
    StatCounter.init();
    ParallaxEffect.init();
    ContactForm.init();
    ChatWidget.init();
}

// Lancement dès que le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio(); // DOM déjà disponible (script en fin de body)
}
