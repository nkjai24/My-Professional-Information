/* ================================================
   J NANDHAKUMAR PORTFOLIO — script.js
================================================ */

/* ── Init Lucide Icons ── */
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});

/* ── Particles.js Config ── */
window.addEventListener('load', () => {
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 55, density: { enable: true, value_area: 900 } },
                color: { value: '#f0a500' },
                shape: { type: 'circle' },
                opacity: {
                    value: 0.18,
                    random: true,
                    anim: { enable: true, speed: 0.6, opacity_min: 0.05, sync: false }
                },
                size: {
                    value: 2.5,
                    random: true,
                    anim: { enable: false }
                },
                line_linked: {
                    enable: true,
                    distance: 140,
                    color: '#f0a500',
                    opacity: 0.07,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.7,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: false },
                    resize: true
                },
                modes: {
                    grab: { distance: 120, line_linked: { opacity: 0.2 } }
                }
            },
            retina_detect: true
        });
    }
});

/* ── Sticky Navbar ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveNav();
});

/* ── Hamburger Menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});
// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

/* ── Active Nav Highlighting ── */
function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navA = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navA.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
}

/* ── Typewriter Effect ── */
const roles = ['Full Stack Developer', 'Python Developer', 'React.js Enthusiast', 'UI/UX Minded Coder'];
let roleIdx = 0, charIdx = 0, isDeleting = false;
const typeEl = document.getElementById('typewriter');

function typeWriter() {
    if (!typeEl) return;
    const current = roles[roleIdx];
    if (isDeleting) {
        typeEl.textContent = current.slice(0, charIdx--);
        if (charIdx < 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            setTimeout(typeWriter, 400);
            return;
        }
        setTimeout(typeWriter, 55);
    } else {
        typeEl.textContent = current.slice(0, charIdx++);
        if (charIdx > current.length) {
            isDeleting = true;
            setTimeout(typeWriter, 1800);
            return;
        }
        setTimeout(typeWriter, 90);
    }
}
setTimeout(typeWriter, 1000);

/* ── Scroll Reveal (Intersection Observer) ── */
const revealEls = document.querySelectorAll(
    '.reveal, .reveal-up, .reveal-left, .reveal-right'
);
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Animated Counters ── */
function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (target === 0) { el.textContent = '0'; return; }
    const duration = 1400;
    const step = Math.ceil(target / (duration / 30));
    let current = 0;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
    }, 30);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    counterObserver.observe(el);
});

/* ── Contact Form Validation ── */
/* ── EmailJS Initialization ── */
(function () {
    emailjs.init("AEAFnzUHMikSC8_am");
})();

/* ── Contact Form Submission ── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        const nameErr = document.getElementById('nameError');
        const emailErr = document.getElementById('emailError');
        const msgErr = document.getElementById('messageError');
        const success = document.getElementById('formSuccess');
        const error = document.getElementById('formError');
        const btn = document.getElementById('submitBtn');

        // Clear previous states
        [name, email, message].forEach(f => f.classList.remove('error'));
        [nameErr, emailErr, msgErr].forEach(e => e.textContent = '');
        success.classList.remove('show');
        if (error) error.style.display = 'none';

        let valid = true;

        if (!name.value.trim()) {
            name.classList.add('error');
            nameErr.textContent = 'Name is required.';
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            email.classList.add('error');
            emailErr.textContent = 'Email is required.';
            valid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            email.classList.add('error');
            emailErr.textContent = 'Please enter a valid email address.';
            valid = false;
        }

        if (!message.value.trim()) {
            message.classList.add('error');
            msgErr.textContent = 'Message cannot be empty.';
            valid = false;
        }

        if (valid) {
            // Update button state
            const originalBtnContent = btn.innerHTML;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            // Send via EmailJS
            emailjs.send("service_knnzi7g", "template_229w8s7", {
                from_name: name.value,
                from_email: email.value,
                message: message.value
            })
                .then(() => {
                    contactForm.reset();
                    btn.innerHTML = originalBtnContent;
                    btn.disabled = false;
                    if (window.lucide) lucide.createIcons();
                    success.classList.add('show');
                    setTimeout(() => success.classList.remove('show'), 5000);
                })
                .catch((err) => {
                    console.error('EmailJS Error:', err);
                    btn.innerHTML = originalBtnContent;
                    btn.disabled = false;
                    if (window.lucide) lucide.createIcons();
                    if (error) error.style.display = 'flex';
                });
        }
    });

    // Live clear errors on input
    contactForm.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => {
            field.classList.remove('error');
            const errEl = document.getElementById(field.id + 'Error');
            if (errEl) errEl.textContent = '';
        });
    });
}

/* ── Smooth Scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});