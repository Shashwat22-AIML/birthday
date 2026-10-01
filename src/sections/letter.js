function getPlaceholderCard(number) {
  return `
    <div class="hero-stack-card placeholder" style="opacity: 0.3; max-width: 200px;">
      <span class="placeholder-number" style="font-size: 24px;">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  const aspectRatio = w / h;
  return `
    <div class="hero-stack-card" style="opacity: 0.3; max-width: 200px; aspect-ratio: ${aspectRatio};">
      <img src="/public/photos/${filename}" alt="" loading="lazy" decoding="async" width="${w}" height="${h}">
    </div>
  `;
}

export function initLetter(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  const name = content.name;
  const fromName = content.fromName;
  const letter = content.letter || [];
  const manifest = getManifest();
  const photoFiles = content.memories.map(m => m.photo).slice(0, 2);
  const hasRealPhotos = manifest.length > 0 && photoFiles.some(f => manifest.some(p => p.filename === f));

  let photosHTML = "";
  photoFiles.forEach((item, i) => {
    if (hasRealPhotos) {
      photosHTML += getPhotoCard(item, manifest);
    } else {
      photosHTML += getPlaceholderCard(String(i + 1).padStart(2, "0"));
    }
  });

  const paragraphsHTML = letter.map((para, i) => `
    <p class="reveal-line" style="font-family: var(--font-display); font-size: clamp(20px, 4.8vw, 34px); font-style: italic; line-height: var(--lh-relaxed); color: var(--cream); margin-bottom: var(--space-xl); opacity: 0; transform: translateY(30px); will-change: opacity, transform;">${para || `TODO_USER_LETTER_PARA_${i + 1}`}</p>
  `).join("");

  sectionEl.innerHTML = `
    <div class="container" style="padding: var(--space-4xl) var(--space-lg); background: var(--night); min-height: 200vh;">
      <div class="letter-photos" style="position: fixed; top: 20%; right: 5%; display: flex; flex-direction: column; gap: var(--space-xl); pointer-events: none; z-index: 5; opacity: 0; will-change: opacity;">
        ${photosHTML}
      </div>
      <div class="letter-content" style="max-width: 700px; margin: 0 auto; padding: var(--space-4xl) 0; position: relative; z-index: 10;">
        <div class="letter-paragraphs" id="letter-paragraphs">
          ${paragraphsHTML}
        </div>
        <p class="letter-signature" style="font-family: var(--font-ui); font-size: var(--fs-body); color: var(--cork); text-align: right; margin-top: var(--space-3xl); opacity: 0; transform: translateY(20px);">- ${fromName}</p>
      </div>
    </div>
  `;

  const paragraphs = sectionEl.querySelectorAll(".reveal-line");
  const signature = sectionEl.querySelector(".letter-signature");
  const letterPhotos = sectionEl.querySelector(".letter-photos");

  if (isReducedMotion()) {
    paragraphs.forEach(p => { p.style.opacity = "1"; p.style.transform = "none"; });
    signature.style.opacity = "1";
    signature.style.transform = "none";
    letterPhotos.style.opacity = "1";
    return;
  }

  gsap.to(letterPhotos, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 80%",
      end: "top 30%",
      scrub: 0.5
    },
    opacity: 1,
    duration: 1,
    ease: "power2.out"
  });

  paragraphs.forEach((p, i) => {
    gsap.to(p, {
      scrollTrigger: {
        trigger: sectionEl,
        start: `top ${70 - i * 5}%`,
        end: `top ${30 - i * 5}%`,
        scrub: 0.8
      },
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    });
  });

  gsap.to(signature, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 20%",
      end: "top 0%",
      scrub: 0.8
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out"
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

window.initLetter = initLetter;