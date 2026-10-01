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

export function initPivot(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
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
    <div class="container" style="height: 300vh; position: relative;">
      <div class="pivot-bg" style="position: fixed; inset: 0; background: var(--cream); z-index: 0; will-change: background-color; pointer-events: none;"></div>
      <div class="pivot-grain" style="position: fixed; inset: 0; opacity: 0; pointer-events: none; z-index: 1; background-image: url('data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E'); background-size: 256px; will-change: opacity;"></div>
      <div class="pivot-vignette" style="position: fixed; inset: 0; pointer-events: none; z-index: 2; background: radial-gradient(ellipse at center, transparent 40%, rgba(20,16,14,0) 60%, var(--night) 100%); opacity: 0; will-change: opacity;"></div>
      <div class="converging-photos" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 3; will-change: transform, opacity;">
        <div class="hero-stack" id="pivot-stack" style="max-width: 300px;">
          ${photosHTML}
        </div>
      </div>
      <div class="pivot-text" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none; z-index: 10; color: var(--ink);">
        <h2 class="section-title" id="pivot-title" style="font-size: var(--fs-h1); opacity: 0; transform: translateY(40px);">Okay, joke's over.</h2>
        <p class="pivot-subtitle" id="pivot-subtitle" style="font-family: var(--font-ui); font-size: var(--fs-body); color: var(--ink-60); max-width: 50ch; margin-top: var(--space-xl); opacity: 0; transform: translateY(30px);">From here on, it's just us. No more games. No more punchlines. Just this.</p>
      </div>
      <div class="pivot-light-sweep" style="position: fixed; inset: 0; pointer-events: none; z-index: 4; background: linear-gradient(135deg, transparent 30%, rgba(242,167,184,0.08) 50%, transparent 70%); opacity: 0; will-change: opacity, transform;"></div>
    </div>
  `;

  const pivotBg = sectionEl.querySelector(".pivot-bg");
  const pivotGrain = sectionEl.querySelector(".pivot-grain");
  const pivotVignette = sectionEl.querySelector(".pivot-vignette");
  const pivotLightSweep = sectionEl.querySelector(".pivot-light-sweep");
  const pivotTitle = document.getElementById("pivot-title");
  const pivotSubtitle = document.getElementById("pivot-subtitle");
  const pivotStack = document.getElementById("pivot-stack");
  const stackCards = pivotStack.querySelectorAll(".hero-stack-card");

  if (isReducedMotion()) {
    pivotBg.style.background = "var(--night)";
    pivotGrain.style.opacity = "0.15";
    pivotVignette.style.opacity = "1";
    pivotTitle.style.opacity = "1";
    pivotTitle.style.transform = "none";
    pivotTitle.style.color = "var(--cream)";
    pivotSubtitle.style.opacity = "1";
    pivotSubtitle.style.transform = "none";
    pivotSubtitle.style.color = "var(--cream-80)";
    stackCards.forEach(card => card.style.opacity = "0.15");
    return;
  }

  gsap.set(pivotTitle, { opacity: 0, y: 40 });
  gsap.set(pivotSubtitle, { opacity: 0, y: 30 });
  gsap.set(stackCards, { opacity: 0.15 });

  const cream = { r: 244, g: 238, b: 230 };
  const warmBeige = { r: 210, g: 185, b: 155 };
  const brown = { r: 140, g: 105, b: 75 };
  const deepDark = { r: 50, g: 35, b: 30 };
  const night = { r: 20, g: 16, b: 14 };

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
      
      let bgColor, grainOpacity, vignetteOpacity, lightSweepOpacity, lightSweepRotation;
      
      if (progress < 0.2) {
        const p = progress / 0.2;
        bgColor = interpolateColor(cream, warmBeige, p);
        grainOpacity = p * 0.05;
        vignetteOpacity = 0;
        lightSweepOpacity = 0;
        lightSweepRotation = 0;
      } else if (progress < 0.4) {
        const p = (progress - 0.2) / 0.2;
        bgColor = interpolateColor(warmBeige, brown, p);
        grainOpacity = 0.05 + p * 0.08;
        vignetteOpacity = p * 0.3;
        lightSweepOpacity = Math.sin(p * Math.PI) * 0.15;
        lightSweepRotation = p * 90;
      } else if (progress < 0.65) {
        const p = (progress - 0.4) / 0.25;
        bgColor = interpolateColor(brown, deepDark, p);
        grainOpacity = 0.13 + p * 0.12;
        vignetteOpacity = 0.3 + p * 0.4;
        lightSweepOpacity = 0;
        lightSweepRotation = 90 + p * 90;
      } else {
        const p = gsap.utils.clamp(0, 1, (progress - 0.65) / 0.35);
        bgColor = interpolateColor(deepDark, night, p);
        grainOpacity = 0.25 + p * 0.1;
        vignetteOpacity = 0.7 + p * 0.3;
        lightSweepOpacity = 0;
        lightSweepRotation = 180;
      }
      
      pivotBg.style.background = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
      pivotGrain.style.opacity = grainOpacity;
      pivotVignette.style.opacity = vignetteOpacity;
      pivotLightSweep.style.opacity = lightSweepOpacity;
      pivotLightSweep.style.transform = `rotate(${lightSweepRotation}deg)`;
      
      const titleProgress = gsap.utils.clamp(0, 1, (progress - 0.35) / 0.35);
      gsap.set(pivotTitle, { 
        opacity: titleProgress, 
        y: 40 * (1 - titleProgress),
        color: progress > 0.5 ? "var(--cream)" : "var(--ink)"
      });
      
      const subtitleProgress = gsap.utils.clamp(0, 1, (progress - 0.45) / 0.3);
      gsap.set(pivotSubtitle, { 
        opacity: subtitleProgress, 
        y: 30 * (1 - subtitleProgress),
        color: progress > 0.55 ? "var(--cream-80)" : "var(--ink-60)"
      });
      
      const stackProgress = gsap.utils.clamp(0, 1, (progress - 0.55) / 0.45);
      stackCards.forEach((card, i) => {
        const delay = i * 0.04;
        const cardProgress = gsap.utils.clamp(0, 1, (stackProgress - delay) / (1 - delay * stackCards.length));
        if (cardProgress > 0) {
          const targetScale = 0.5 + 0.5 * (1 - cardProgress);
          const targetOpacity = 0.15 + 0.25 * (1 - cardProgress);
          gsap.set(card, { 
            scale: targetScale, 
            opacity: targetOpacity,
            zIndex: Math.round(100 * (1 - cardProgress))
          });
        }
      });
    }
  });

  function interpolateColor(c1, c2, t) {
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * ease),
      g: Math.round(c1.g + (c2.g - c1.g) * ease),
      b: Math.round(c1.b + (c2.b - c1.b) * ease)
    };
  }
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