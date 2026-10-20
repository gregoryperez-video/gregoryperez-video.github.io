document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // CUSTOM CURSOR
    // =============================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Anneau qui suit avec un léger retard (smooth)
        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        };
        animateRing();

        // Effet hover sur les éléments interactifs
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .service-detail-card, .process-step, .tool-item, .collab-card, .contact-method');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        // Cacher le curseur quand la souris sort de la fenêtre
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        });
    }

    // =============================================
    // HORLOGE LIVE (Dynamic Island)
    // =============================================
    const clockEl = document.getElementById('clock-time');
    if (clockEl) {
        const updateClock = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = h + ':' + m + ':' + s;
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // =============================================
    // NAVBAR SCROLL EFFECT
    // =============================================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // =============================================
    // NAVIGATION SPA (liens partageables via #ancre)
    // =============================================
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const pageIds = Array.from(pages).map(p => p.id);
    const defaultPage = 'accueil';

    const showPage = (targetId, { scroll = true } = {}) => {
        if (!pageIds.includes(targetId)) targetId = defaultPage;

        pages.forEach(p => p.classList.toggle('active', p.id === targetId));
        navLinks.forEach(l => {
            l.classList.toggle('active',
                l.getAttribute('href') === '#' + targetId && !!l.closest('.nav-island'));
        });

        // Mettre en pause les vidéos quand on quitte la page Réalisations
        if (targetId !== 'realisations') {
            document.querySelectorAll('.videos-grid video').forEach(v => v.pause());
        }

        if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });

        // Fermer le menu mobile
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    const pageFromHash = () => decodeURIComponent(location.hash.slice(1)) || defaultPage;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href[0] !== '#') return;
            e.preventDefault();
            const targetId = href.substring(1);
            if (targetId !== pageFromHash()) {
                history.pushState(null, '', targetId === defaultPage ? location.pathname : href);
            }
            showPage(targetId);
        });
    });

    // Boutons Précédent / Suivant du navigateur
    window.addEventListener('popstate', () => showPage(pageFromHash()));

    // Ouvrir directement la bonne page si on arrive via un lien partagé
    showPage(pageFromHash(), { scroll: false });

    // =============================================
    // HAMBURGER MOBILE
    // =============================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // =============================================
    // VIDÉOS RÉALISATIONS — une seule lecture à la fois
    // =============================================
    const portfolioVideos = document.querySelectorAll('.videos-grid video');
    portfolioVideos.forEach(video => {
        video.addEventListener('play', () => {
            portfolioVideos.forEach(other => {
                if (other !== video) other.pause();
            });
        });
    });

    // =============================================
    // MUSIQUE
    // =============================================
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    if (musicBtn && bgMusic) {
        bgMusic.volume = 0.3;
        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }).catch(() => { });
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
                musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
    }

    // =============================================
    // FORMULAIRE (avec Formspree)
    // =============================================
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const original = btn.innerHTML;

            // État de chargement
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            btn.disabled = true;

            const data = new FormData(form);

            try {
                const response = await fetch('https://formspree.io/f/xvkgblgw', {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Succès
                    btn.innerHTML = '<i class="fas fa-check"></i> Envoyé !';
                    btn.style.background = 'var(--purple)';
                    form.reset();
                } else {
                    // Erreur API
                    throw new Error('Erreur lors de l\'envoi');
                }
            } catch (error) {
                // Échec (ex: pas de connexion)
                btn.innerHTML = '<i class="fas fa-times"></i> Oups, réessayez ou écrivez-moi par mail';
                btn.style.background = '#EF4444'; // rouge
            }

            // Restauration du bouton après 3 secondes
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    }
});
