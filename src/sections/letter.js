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

export function initLetter(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
  const name = content.name;
  const fromName = content.fromName;
  const letter = content.letter || [];
  const manifest = getManifest();
  const photoFiles = content.memories.map(m => m.photo).slice(0, 3);
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
    <p class="reveal-line" data-index="${i}" style="font-family: var(--font-display); font-size: clamp(20px, 4.8vw, 34px); font-style: italic; line-height: var(--lh-relaxed); color: var(--cream); margin-bottom: var(--space-xl); opacity: 0; transform: translateY(40px); will-change: opacity, transform;">${para || `TODO_USER_LETTER_PARA_${i + 1}`}</p>
  `).join("");

  sectionEl.innerHTML = `
    <div class="letter-container" style="padding: var(--space-4xl) var(--space-lg); background: var(--night); min-height: 300vh; position: relative;">
      <div class="letter-bg" style="position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at 50% 30%, rgba(242,167,184,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 70%, rgba(201,149,92,0.08) 0%, transparent 50%); opacity: 1;"></div>
      <div class="letter-photos" style="position: fixed; top: 15%; left: 5%; display: flex; flex-direction: column; gap: var(--space-xl); pointer-events: none; z-index: 5; opacity: 0; will-change: opacity, transform;">
        ${photosHTML}
      </div>
      <div class="letter-photos-right" style="position: fixed; top: 25%; right: 5%; display: flex; flex-direction: column; gap: var(--space-xl); pointer-events: none; z-index: 5; opacity: 0; will-change: opacity, transform;">
        ${hasRealPhotos && photoFiles.length > 2 ? getPhotoCard(photoFiles[2], manifest) : getPlaceholderCard("04")}
      </div>
      <div class="letter-content" style="max-width: 700px; margin: 0 auto; padding: var(--space-4xl) 0; position: relative; z-index: 10;">
        <div class="letter-header" style="text-align: center; margin-bottom: var(--space-4xl); opacity: 0; transform: translateY(30px);" id="letter-header">
          <span class="mono-label" style="display: block; margin-bottom: var(--space-md);">A Letter</span>
          <h2 class="section-title" style="font-size: var(--fs-h2); color: var(--cork);">For ${name}</h2>
        </div>
        <div class="letter-paragraphs" id="letter-paragraphs">
          ${paragraphsHTML}
        </div>
        <p class="letter-signature" style="font-family: var(--font-ui); font-size: var(--fs-body); color: var(--cork); text-align: right; margin-top: var(--space-4xl); opacity: 0; transform: translateY(30px);">- ${fromName}</p>
      </div>
      <div class="letter-transition" style="position: absolute; bottom: 0; left: 0; right: 0; height: 100vh; z-index: 2; pointer-events: none; background: linear-gradient(to top, var(--night), transparent); opacity: 0;"></div>
    </div>
  `;

  const paragraphs = sectionEl.querySelectorAll(".reveal-line");
  const signature = sectionEl.querySelector(".letter-signature");
  const letterPhotosLeft = sectionEl.querySelector(".letter-photos");
  const letterPhotosRight = sectionEl.querySelector(".letter-photos-right");
  const letterHeader = document.getElementById("letter-header");
  const letterTransition = sectionEl.querySelector(".letter-transition");

  if (isReducedMotion()) {
    paragraphs.forEach(p => { p.style.opacity = "1"; p.style.transform = "none"; });
    signature.style.opacity = "1";
    signature.style.transform = "none";
    letterPhotosLeft.style.opacity = "1";
    letterPhotosRight.style.opacity = "1";
    letterHeader.style.opacity = "1";
    letterHeader.style.transform = "none";
    return;
  }

  gsap.set(paragraphs, { opacity: 0, y: 40 });
  gsap.set(signature, { opacity: 0, y: 30 });
  gsap.set(letterHeader, { opacity: 0, y: 30 });
  gsap.set(letterPhotosLeft, { opacity: 0, x: -50 });
  gsap.set(letterPhotosRight, { opacity: 0, x: 50 });

  gsap.to(letterHeader, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 70%",
      end: "top 40%",
      scrub: 0.5
    },
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power3.out"
  });

  gsap.to(letterPhotosLeft, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 60%",
      end: "top 30%",
      scrub: 0.5
    },
    opacity: 1,
    x: 0,
    duration: 1.5,
    ease: "power3.out"
  });

  gsap.to(letterPhotosRight, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 55%",
      end: "top 25%",
      scrub: 0.5
    },
    opacity: 1,
    x: 0,
    duration: 1.5,
    ease: "power3.out"
  });

  paragraphs.forEach((p, i) => {
    gsap.to(p, {
      scrollTrigger: {
        trigger: sectionEl,
        start: `top ${65 - i * 4}%`,
        end: `top ${35 - i * 4}%`,
        scrub: 0.7
      },
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out"
    });
  });

  gsap.to(signature, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 15%",
      end: "top 0%",
      scrub: 0.7
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out"
  });

  gsap.to(letterTransition, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "bottom 80%",
      end: "bottom top",
      scrub: 1
    },
    opacity: 1,
    ease: "none"
  });

  if (experience) {
    experience.registerPhotoElement("letter-photos-left", letterPhotosLeft, { photos: letterPhotosLeft.querySelectorAll(".hero-stack-card") });
    experience.registerPhotoElement("letter-photos-right", letterPhotosRight, { photos: letterPhotosRight.querySelectorAll(".hero-stack-card") });
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

window.initLetter = initLetter;