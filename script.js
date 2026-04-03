// --- GESTION DU THÈME DYNAMIQUE ---
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Fonction pour appliquer le thème
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    
    if (theme === 'light') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
};

// Vérifier la préférence sauvegardée
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
});

// --- MENU MOBILE ---
const menuToggle = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animation simple du hamburger
    const bars = document.querySelectorAll('.bar');
    bars[0].classList.toggle('rotate-down'); // Optionnel: ajouter des classes CSS pour l'animation en X
});

// Fermer le menu au clic sur un lien
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// --- ANIMATION AU DÉFILEMENT (OBSERVER) ---
const observerOptions = { threshold: 0.15 };
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section-container').forEach(section => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "all 0.8s ease-out";
    revealObserver.observe(section);
});

// Style injecté par JS pour l'animation au scroll
const style = document.createElement('style');
style.innerHTML = `
    .visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// --- GESTION DU FORMULAIRE ---
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    alert(`Merci ${name}, votre message a bien été envoyé (Démonstration) !`);
    this.reset();
});