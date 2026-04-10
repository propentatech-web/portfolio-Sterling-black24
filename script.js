/* --- CONFIGURATION INITIALE & TYPING EFFECT --- */
document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('#typing-text');
    // On vérifie si l'élément existe pour éviter les erreurs
    if (typingElement) {
        const words = ["Développeur Full-Stack", "Créateur Digital", "Consultant Géosciences", "Passionné d'Anime"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; 
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }
            setTimeout(type, typeSpeed);
        }
        type();
    }
});

/* --- GESTION DU MENU MOBILE --- */
const mobileMenu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

/* --- GESTION DU MODE SOMBRE --- */
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

if (localStorage.getItem('theme') === 'light') {
    body.setAttribute('data-theme', 'light');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') !== 'light';
    if (isDark) {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
});

/* --- BARRE DE PROGRESSION & ACTIVE LINKS AU SCROLL --- */
window.addEventListener('scroll', () => {
    // 1. Barre de progression
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    let progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }
    progressBar.style.width = scrolled + "%";

    // 2. Gestion Active Link
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href').includes(current)) {
            a.classList.add('active');
        }
    });
});

/* --- ANIMATION D'APPARITION (INTERSECTION OBSERVER) --- */
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section-container').forEach(section => {
    observer.observe(section);
});

/* --- EFFET PARALLAXE MOUSEMOVE --- */
document.addEventListener('mousemove', (e) => {
    const img = document.querySelector('.hero-image img');
    if (img && window.innerWidth > 768) { // On désactive sur mobile pour la perf
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        img.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
});

/* --- ANIMATION FORMULAIRE --- */
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitBtn.style.opacity = '0.7';

        setTimeout(() => {
            submitBtn.innerHTML = ''; 
            submitBtn.classList.add('success');
            setTimeout(() => {
                submitBtn.classList.remove('success');
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
                contactForm.reset();
            }, 3000);
        }, 2000);
    });
}