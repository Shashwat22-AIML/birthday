function getPlaceholderCard(number) {
  return `
    <div class="gallery-item placeholder" style="width: 180px; height: 240px; --speed: ${0.3 + Math.random() * 1.3};" data-speed="${0.3 + Math.random() * 1.3}">
      <span class="placeholder-number" style="font-size: 32px;">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  const displayWidth = Math.min(200, w * 0.2);
  const displayHeight = displayWidth / aspectRatio;
  const speed = 0.3 + Math.random() * 1.3;
  return `
    <div class="gallery-item" style="width: ${displayWidth}px; height: ${displayHeight}px; --speed: ${speed};" data-speed="${speed}" data-filename="${filename}">
      <img src="/public/photos/${filename}" alt="" loading="lazy" decoding="async" width="${w}" height="${h}">
    </div>
  `;
}

export function initIsntJustA(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  const name = content.name;
  const manifest = getManifest();
  const photoFiles = content.memories.map(m => m.photo);
  const hasRealPhotos = manifest.length > 0 && photoFiles.some(f => manifest.some(p => p.filename === f));

  const words = [
    `${name}`,
    "isn't",
    "just",
    "a",
    "girlfriend."
  ];

  let sidePhotosHTML = "";
  const sidePhotos = hasRealPhotos 
    ? photoFiles.slice(0, 8).map(f => getPhotoCard(f, manifest))
    : Array.from({ length: 8 }, (_, i) => getPlaceholderCard(String(i + 1).padStart(2, "0")));
  
  sidePhotosHTML = sidePhotos.join("");

  sectionEl.innerHTML = `
    <div class="container" style="height: 150vh; position: relative;">
      <div class="side-photos-left" style="position: absolute; left: -200px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding: var(--space-4xl) 0; pointer-events: none; z-index: 5;">
        ${sidePhotosHTML}
      </div>
      <div class="side-photos-right" style="position: absolute; right: -200px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: var(--space-4xl) 0; pointer-events: none; z-index: 5;">
        ${sidePhotosHTML}
      </div>
      <div class="hero-text" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none; z-index: 10;">
        <h1 class="section-title" id="isnt-text" style="font-size: var(--fs-h1); line-height: var(--lh-tight);">
          ${words.map((w, i) => `<span class="reveal-word" data-index="${i}" style="display: inline-block; opacity: 0.15; will-change: opacity;">${w}</span>`).join(" ")}
        </h1>
        <p class="footnote" id="footnote" style="margin-top: var(--space-2xl); opacity: 0;">*and a lot of chai ☕</p>
      </div>
    </div>
  `;

  if (isReducedMotion()) {
    document.querySelectorAll(".reveal-word").forEach(w => w.style.opacity = "1");
    document.getElementById("footnote").style.opacity = "1";
    return;
  }

  const revealWords = document.querySelectorAll(".reveal-word");
  const footnote = document.getElementById("footnote");
  const leftPhotos = document.querySelectorAll(".side-photos-left .gallery-item");
  const rightPhotos = document.querySelectorAll(".side-photos-right .gallery-item");

  gsap.set(revealWords, { opacity: 0.15 });
  gsap.set(footnote, { opacity: 0 });

  gsap.timeline({
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
        
        revealWords.forEach((word, i) => {
          const wordStart = i / revealWords.length;
          const wordEnd = (i + 1) / revealWords.length;
          const wordProgress = gsap.utils.clamp(0, 1, (progress - wordStart) / (wordEnd - wordStart));
          gsap.set(word, { opacity: 0.15 + 0.85 * wordProgress });
        });

        const strikeIndex = 3;
        const strikeProgress = gsap.utils.clamp(0, 1, (progress - 0.7) / 0.2);
        const strikeWord = revealWords[strikeIndex];
        if (strikeWord && strikeProgress > 0) {
          if (!strikeWord.classList.contains("strike")) {
            strikeWord.classList.add("strike");
            const replacement = document.createElement("span");
            replacement.className = "reveal-word replacement";
            replacement.textContent = "she's the result of unprecedented love* breakthroughs.";
            replacement.style.opacity = "0";
            replacement.style.marginLeft = "var(--space-md)";
            strikeWord.parentNode.insertBefore(replacement, strikeWord.nextSibling);
            gsap.to(replacement, { opacity: 1, duration: 0.3, ease: "power2.out" });
          }
        }

        gsap.set(footnote, { opacity: gsap.utils.clamp(0, 1, (progress - 0.85) / 0.15) });

        leftPhotos.forEach((photo, i) => {
          const speed = parseFloat(photo.dataset.speed) || 1;
          const y = -progress * window.innerHeight * 1.5 * speed;
          const rotation = (Math.sin(i * 1.2) * 8) * progress;
          gsap.set(photo, { y, rotation });
        });

        rightPhotos.forEach((photo, i) => {
          const speed = parseFloat(photo.dataset.speed) || 1;
          const y = progress * window.innerHeight * 1.5 * speed;
          const rotation = (Math.cos(i * 1.2) * 8) * progress;
          gsap.set(photo, { y, rotation });
        });
      }
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

window.initIsntJustA = initIsntJustA;