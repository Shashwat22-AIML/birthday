function getPlaceholderCard(number, index) {
  const rotations = [-8, 4, -5, 6, -3, 5];
  const tx = [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30];
  const ty = [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30];
  return `
    <div class="hero-stack-card placeholder" data-index="${index}" style="--rotation: ${rotations[index]}deg; --tx: ${tx[index]}px; --ty: ${ty[index]}px;">
      <span class="placeholder-number">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, index, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  const rotations = [-8, 4, -5, 6, -3, 5];
  const tx = [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30];
  const ty = [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30];
  return `
    <div class="hero-stack-card" data-index="${index}" style="--rotation: ${rotations[index]}deg; --tx: ${tx[index]}px; --ty: ${ty[index]}px; aspect-ratio: ${aspectRatio};">
      <img src="/public/photos/${filename}" alt="" loading="eager" decoding="sync" width="${w}" height="${h}">
    </div>
  `;
}

export function initHero(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
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
      cardsHTML += getPlaceholderCard(String(i + 1).padStart(2, "0"), i);
    }
  }

  sectionEl.innerHTML = `
    <div class="hero-container" style="height: 250vh; position: relative;">
      <div class="hero-bg-layer" style="position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at center, var(--pink-20) 0%, transparent 70%); opacity: 0; will-change: opacity;"></div>
      <div class="hero-stack" id="hero-stack" style="position: relative; z-index: 10;">
        ${cardsHTML}
      </div>
      <div class="hero-content" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none; z-index: 20;">
        <span class="mono-label" style="margin-bottom: var(--space-lg); opacity: 0; transform: translateY(20px);" id="hero-label">NEW - Birthday Edition - ${content.birthdayLabel}</span>
        <h1 class="section-title" id="hero-title" style="font-size: var(--fs-hero); margin-bottom: var(--space-lg); opacity: 0; transform: translateY(40px);">${name}.</h1>
        <p class="section-subtitle" id="hero-subtitle" style="font-size: var(--fs-h3); max-width: 50ch; opacity: 0; transform: translateY(30px);">The world's most unnecessarily wonderful person.</p>
        <div class="scroll-hint" id="scroll-hint" style="margin-top: var(--space-3xl); opacity: 0; transform: translateY(20px);">
          <span>Scroll to begin</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      <div class="hero-transition-layer" style="position: absolute; bottom: 0; left: 0; right: 0; height: 100vh; z-index: 5; pointer-events: none; background: linear-gradient(to top, var(--cream), transparent); opacity: 0;"></div>
    </div>
  `;

  const stack = document.getElementById("hero-stack");
  const cards = stack.querySelectorAll(".hero-stack-card");
  const title = document.getElementById("hero-title");
  const subtitle = document.getElementById("hero-subtitle");
  const scrollHint = document.getElementById("scroll-hint");
  const heroLabel = document.getElementById("hero-label");
  const heroBgLayer = sectionEl.querySelector(".hero-bg-layer");
  const heroTransitionLayer = sectionEl.querySelector(".hero-transition-layer");

  if (isReducedMotion()) {
    gsap.set([title, subtitle, scrollHint, heroLabel], { opacity: 1, y: 0 });
    cards.forEach((card, i) => {
      card.style.transform = "none";
      card.style.opacity = "1";
      card.style.zIndex = 6 - i;
    });
    heroBgLayer.style.opacity = "1";
    return;
  }

  gsap.set(cards, { transformOrigin: "center center" });
  gsap.set([title, subtitle, scrollHint, heroLabel], { opacity: 0, y: 0 });

  const entranceTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: "top top",
      end: "+=100vh",
      scrub: 0.8,
      onEnter: () => {
        gsap.to([title, subtitle, scrollHint, heroLabel], { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          stagger: 0.15, 
          ease: "power3.out" 
        });
        gsap.to(heroBgLayer, { opacity: 1, duration: 1.5, ease: "power2.out" });
      },
      onLeaveBack: () => {
        gsap.set([title, subtitle, scrollHint, heroLabel], { opacity: 0 });
        gsap.set(heroBgLayer, { opacity: 0 });
      }
    }
  });

  const separationTimeline = gsap.timeline({
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
          const delay = i * 0.08;
          const cardProgress = gsap.utils.clamp(0, 1, (progress - delay) / (1 - delay * cards.length));
          
          if (cardProgress > 0) {
            const tx = parseFloat(card.style.getPropertyValue("--tx")) || 0;
            const ty = parseFloat(card.style.getPropertyValue("--ty")) || 0;
            const rot = parseFloat(card.style.getPropertyValue("--rotation")) || 0;
            
            const spreadX = (i - (cards.length - 1) / 2) * viewportWidth * 0.35 * cardProgress;
            const spreadY = (Math.sin(i * 1.8) * viewportHeight * 0.25) * cardProgress;
            const scale = 1 - 0.22 * cardProgress;
            const rotation = rot + (Math.sin(i * 2.3) * 15) * cardProgress;
            const opacity = 1 - 0.15 * cardProgress;
            
            gsap.set(card, {
              x: tx + spreadX,
              y: ty + spreadY,
              scale: scale,
              rotation: rotation,
              opacity: opacity,
              zIndex: Math.round(100 * (1 - cardProgress))
            });
          }
        });

        const titleScale = 1 - 0.5 * progress;
        const titleY = -viewportHeight * 0.4 * progress;
        gsap.set(title, { scale: titleScale, y: titleY });
        
        gsap.set(subtitle, { 
          opacity: 1 - progress * 1.8, 
          y: -viewportHeight * 0.2 * progress 
        });
        
        gsap.set(scrollHint, { opacity: 1 - progress * 2.5 });
        gsap.set(heroLabel, { opacity: 1 - progress * 2 });
        
        gsap.set(heroBgLayer, { opacity: 1 - progress });
        gsap.set(heroTransitionLayer, { opacity: progress * 0.3 });
      },
      onLeave: () => {
        gsap.set(scrollHint, { opacity: 0, display: "none" });
      },
      onEnterBack: () => {
        gsap.set(scrollHint, { opacity: 1, display: "flex" });
      }
    }
  });

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  ScrollTrigger.addEventListener("refresh", () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  });

  if (experience) {
    experience.registerPhotoElement("hero-stack", stack, { cards });
  }
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