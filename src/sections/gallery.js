function getPlaceholderCard(number, index) {
  const rotations = [-6, 3, -4, 5, -2, 4, -5, 2, -3, 6, -4, 3, -5, 2, -1];
  const scales = [0.9, 1.05, 0.95, 1.02, 0.92, 1.03, 0.98, 1.01, 0.93, 1.04, 0.96, 1.02, 0.94, 1.01, 0.97];
  const speeds = [0.5, 1.2, 0.8, 1.5, 0.6, 1.3, 0.7, 1.4, 0.4, 1.6, 0.9, 1.1, 0.55, 1.25, 0.75];
  const rot = rotations[index % rotations.length];
  const scale = scales[index % scales.length];
  const speed = speeds[index % speeds.length];
  return `
    <div class="gallery-item placeholder" style="width: 200px; height: 266px; --rotation: ${rot}deg; --scale: ${scale}; --speed: ${speed};" data-speed="${speed}" data-rotation="${rot}" data-scale="${scale}" data-index="${index}">
      <span class="placeholder-number" style="font-size: 40px;">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, index, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  const displayWidth = Math.min(220, w * 0.22);
  const displayHeight = displayWidth / aspectRatio;
  const rotations = [-6, 3, -4, 5, -2, 4, -5, 2, -3, 6, -4, 3, -5, 2, -1];
  const scales = [0.9, 1.05, 0.95, 1.02, 0.92, 1.03, 0.98, 1.01, 0.93, 1.04, 0.96, 1.02, 0.94, 1.01, 0.97];
  const speeds = [0.5, 1.2, 0.8, 1.5, 0.6, 1.3, 0.7, 1.4, 0.4, 1.6, 0.9, 1.1, 0.55, 1.25, 0.75];
  const rot = rotations[index % rotations.length];
  const scale = scales[index % scales.length];
  const speed = speeds[index % speeds.length];
  return `
    <div class="gallery-item" style="width: ${displayWidth}px; height: ${displayHeight}px; --rotation: ${rot}deg; --scale: ${scale}; --speed: ${speed};" data-speed="${speed}" data-rotation="${rot}" data-scale="${scale}" data-filename="${filename}" data-index="${index}">
      <img src="/public/photos/${filename}" alt="" loading="lazy" decoding="async" width="${w}" height="${h}">
    </div>
  `;
}

export function initGallery(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
  const manifest = getManifest();
  const photoFiles = content.memories.map(m => m.photo);
  const captions = content.galleryCaptions || [];
  const hasRealPhotos = manifest.length > 0 && photoFiles.some(f => manifest.some(p => p.filename === f));
  const totalPhotos = hasRealPhotos ? photoFiles.length : 15;
  const itemsToShow = Math.min(totalPhotos, 15);

  let galleryHTML = "";
  for (let i = 0; i < itemsToShow; i++) {
    if (hasRealPhotos && i < photoFiles.length) {
      galleryHTML += getPhotoCard(photoFiles[i], i, manifest);
    } else {
      galleryHTML += getPlaceholderCard(String(i + 1).padStart(2, "0"), i);
    }
  }

  sectionEl.innerHTML = `
    <div class="gallery-container" style="height: 500vh; position: relative;">
      <div class="gallery-bg" style="position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at center, var(--pink-20) 0%, transparent 70%); opacity: 0; will-change: opacity;"></div>
      <div class="gallery-header" style="position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-2xl) var(--space-lg); pointer-events: none; z-index: 20;">
        <span class="mono-label" style="margin-bottom: var(--space-md); opacity: 0; transform: translateY(20px);" id="gallery-label">Core Experience</span>
        <h2 class="section-title" id="gallery-title" style="font-size: var(--fs-h1); margin-bottom: var(--space-xl); opacity: 0; transform: translateY(30px);">Rise above mediocrity.</h2>
      </div>
      <div class="gallery-grid" id="gallery-grid" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 5; will-change: transform;">
        ${galleryHTML}
      </div>
      <div class="hero-photo-section" style="position: sticky; top: 50%; transform: translateY(-50%); height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; z-index: 15;">
        <div class="hero-photo-container" id="hero-photo-container" style="position: relative; width: 100%; max-width: 600px; aspect-ratio: 3/4; border-radius: var(--radius-lg); border: 2px solid var(--white); box-shadow: var(--shadow-elevated); overflow: hidden; background: var(--cream); will-change: transform, opacity;">
          ${Array.from({ length: Math.min(itemsToShow, captions.length) }, (_, i) => `
            <img class="hero-photo ${i === 0 ? "is-active" : ""}" src="${hasRealPhotos && i < photoFiles.length ? `/public/photos/${photoFiles[i]}` : ""}" alt="${captions[i] || `Photo ${i + 1}`}" loading="${i === 0 ? "eager" : "lazy"}" decoding="${i === 0 ? "sync" : "async"}" style="${!hasRealPhotos || i >= photoFiles.length ? "display: none;" : ""} width="100%" height="100%" style="object-fit: cover; position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease;">
            <div class="hero-caption" style="position: absolute; bottom: 0; left: 0; right: 0; padding: var(--space-lg); background: linear-gradient(transparent, rgba(27, 22, 18, 0.8)); font-family: var(--font-mono); font-size: var(--fs-small); color: var(--white); opacity: 0; transition: opacity 0.5s ease; will-change: opacity;">${captions[i] || `IMG_${String(i + 1).padStart(2, "0")} / moment captured`}</div>
          `).join("")}
          ${!hasRealPhotos ? `
            <div class="hero-photo placeholder is-active" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--pink-20), var(--cream), var(--cork-20)); width: 100%; height: 100%;">
              <span class="placeholder-number" style="font-size: 80px;">01</span>
            </div>
            <div class="hero-caption" style="position: absolute; bottom: 0; left: 0; right: 0; padding: var(--space-lg); background: linear-gradient(transparent, rgba(27, 22, 18, 0.8)); font-family: var(--font-mono); font-size: var(--fs-small); color: var(--white); opacity: 1;">${captions[0] || "IMG_01 / thermodynamic stability"}</div>
          ` : ""}
        </div>
      </div>
      <div class="gallery-transition" style="position: absolute; bottom: 0; left: 0; right: 0; height: 100vh; z-index: 3; pointer-events: none; background: linear-gradient(to top, var(--cream), transparent); opacity: 0;"></div>
    </div>
  `;

  if (isReducedMotion()) {
    document.querySelectorAll(".gallery-item").forEach((item, i) => {
      item.style.position = "static";
      item.style.margin = "var(--space-lg) auto";
      item.style.opacity = "1";
    });
    document.querySelectorAll(".hero-photo").forEach((photo, i) => {
      if (i === 0) photo.style.opacity = "1";
      else photo.style.display = "none";
    });
    document.querySelectorAll(".hero-caption").forEach((cap, i) => {
      if (i === 0) cap.style.opacity = "1";
      else cap.style.opacity = "0";
    });
    return;
  }

  const grid = document.getElementById("gallery-grid");
  const items = grid.querySelectorAll(".gallery-item");
  const heroPhotos = document.querySelectorAll(".hero-photo");
  const heroCaptions = document.querySelectorAll(".hero-caption");
  const heroContainer = document.getElementById("hero-photo-container");
  const galleryLabel = document.getElementById("gallery-label");
  const galleryTitle = document.getElementById("gallery-title");
  const galleryBg = sectionEl.querySelector(".gallery-bg");
  const galleryTransition = sectionEl.querySelector(".gallery-transition");

  gsap.set(items, { transformOrigin: "center center" });
  gsap.set([galleryLabel, galleryTitle], { opacity: 0, y: 0 });
  gsap.set(galleryBg, { opacity: 0 });
  gsap.set(galleryTransition, { opacity: 0 });

  const sectionHeight = sectionEl.offsetHeight;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const headerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: "top top",
      end: "+=100vh",
      scrub: 0.8,
      onEnter: () => {
        gsap.to([galleryLabel, galleryTitle], { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
        gsap.to(galleryBg, { opacity: 1, duration: 1.5, ease: "power2.out" });
      }
    }
  });

  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: self => {
        const progress = self.progress;
        
        items.forEach((item, i) => {
          const speed = parseFloat(item.dataset.speed) || 1;
          const baseRotation = parseFloat(item.dataset.rotation) || 0;
          const baseScale = parseFloat(item.dataset.scale) || 1;
          
          const yOffset = (progress - 0.5) * sectionHeight * 0.6 * speed;
          const xOffset = Math.sin(progress * Math.PI * 2.5 + i * 0.8) * viewportWidth * 0.15 * speed;
          const rotation = baseRotation + Math.sin(progress * Math.PI * 3 + i) * 6 * speed;
          const scale = baseScale + Math.sin(progress * Math.PI * 2 + i) * 0.08 * speed;
          
          gsap.set(item, {
            y: yOffset,
            x: xOffset,
            rotation: rotation,
            scale: scale,
            zIndex: Math.round(1000 - Math.abs(yOffset))
          });
        });

        const heroProgress = progress * (heroPhotos.length - 1);
        const heroIndex = Math.floor(heroProgress);
        const heroFraction = heroProgress - heroIndex;

        heroPhotos.forEach((photo, i) => {
          if (i === heroIndex || (i === heroIndex + 1 && heroFraction > 0)) {
            photo.style.opacity = i === heroIndex ? 1 - heroFraction : heroFraction;
            photo.style.display = "block";
          } else {
            photo.style.opacity = "0";
            if (i !== heroIndex && i !== heroIndex + 1) {
              photo.style.display = "none";
            }
          }
        });

        heroCaptions.forEach((caption, i) => {
          if (i === heroIndex || (i === heroIndex + 1 && heroFraction > 0)) {
            caption.style.opacity = i === heroIndex ? 1 - heroFraction : heroFraction;
          } else {
            caption.style.opacity = "0";
          }
        });

        gsap.set(galleryBg, { opacity: gsap.utils.clamp(0, 1, progress * 0.8) });
        gsap.set(galleryTransition, { opacity: gsap.utils.clamp(0, 1, (progress - 0.8) * 5) });
      }
    }
  });

  if (experience) {
    experience.registerPhotoElement("gallery-grid", grid, { items });
    experience.registerPhotoElement("hero-photo-container", heroContainer, { photos: heroPhotos });
  }

  ScrollTrigger.addEventListener("refresh", () => {
    sectionHeight = sectionEl.offsetHeight;
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

window.initGallery = initGallery;