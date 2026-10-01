function getPlaceholderCard(number) {
  return `
    <div class="hero-stack-card placeholder" style="--rotation: ${(Math.random() - 0.5) * 12}deg; --tx: ${(Math.random() - 0.5) * 20}px; --ty: ${(Math.random() - 0.5) * 20}px;">
      <span class="placeholder-number">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, index, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  return `
    <div class="hero-stack-card" style="--rotation: ${(Math.random() - 0.5) * 12}deg; --tx: ${(Math.random() - 0.5) * 20}px; --ty: ${(Math.random() - 0.5) * 20}px; aspect-ratio: ${aspectRatio};" data-index="${index}">
      <img src="/public/photos/${filename}" alt="" loading="eager" decoding="sync" width="${w}" height="${h}">
    </div>
  `;
}

export function initHero(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  const name = content.name;
  const manifest = getManifest();
  const photoFiles = content.memories.map(m => m.photo).slice(0, 6);
  const hasRealPhotos = manifest.length > 0 && photoFiles.some(f => manifest.some(p => p.filename === f));

  let cardsHTML = "";
  if (hasRealPhotos) {
    photoFiles.forEach((filename, i) => {
      cardsHTML += getPhotoCard(filename, i, manifest);
    });
  } else {
    for (let i = 0; i < 6; i++) {
      cardsHTML += getPlaceholderCard(String(i + 1).padStart(2, "0"));
    }
  }

  sectionEl.innerHTML = `
    <div class="container" style="height: 200vh; position: relative;">
      <div class="hero-stack" id="hero-stack">
        ${cardsHTML}
      </div>
      <div class="hero-content" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none;">
        <span class="mono-label" style="margin-bottom: var(--space-lg);">NEW - Birthday Edition - ${content.birthdayLabel}</span>
        <h1 class="section-title" id="hero-title" style="font-size: var(--fs-hero); margin-bottom: var(--space-lg);">${name}.</h1>
        <p class="section-subtitle" id="hero-subtitle" style="font-size: var(--fs-h3); max-width: 50ch;">The world's most unnecessarily wonderful person.</p>
        <div class="scroll-hint" id="scroll-hint" style="margin-top: var(--space-3xl);">
          <span>Scroll to continue</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </div>
  `;

  const stack = document.getElementById("hero-stack");
  const cards = stack.querySelectorAll(".hero-stack-card");
  const title = document.getElementById("hero-title");
  const subtitle = document.getElementById("hero-subtitle");
  const scrollHint = document.getElementById("scroll-hint");

  if (isReducedMotion()) {
    cards.forEach((card, i) => {
      card.style.transform = "none";
      card.style.opacity = "1";
      card.style.zIndex = 6 - i;
    });
    return;
  }

  gsap.set(cards, { transformOrigin: "center center" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: self => {
        const progress = self.progress;
        cards.forEach((card, i) => {
          const delay = i * 0.15;
          const cardProgress = gsap.utils.clamp(0, 1, (progress - delay) / (1 - delay * cards.length));
          if (cardProgress > 0) {
            const tx = gsap.getProperty(card, "--tx") || 0;
            const ty = gsap.getProperty(card, "--ty") || 0;
            const rot = gsap.getProperty(card, "--rotation") || 0;
            const spreadX = (i - (cards.length - 1) / 2) * 180 * cardProgress;
            const spreadY = (Math.sin(i * 1.5) * 80) * cardProgress;
            const scale = 1 - 0.15 * cardProgress;
            const rotation = rot + (Math.random() - 0.5) * 10 * cardProgress;
            gsap.set(card, {
              x: tx + spreadX,
              y: ty + spreadY,
              scale: scale,
              rotation: rotation,
              zIndex: Math.round(100 * (1 - cardProgress))
            });
          }
        });
        const titleScale = 1 - 0.4 * progress;
        const titleY = -100 * progress;
        gsap.set(title, { scale: titleScale, y: titleY });
        gsap.set(subtitle, { opacity: 1 - progress * 1.5, y: -50 * progress });
        gsap.set(scrollHint, { opacity: 1 - progress * 2 });
      }
    }
  });

  ScrollTrigger.create({
    trigger: sectionEl,
    start: "top top",
    end: "bottom top",
    onLeave: () => {
      gsap.set(scrollHint, { opacity: 0, display: "none" });
    },
    onEnterBack: () => {
      gsap.set(scrollHint, { opacity: 1, display: "flex" });
    }
  });
}

function getManifest() {
  try {
    const manifest = JSON.parse(document.getElementById("photo-manifest")?.textContent || "[]");
    return manifest;
  } catch {
    return [];
  }
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initHero = initHero;