function getPlaceholderCard(number) {
  return `
    <div class="hero-stack-card placeholder" style="opacity: 0.15;">
      <span class="placeholder-number" style="font-size: 32px;">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  return `
    <div class="hero-stack-card" style="opacity: 0.15; aspect-ratio: ${aspectRatio};">
      <img src="/public/photos/${filename}" alt="" loading="lazy" decoding="async" width="${w}" height="${h}">
    </div>
  `;
}

export function initPivot(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  const name = content.name;
  const manifest = getManifest();
  const photoFiles = content.memories.map(m => m.photo);
  const hasRealPhotos = manifest.length > 0 && photoFiles.some(f => manifest.some(p => p.filename === f));

  let photosHTML = "";
  const photosToShow = hasRealPhotos ? photoFiles.slice(0, 8) : Array.from({ length: 8 }, (_, i) => String(i + 1).padStart(2, "0"));
  
  photosToShow.forEach((item, i) => {
    if (hasRealPhotos) {
      photosHTML += getPhotoCard(item, manifest);
    } else {
      photosHTML += getPlaceholderCard(item);
    }
  });

  sectionEl.innerHTML = `
    <div class="container" style="height: 200vh; position: relative;">
      <div class="pivot-bg" style="position: fixed; inset: 0; background: var(--cream); z-index: 0; will-change: background-color; pointer-events: none;"></div>
      <div class="pivot-grain" style="position: fixed; inset: 0; opacity: 0; pointer-events: none; z-index: 1; background-image: url('data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E'); background-size: 256px; will-change: opacity;"></div>
      <div class="converging-photos" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 2; will-change: transform, opacity;">
        <div class="hero-stack" id="pivot-stack" style="max-width: 300px;">
          ${photosHTML}
        </div>
      </div>
      <div class="pivot-text" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none; z-index: 10; color: var(--ink);">
        <h2 class="section-title" id="pivot-title" style="font-size: var(--fs-h1); opacity: 0; transform: translateY(40px);">Okay, joke's over.</h2>
      </div>
    </div>
  `;

  const pivotBg = sectionEl.querySelector(".pivot-bg");
  const pivotGrain = sectionEl.querySelector(".pivot-grain");
  const pivotTitle = document.getElementById("pivot-title");
  const pivotStack = document.getElementById("pivot-stack");
  const stackCards = pivotStack.querySelectorAll(".hero-stack-card");

  if (isReducedMotion()) {
    pivotBg.style.background = "var(--night)";
    pivotGrain.style.opacity = "0.1";
    pivotTitle.style.opacity = "1";
    pivotTitle.style.transform = "none";
    stackCards.forEach(card => card.style.opacity = "0.15");
    return;
  }

  gsap.set(pivotTitle, { opacity: 0, y: 40 });
  gsap.set(stackCards, { opacity: 0.15 });

  ScrollTrigger.create({
    trigger: sectionEl,
    start: "top top",
    end: "bottom top",
    scrub: 1,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    onUpdate: self => {
      const progress = self.progress;
      
      const bgProgress = gsap.utils.clamp(0, 1, progress * 1.5);
      const cream = { r: 244, g: 238, b: 230 };
      const night = { r: 20, g: 16, b: 14 };
      const r = Math.round(cream.r + (night.r - cream.r) * bgProgress);
      const g = Math.round(cream.g + (night.g - cream.g) * bgProgress);
      const b = Math.round(cream.b + (night.b - cream.b) * bgProgress);
      pivotBg.style.background = `rgb(${r}, ${g}, ${b})`;
      
      pivotGrain.style.opacity = bgProgress * 0.1;
      
      const titleProgress = gsap.utils.clamp(0, 1, (progress - 0.3) / 0.4);
      gsap.set(pivotTitle, { 
        opacity: titleProgress, 
        y: 40 * (1 - titleProgress),
        color: titleProgress > 0.5 ? "var(--cream)" : "var(--ink)"
      });
      
      const stackProgress = gsap.utils.clamp(0, 1, (progress - 0.5) / 0.5);
      stackCards.forEach((card, i) => {
        const delay = i * 0.05;
        const cardProgress = gsap.utils.clamp(0, 1, (stackProgress - delay) / (1 - delay * stackCards.length));
        if (cardProgress > 0) {
          const targetScale = 0.6 + 0.4 * (1 - cardProgress);
          const targetOpacity = 0.15 + 0.35 * (1 - cardProgress);
          gsap.set(card, { 
            scale: targetScale, 
            opacity: targetOpacity,
            zIndex: Math.round(100 * (1 - cardProgress))
          });
        }
      });
    }
  });
}

function getManifest() {
  try {
    return JSON.parse(document.getElementById("photo-manifest")?.textContent || "[]");
  } catch {
    return [];
  }
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initPivot = initPivot;