export function initSpecSheet(sectionEl, content, { gsap, ScrollTrigger, lenis, confetti }) {
  const stats = content.stats;
  const name = content.name;

  const rows = [
    { label: "Messages exchanged", value: stats.messagesExchanged, formatter: "indian", suffix: "" },
    { label: "Photos & videos sent", value: stats.photosAndVideosSent, formatter: "indian", suffix: "" },
    { label: "Days of talking", value: stats.daysOfTalking, formatter: "normal", suffix: "" },
    { label: 'Times "aree" said', value: stats.timesSheSaidAree, formatter: "indian", suffix: "" },
    { label: 'Times called me "mittu"', value: stats.timesSheCalledMeMittu, formatter: "indian", suffix: "" },
    { label: stats.jokeStat1.label || "TODO_USER_LABEL_1", value: stats.jokeStat1.value, formatter: "normal", suffix: stats.jokeStat1.suffix || "" },
    { label: stats.jokeStat2.label || "TODO_USER_LABEL_2", value: stats.jokeStat2.value, formatter: "normal", suffix: stats.jokeStat2.suffix || "" },
    { label: stats.jokeStat3.label || "TODO_USER_LABEL_3", value: stats.jokeStat3.value, formatter: "normal", suffix: stats.jokeStat3.suffix || "" },
    { label: stats.jokeStat4.label || "TODO_USER_LABEL_4", value: stats.jokeStat4.value, formatter: "normal", suffix: stats.jokeStat4.suffix || "" },
    { label: "Connectivity", value: "Always on", formatter: "string", suffix: "" },
    { label: "Updates", value: "Never needed", formatter: "string", suffix: "" },
    { label: "Battery", value: "Hungry at all times", formatter: "string", suffix: "" }
  ];

  sectionEl.innerHTML = `
    <div class="container" style="padding: var(--space-4xl) var(--space-lg);">
      <div style="max-width: 800px; margin: 0 auto;">
        <span class="mono-label" style="display: block; margin-bottom: var(--space-md);">Spec Sheet — ${name}-1</span>
        <h2 class="section-title" style="margin-bottom: var(--space-3xl);">Technical specifications</h2>
        <div class="spec-table" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg) var(--space-2xl); margin-bottom: var(--space-4xl);">
          ${rows.map((row, i) => `
            <div class="spec-row" style="opacity: 0; transform: translateY(20px); grid-column: 1; transition: opacity 0.6s ease, transform 0.6s ease;">
              <span class="mono-label">${row.label}</span>
            </div>
            <div class="spec-value" style="opacity: 0; transform: translateY(20px); grid-column: 2; text-align: right; transition: opacity 0.6s ease, transform 0.6s ease;">
              <span class="counter" data-value="${row.value}" data-formatter="${row.formatter}" data-suffix="${row.suffix}">0</span>
            </div>
          `).join("")}
        </div>
        <div class="mood-section" style="padding-top: var(--space-3xl); border-top: 1px solid var(--ink-20);">
          <span class="mono-label" style="display: block; margin-bottom: var(--space-lg);">Mood slider</span>
          <div class="mood-slider" id="mood-slider" role="slider" aria-label="Mood: Chaotic, Sleepy, or Hungry" aria-valuemin="0" aria-valuemax="2" aria-valuenow="1" tabindex="0">
            <div class="mood-slider-track"></div>
            <div class="mood-slider-thumb" id="mood-thumb" aria-hidden="true">😐</div>
          </div>
          <div class="mood-slider-labels">
            <span>Chaotic</span>
            <span>Sleepy</span>
            <span>Hungry</span>
          </div>
          <div class="mood-output" id="mood-output">
            <span class="mood-emoji">😐</span>
            <p class="mood-caption">Balanced mode engaged. All systems nominal.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  if (isReducedMotion()) {
    document.querySelectorAll(".spec-row, .spec-value").forEach(el => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    animateCounters();
    initMoodSlider();
    return;
  }

  gsap.utils.toArray(".spec-row, .spec-value").forEach((el, i) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: sectionEl,
        start: "top 80%",
        end: "top 30%",
        scrub: 0.5,
        onEnter: () => animateRow(el, i)
      },
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: i * 0.05,
      ease: "power2.out"
    });
  });

  function animateRow(el, index) {
    if (el.classList.contains("spec-value")) {
      const counter = el.querySelector(".counter");
      if (counter && !counter.dataset.animated) {
        counter.dataset.animated = "true";
        animateCounter(counter);
      }
    }
  }

  function animateCounters() {
    document.querySelectorAll(".counter[data-value]").forEach(counter => {
      if (!counter.dataset.animated) {
        counter.dataset.animated = "true";
        animateCounter(counter);
      }
    });
  }

  function animateCounter(counterEl) {
    const targetValue = counterEl.dataset.value;
    const formatter = counterEl.dataset.formatter;
    const suffix = counterEl.dataset.suffix;

    if (formatter === "string") {
      counterEl.textContent = targetValue;
      return;
    }

    const numValue = parseInt(targetValue, 10);
    const obj = { val: 0 };

    gsap.to(obj, {
      val: numValue,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        let formatted;
        if (formatter === "indian") {
          formatted = window.indianNumberFormat ? window.indianNumberFormat(Math.round(obj.val)) : Math.round(obj.val).toLocaleString();
        } else {
          formatted = window.formatNumber ? window.formatNumber(Math.round(obj.val)) : Math.round(obj.val).toLocaleString();
        }
        counterEl.textContent = formatted + (suffix ? " " + suffix : "");
      },
      onComplete: () => {
        let formatted;
        if (formatter === "indian") {
          formatted = window.indianNumberFormat ? window.indianNumberFormat(numValue) : numValue.toLocaleString();
        } else {
          formatted = window.formatNumber ? window.formatNumber(numValue) : numValue.toLocaleString();
        }
        counterEl.textContent = formatted + (suffix ? " " + suffix : "");
      }
    });
  }

  function initMoodSlider() {
    const slider = document.getElementById("mood-slider");
    const thumb = document.getElementById("mood-thumb");
    const output = document.getElementById("mood-output");
    const emojiEl = output.querySelector(".mood-emoji");
    const captionEl = output.querySelector(".mood-caption");

    const moods = [
      { emoji: "🤪", caption: "Chaos mode activated. Expect spontaneous dance breaks." },
      { emoji: "😴", caption: "Sleepy mode. Naps are mandatory. Cuddles required." },
      { emoji: "🍕", caption: "Hungry mode. Feed immediately or face the consequences." }
    ];

    let currentMood = 1;
    const positions = [4, "calc(50% - 20px)", "calc(100% - 44px)"];

    function setMood(index) {
      currentMood = index;
      const mood = moods[index];
      gsap.to(thumb, {
        left: positions[index],
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.to(emojiEl, {
        scale: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          emojiEl.textContent = mood.emoji;
          gsap.to(emojiEl, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
        }
      });
      gsap.to(captionEl, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          captionEl.textContent = mood.caption;
          gsap.to(captionEl, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
        }
      });
      slider.setAttribute("aria-valuenow", index);
    }

    slider.addEventListener("click", (e) => {
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      let index = Math.round(percent * 2);
      index = Math.max(0, Math.min(2, index));
      setMood(index);
    });

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setMood(Math.max(0, currentMood - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setMood(Math.min(2, currentMood + 1));
      }
    });

    let isDragging = false;
    slider.addEventListener("pointerdown", (e) => {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const left = 4 + percent * (rect.width - 48);
      gsap.set(thumb, { left });
    });
    slider.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      let index = Math.round(percent * 2);
      index = Math.max(0, Math.min(2, index));
      setMood(index);
      slider.releasePointerCapture(e.pointerId);
    });
    slider.addEventListener("pointercancel", (e) => {
      isDragging = false;
      slider.releasePointerCapture(e.pointerId);
    });

    setMood(1);
  }

  initMoodSlider();
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initSpecSheet = initSpecSheet;