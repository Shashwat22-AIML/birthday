export function initFinale(sectionEl, content, { gsap, ScrollTrigger, lenis, confetti }) {
  const name = content.name;
  const birthdayLabel = content.birthdayLabel;

  sectionEl.innerHTML = `
    <div class="container" style="height: 150vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-4xl) var(--space-lg); background: var(--night); position: relative;">
      <div class="finale-content" style="z-index: 10; max-width: 500px;">
        <svg class="cake-svg" id="cake-svg" viewBox="0 0 320 400" aria-label="Birthday cake with a lit candle" role="img" style="margin-bottom: var(--space-xl); cursor: pointer;" tabindex="0">
          <defs>
            <linearGradient id="cake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3D2B1F"/>
              <stop offset="100%" stop-color="#2D1B12"/>
            </linearGradient>
            <linearGradient id="frosting-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#F4EEE6"/>
              <stop offset="100%" stop-color="#E8DCC8"/>
            </linearGradient>
            <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFD700"/>
              <stop offset="50%" stop-color="#FF8C00"/>
              <stop offset="100%" stop-color="#FF4500"/>
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="60" y="280" width="200" height="80" rx="8" fill="url(#cake-gradient)"/>
          <rect x="55" y="275" width="210" height="10" rx="5" fill="url(#frosting-gradient)"/>
          <rect x="70" y="200" width="180" height="80" rx="8" fill="url(#cake-gradient)"/>
          <rect x="65" y="195" width="190" height="10" rx="5" fill="url(#frosting-gradient)"/>
          <rect x="85" y="130" width="150" height="70" rx="8" fill="url(#cake-gradient)"/>
          <rect x="80" y="125" width="160" height="10" rx="5" fill="url(#frosting-gradient)"/>
          <circle cx="160" cy="80" r="8" fill="url(#flame-gradient)" class="candle-flame" id="candle-flame" filter="url(#glow)"/>
          <rect x="157" y="125" width="6" height="55" fill="#2D1B12" rx="3"/>
          <ellipse cx="160" cy="125" rx="30" ry="6" fill="url(#frosting-gradient)"/>
          <g class="smoke" id="smoke-1" style="opacity: 0;">
            <path d="M160 80 Q150 60 160 40 Q170 20 160 0" stroke="rgba(244,238,230,0.6)" stroke-width="3" fill="none" stroke-linecap="round"/>
          </g>
          <g class="smoke" id="smoke-2" style="opacity: 0;">
            <path d="M160 80 Q170 60 160 40 Q150 20 160 0" stroke="rgba(244,238,230,0.4)" stroke-width="2" fill="none" stroke-linecap="round"/>
          </g>
          <g class="sprinkles" style="opacity: 0.8;">
            ${Array.from({ length: 20 }, () => {
              const x = 60 + Math.random() * 200;
              const y = 130 + Math.random() * 150;
              const colors = ["#F2A7B8", "#C9955C", "#F4EEE6", "#FF6B6B", "#4ECDC4"];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const w = 4 + Math.random() * 6;
              const h = 2 + Math.random() * 3;
              const rot = Math.random() * 360;
              return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" transform="rotate(${rot} ${x} ${y})"/>`;
            }).join("")}
          </g>
        </svg>
        <p id="finale-prompt" style="font-family: var(--font-ui); font-size: var(--fs-body); color: var(--cream-80); margin-bottom: var(--space-lg);">Make a wish. Then tap the candle.</p>
        <h2 id="finale-message" class="section-title" style="font-size: var(--fs-h1); color: var(--cream); opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; white-space: pre-line;">Happy Birthday, ${name}.\n${birthdayLabel}</h2>
        <button id="relight-btn" class="btn btn-ghost" style="margin-top: var(--space-2xl); opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease;">Light it again</button>
      </div>
      <canvas class="confetti-canvas" id="confetti-canvas" aria-hidden="true"></canvas>
    </div>
  `;

  const cakeSvg = document.getElementById("cake-svg");
  const candleFlame = document.getElementById("candle-flame");
  const smoke1 = document.getElementById("smoke-1");
  const smoke2 = document.getElementById("smoke-2");
  const prompt = document.getElementById("finale-prompt");
  const message = document.getElementById("finale-message");
  const relightBtn = document.getElementById("relight-btn");
  const confettiCanvas = document.getElementById("confetti-canvas");

  let isBlown = false;
  let confettiInstance = null;

  function initConfetti() {
    confettiInstance = confetti.create(confettiCanvas, {
      resize: true,
      useWorker: true
    });
  }

  function blowOutCandle() {
    if (isBlown) return;
    isBlown = true;

    gsap.to(candleFlame, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        candleFlame.style.display = "none";
        smoke1.style.opacity = "1";
        smoke2.style.opacity = "1";
        smoke1.classList.add("is-visible");
        smoke2.classList.add("is-visible");
        
        setTimeout(() => {
          triggerConfetti();
          showMessage();
        }, 300);
      }
    });

    gsap.to(prompt, { opacity: 0, duration: 0.3, ease: "power2.in" });
    cakeSvg.style.cursor = "default";
    cakeSvg.removeEventListener("click", blowOutCandle);
    cakeSvg.removeEventListener("keydown", handleKeydown);
  }

  function handleKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      blowOutCandle();
    }
  }

  function triggerConfetti() {
    if (!confettiInstance) initConfetti();

    const colors = ["#F2A7B8", "#C9955C", "#F4EEE6", "#FFD700", "#FF8C00"];

    confettiInstance({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.2, y: 0.8 },
      colors,
      gravity: 0.8,
      scalar: 1.2,
      drift: -0.5
    });

    confettiInstance({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.8, y: 0.8 },
      colors,
      gravity: 0.8,
      scalar: 1.2,
      drift: 0.5
    });

    setTimeout(() => {
      confettiInstance({
        particleCount: 150,
        spread: 140,
        origin: { x: 0.5, y: 0.5 },
        colors,
        gravity: 0.6,
        scalar: 1.5
      });
    }, 200);
  }

  function showMessage() {
    gsap.to(message, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        gsap.to(relightBtn, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.5,
          ease: "power2.out"
        });
      }
    });

    if (lenis) {
      setTimeout(() => {
        lenis.scrollTo(document.getElementById("footer"), { offset: 0, immediate: false });
      }, 2000);
    }
  }

  function relightCandle() {
    isBlown = false;
    candleFlame.style.display = "block";
    gsap.to(candleFlame, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
    smoke1.classList.remove("is-visible");
    smoke2.classList.remove("is-visible");
    gsap.to(message, { opacity: 0, y: 30, duration: 0.5, ease: "power2.in" });
    gsap.to(relightBtn, { opacity: 0, y: 20, duration: 0.3, ease: "power2.in" });
    gsap.to(prompt, { opacity: 1, duration: 0.3, delay: 0.5, ease: "power2.out" });
    cakeSvg.style.cursor = "pointer";
    cakeSvg.addEventListener("click", blowOutCandle);
    cakeSvg.addEventListener("keydown", handleKeydown);
  }

  cakeSvg.addEventListener("click", blowOutCandle);
  cakeSvg.addEventListener("keydown", handleKeydown);
  relightBtn.addEventListener("click", relightCandle);

  if (isReducedMotion()) {
    candleFlame.style.animation = "none";
  }
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initFinale = initFinale;