// Referencias
const screenWelcome = document.getElementById('screen-welcome');
const screenSad = document.getElementById('screen-sad');
const screenMenu = document.getElementById('screen-menu');
const screenPhotos = document.getElementById('screen-photos');
const screenFlowers = document.getElementById('screen-flowers');
const screenMusic = document.getElementById('screen-music');
const screenLetter = document.getElementById('screen-letter');

// Botones
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnRetry = document.getElementById('btn-retry');

// Cards Menú
const cardPhotos = document.getElementById('card-photos');
const cardFlowers = document.getElementById('card-flowers');
const cardMusic = document.getElementById('card-music');
const cardLetter = document.getElementById('card-letter');

// Modal
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const modalText = document.getElementById('modal-text');

// Controles álbum
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
const modalCounter = document.getElementById('modal-counter');
const modalImgContainer = document.getElementById('modal-img-container');

// Estado álbum
let currentAlbum = [];
let currentIndex = 0;
let isModalOpen = false;

// Autoplay
let slideshowTimer = null;
const SLIDESHOW_DELAY = 3200; // ms
const TRANSITION_MS = 260;    // coincide con CSS aprox.

// --- EVENTOS INICIO ---
btnYes.addEventListener('click', () => {
    screenWelcome.classList.add('hidden');
    screenMenu.classList.remove('hidden');
    confetti({
        particleCount: 150, spread: 70, origin: { y: 0.6 },
        colors: ['#c0392b', '#e74c3c', '#ffffff']
    });
});

btnNo.addEventListener('click', () => {
    screenWelcome.classList.add('hidden');
    screenSad.classList.remove('hidden');
});

btnRetry.addEventListener('click', () => {
    screenSad.classList.add('hidden');
    screenWelcome.classList.remove('hidden');
});

// --- MENÚ ---
cardPhotos.addEventListener('click', () => {
    screenMenu.classList.add('hidden');
    screenPhotos.classList.remove('hidden');
});
cardFlowers.addEventListener('click', () => {
    screenMenu.classList.add('hidden');
    screenFlowers.classList.remove('hidden');
});
cardMusic.addEventListener('click', () => {
    screenMenu.classList.add('hidden');
    screenMusic.classList.remove('hidden');
});
cardLetter.addEventListener('click', () => {
    screenMenu.classList.add('hidden');
    screenLetter.classList.remove('hidden');
});

// --- FUNCIÓN VOLVER ---
function goBack() {
    screenPhotos.classList.add('hidden');
    screenFlowers.classList.add('hidden');
    screenMusic.classList.add('hidden');
    screenLetter.classList.add('hidden');
    screenMenu.classList.remove('hidden');
}

// --- HELPERS ÁLBUM ---
function normalizeAlbum(imagesStr, fallbackSrc) {
    if (!imagesStr) return [fallbackSrc];

    const arr = imagesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const src of arr) {
        if (!seen.has(src)) {
            unique.push(src);
            seen.add(src);
        }
    }

    return unique.slice(0, 5);
}

/**
 * Transición sin “flash”:
 * - NO dejamos opacity=0 (CSS lo baja a 0.15)
 * - Cambiamos el src y esperamos a que cargue (onload) para quitar la clase
 */
function applyImageTransition(nextSrc) {
    if (!modalImg) return;

    // Si ya está en transición, la reiniciamos limpio
    modalImg.classList.remove('is-changing');

    // Activa efecto suave
    modalImg.classList.add('is-changing');

    // Quitar clase cuando termine de cargar la nueva imagen
    const handleLoad = () => {
        modalImg.classList.remove('is-changing');
        modalImg.removeEventListener('load', handleLoad);
    };
    modalImg.addEventListener('load', handleLoad);

    // Cambiamos src en medio de la transición
    window.setTimeout(() => {
        modalImg.src = nextSrc;

        // Fallback: si por alguna razón no dispara load (cache raro),
        // quitamos la clase igual después de un rato.
        window.setTimeout(() => {
            modalImg.classList.remove('is-changing');
        }, TRANSITION_MS + 220);
    }, Math.floor(TRANSITION_MS / 2));
}

function updateModalImage({ animate = false } = {}) {
    if (!currentAlbum.length) return;

    const nextSrc = currentAlbum[currentIndex];

    if (animate) {
        applyImageTransition(nextSrc);
    } else {
        modalImg.src = nextSrc;
        modalImg.classList.remove('is-changing');
    }

    if (modalCounter) {
        modalCounter.textContent = `${currentIndex + 1} / ${currentAlbum.length}`;
    }

    const hasAlbum = currentAlbum.length > 1;
    if (modalPrev) modalPrev.classList.toggle('hidden-control', !hasAlbum);
    if (modalNext) modalNext.classList.toggle('hidden-control', !hasAlbum);
    if (modalCounter) modalCounter.classList.toggle('hidden-control', !hasAlbum);
}

function prevImage({ animate = true } = {}) {
    if (currentAlbum.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    updateModalImage({ animate });
}

function nextImage({ animate = true } = {}) {
    if (currentAlbum.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentAlbum.length;
    updateModalImage({ animate });
}

// --- AUTOPLAY ---
function stopSlideshow() {
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
        slideshowTimer = null;
    }
}

function startSlideshow() {
    stopSlideshow();
    if (!isModalOpen) return;
    if (currentAlbum.length <= 1) return;

    slideshowTimer = setInterval(() => {
        nextImage({ animate: true });
    }, SLIDESHOW_DELAY);
}

function restartSlideshow() {
    startSlideshow();
}

// --- MODAL (ZOOM + ÁLBUM) ---
function openModal(element) {
    const img = element.querySelector('img');
    const text = element.getAttribute('data-text');

    currentAlbum = normalizeAlbum(element.getAttribute('data-images'), img.src);
    currentIndex = 0;

    modalText.innerText = text;

    updateModalImage({ animate: false });

    modal.classList.remove('hidden');
    isModalOpen = true;

    startSlideshow();
}

function closeModal() {
    modal.classList.add('hidden');
    isModalOpen = false;
    stopSlideshow();
}

// Botones de navegación
if (modalPrev) {
    modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage({ animate: true });
        restartSlideshow();
    });
}

if (modalNext) {
    modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage({ animate: true });
        restartSlideshow();
    });
}

// Teclado
document.addEventListener('keydown', (e) => {
    if (!isModalOpen) return;

    if (e.key === 'Escape') closeModal();

    if (e.key === 'ArrowLeft') {
        prevImage({ animate: true });
        restartSlideshow();
    }

    if (e.key === 'ArrowRight') {
        nextImage({ animate: true });
        restartSlideshow();
    }
});

// Swipe móvil
let touchStartX = 0;
let touchEndX = 0;

if (modalImgContainer) {
    modalImgContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modalImgContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) < 35) return;

        if (diff > 0) prevImage({ animate: true });
        else nextImage({ animate: true });

        restartSlideshow();
    }, { passive: true });
}
