function getPlaceholderCard(number) {
  return `
    <div class="flip-card-front placeholder">
      <span class="placeholder-number" style="font-size: 48px;">${number}</span>
    </div>
  `;
}

function getPhotoCard(filename, manifest) {
  const photo = manifest.find(p => p.filename === filename);
  const w = photo?.optimizedWidth || 1050;
  const h = photo?.optimizedHeight || 1400;
  return `
    <div class="flip-card-front">
      <img src="/public/photos/${filename}" alt="" loading="lazy" decoding="async" width="${w}" height="${h}">
    </div>
  `;
}

export function initFlipCards(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
  const memories = content.memories || [];
  const manifest = getManifest();
  const hasRealPhotos = manifest.length > 0 && memories.some(m => manifest.some(p => p.filename === m.photo));

  const cardsHTML = memories.map((memory, i) => {
    const frontHTML = hasRealPhotos && manifest.some(p => p.filename === memory.photo)
      ? getPhotoCard(memory.photo, manifest)
      : getPlaceholderCard(String(i + 1).padStart(2, "0"));
    
    return `
      <article class="flip-card" id="flip-card-${i}" tabindex="0" role="button" aria-label="${memory.caption || `Memory ${i + 1}`}" aria-pressed="false">
        <div class="flip-card-inner">
          ${frontHTML}
          <div class="flip-card-back">
            <span class="flip-card-caption">${memory.caption || `Memory ${i + 1}`}</span>
            <p class="flip-card-text">${memory.text || `TODO_USER_MEMORY_${i + 1}`}</p>
          </div>
        </div>
      </article>
    `;
  }).join("");

  sectionEl.innerHTML = `
    <div class="container" style="padding: var(--space-4xl) var(--space-lg); min-height: 150vh; position: relative;">
      <div class="flip-bg" style="position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at center, var(--pink-20) 0%, transparent 60%); opacity: 0; will-change: opacity;"></div>
      <div style="max-width: 1000px; margin: 0 auto; text-align: center; margin-bottom: var(--space-3xl); position: relative; z-index: 10;">
        <span class="mono-label" style="display: block; margin-bottom: var(--space-md); opacity: 0; transform: translateY(20px);" id="flip-label">Encrypted Memories</span>
        <h2 class="section-title" style="margin-bottom: var(--space-xs); opacity: 0; transform: translateY(30px);">Write a memory. Flip. Instantly secure.</h2>
        <p class="section-subtitle" style="opacity: 0; transform: translateY(20px);">Tap any card to reveal what's on the other side.</p>
      </div>
      <div class="card-grid" id="flip-grid" style="margin-bottom: var(--space-3xl); position: relative; z-index: 10;">
        ${cardsHTML}
      </div>
      <div style="text-align: center; position: relative; z-index: 10; opacity: 0; transform: translateY(30px);" id="decode-section">
        <button class="btn btn-primary decode-btn" id="decode-btn" aria-label="Decode secret message">
          Decode Message
        </button>
        <div class="scramble-text" id="scramble-text" aria-live="polite" aria-atomic="true" style="margin-top: var(--space-xl); min-height: 1.5em;"></div>
      </div>
      <div class="flip-transition" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50vh; z-index: 2; pointer-events: none; background: linear-gradient(to top, var(--cream), transparent); opacity: 0;"></div>
    </div>
  `;

  const cards = sectionEl.querySelectorAll(".flip-card");
  const decodeBtn = document.getElementById("decode-btn");
  const scrambleText = document.getElementById("scramble-text");

  cards.forEach(card => {
    card.addEventListener("click", () => toggleFlip(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip(card);
      }
    });
  });

  function toggleFlip(card) {
    const isFlipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", isFlipped);
  }

  const secretMessage = "You are my favourite person to talk to.";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let isDecoding = false;

  decodeBtn.addEventListener("click", () => {
    if (isDecoding) return;
    isDecoding = true;
    decodeBtn.disabled = true;
    
    let currentText = "";
    const length = secretMessage.length;
    
    const interval = setInterval(() => {
      let display = "";
      for (let i = 0; i < length; i++) {
        if (i < currentText.length) {
          display += secretMessage[i];
        } else {
          display += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      scrambleText.textContent = display;
      
      if (currentText.length < length) {
        currentText += secretMessage[currentText.length];
      } else {
        clearInterval(interval);
        scrambleText.textContent = secretMessage;
        isDecoding = false;
        decodeBtn.disabled = false;
      }
    }, 50);
  });

  if (isReducedMotion()) {
    cards.forEach(card => {
      card.style.cursor = "default";
      card.removeEventListener("click", toggleFlip);
    });
    return;
  }

  const flipBg = sectionEl.querySelector(".flip-bg");
  const flipTransition = sectionEl.querySelector(".flip-transition");
  const flipLabel = document.getElementById("flip-label");
  const decodeSection = document.getElementById("decode-section");

  gsap.set([flipLabel, decodeSection], { opacity: 0, y: 30 });
  gsap.set(flipBg, { opacity: 0 });
  gsap.set(flipTransition, { opacity: 0 });

  gsap.fromTo(".flip-card", 
    { opacity: 0, y: 50, rotationX: -15 },
    {
      scrollTrigger: {
        trigger: sectionEl,
        start: "top 70%",
        end: "top 20%",
        scrub: 0.5
      },
      opacity: 1,
      y: 0,
      rotationX: 0,
      stagger: 0.08,
      duration: 1,
      ease: "power3.out"
    }
  );

  gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 60%",
      end: "top 20%",
      scrub: 0.5
    }
  })
  .to([flipLabel, decodeSection], { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" }, 0)
  .to(flipBg, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0);

  gsap.to(flipTransition, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "bottom 80%",
      end: "bottom top",
      scrub: 1
    },
    opacity: 1,
    ease: "none"
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

window.initFlipCards = initFlipCards;