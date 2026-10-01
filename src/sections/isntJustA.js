function getPlaceholderCard(number, index) {
  return `
    <div class="gallery-item placeholder" style="width: 180px; height: 240px; --speed: ${0.3 + Math.random() * 1.3};" data-speed="${0.3 + Math.random() * 1.3}" data-index="${index}">
      <span class="placeholder-number" style="font-size: 32px;">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, manifest, index) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  const displayWidth = Math.min(200, w * 0.2);
  const displayHeight = displayWidth / aspectRatio;
  const speed = 0.3 + Math.random() * 1.3;
  return `
    <div class="gallery-item" style="width: ${displayWidth}px; height: ${displayHeight}px; --speed: ${speed};" data-speed="${speed}" data-filename="${filename}" data-index="${index}">
      <img src="/public/photos/${filename}" alt="" loading="lazy" decoding="async" width="${w}" height="${h}">
    </div>
  `;
}

export function initIsntJustA(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
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
    ? photoFiles.slice(0, 8).map((f, i) => getPhotoCard(f, manifest, i))
    : Array.from({ length: 8 }, (_, i) => getPlaceholderCard(String(i + 1).padStart(2, "0"), i));
  
  sidePhotosHTML = sidePhotos.join("");

  sectionEl.innerHTML = `
    <div class="container" style="height: 200vh; position: relative;">
      <div class="isnt-bg-layer" style="position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at 30% 20%, var(--cork-20) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, var(--pink-20) 0%, transparent 50%); opacity: 0; will-change: opacity;"></div>
      <div class="side-photos-left" style="position: absolute; left: -250px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding: var(--space-4xl) 0; pointer-events: none; z-index: 5; will-change: transform;">
        ${sidePhotosHTML}
      </div>
      <div class="side-photos-right" style="position: absolute; right: -250px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: var(--space-4xl) 0; pointer-events: none; z-index: 5; will-change: transform;">
        ${sidePhotosHTML}
      </div>
      <div class="hero-text" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none; z-index: 10;">
        <h1 class="section-title" id="isnt-text" style="font-size: var(--fs-h1); line-height: var(--lh-tight);">
          ${words.map((w, i) => `<span class="reveal-word" data-index="${i}" style="display: inline-block; opacity: 0.1; will-change: opacity, transform; transform: translateY(30px);">${w}</span>`).join(" ")}
        </h1>
        <p class="footnote" id="footnote" style="margin-top: var(--space-2xl); opacity: 0; transform: translateY(20px);">*and a lot of chai ☕</p>
      </div>
      <div class="isnt-transition" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50vh; z-index: 3; pointer-events: none; background: linear-gradient(to top, var(--cream), transparent); opacity: 0;"></div>
    </div>
  `;

  if (isReducedMotion()) {
    document.querySelectorAll(".reveal-word").forEach(w => { w.style.opacity = "1"; w.style.transform = "none"; });
    document.getElementById("footnote").style.opacity = "1";
    return;
  }

  const revealWords = document.querySelectorAll(".reveal-word");
  const footnote = document.getElementById("footnote");
  const leftPhotos = document.querySelectorAll(".side-photos-left .gallery-item");
  const rightPhotos = document.querySelectorAll(".side-photos-right .gallery-item");
  const isntBgLayer = sectionEl.querySelector(".isnt-bg-layer");
  const isntTransition = sectionEl.querySelector(".isnt-transition");

  gsap.set(revealWords, { opacity: 0.1, y: 30 });
  gsap.set(footnote, { opacity: 0, y: 20 });
  gsap.set(isntBgLayer, { opacity: 0 });
  gsap.set(isntTransition, { opacity: 0 });

  const textTimeline = gsap.timeline({
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
          const wordStart = i / revealWords.length * 0.7;
          const wordEnd = wordStart + 0.7 / revealWords.length;
          const wordProgress = gsap.utils.clamp(0, 1, (progress - wordStart) / (wordEnd - wordStart));
          
          const y = 30 * (1 - wordProgress);
          const opacity = 0.1 + 0.9 * wordProgress;
          gsap.set(word, { opacity, y });
          
          if (wordProgress > 0.5) {
            gsap.set(word, { x: Math.sin(progress * Math.PI * 4 + i) * 8 * (wordProgress - 0.5) * 2 });
          }
        });

        const strikeIndex = 3;
        const strikeProgress = gsap.utils.clamp(0, 1, (progress - 0.6) / 0.25);
        const strikeWord = revealWords[strikeIndex];
        if (strikeWord && strikeProgress > 0) {
          if (!strikeWord.classList.contains("strike")) {
            strikeWord.classList.add("strike");
            const replacement = document.createElement("span");
            replacement.className = "reveal-word replacement";
            replacement.textContent = "she's the result of unprecedented love* breakthroughs.";
            replacement.style.opacity = "0";
            replacement.style.transform = "translateY(20px)";
            replacement.style.marginLeft = "var(--space-md)";
            strikeWord.parentNode.insertBefore(replacement, strikeWord.nextSibling);
            gsap.to(replacement, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
          }
        }

        gsap.set(footnote, { 
          opacity: gsap.utils.clamp(0, 1, (progress - 0.8) / 0.2), 
          y: 20 * (1 - gsap.utils.clamp(0, 1, (progress - 0.8) / 0.2)) 
        });

        leftPhotos.forEach((photo, i) => {
          const speed = parseFloat(photo.dataset.speed) || 1;
          const y = -progress * window.innerHeight * 1.8 * speed;
          const rotation = (Math.sin(i * 1.2 + progress * Math.PI) * 10) * progress;
          const x = Math.sin(progress * Math.PI * 2 + i) * 30 * speed;
          gsap.set(photo, { y, rotation, x });
        });

        rightPhotos.forEach((photo, i) => {
          const speed = parseFloat(photo.dataset.speed) || 1;
          const y = progress * window.innerHeight * 1.8 * speed;
          const rotation = (Math.cos(i * 1.2 + progress * Math.PI) * 10) * progress;
          const x = Math.cos(progress * Math.PI * 2 + i) * 30 * speed;
          gsap.set(photo, { y, rotation, x });
        });

        gsap.set(isntBgLayer, { opacity: progress * 0.6 });
        gsap.set(isntTransition, { opacity: progress * 0.4 });
      }
    }
  });

  if (experience) {
    const allPhotos = [...leftPhotos, ...rightPhotos];
    experience.registerPhotoElement("isnt-photos-left", document.querySelector(".side-photos-left"), { photos: leftPhotos });
    experience.registerPhotoElement("isnt-photos-right", document.querySelector(".side-photos-right"), { photos: rightPhotos });
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

window.initIsntJustA = initIsntJustA;