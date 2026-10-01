export function initReviews(sectionEl, content, { gsap, ScrollTrigger, lenis, experience }) {
  const name = content.name;
  const reviews = content.reviews || [];

  const reviewsHTML = reviews.map((review, i) => `
    <article class="review-card" style="will-change: opacity, transform;">
      <div class="review-stars" aria-label="${review.stars} out of 5 stars">
        ${Array.from({ length: 5 }, () => `
          <svg class="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        `).join("")}
      </div>
      <p class="review-quote">"${review.quote || `TODO_USER_REVIEW_${i + 1}`}"</p>
      <div class="review-author">
        <span class="review-who">${review.who || `TODO_USER_REVIEWER_${i + 1}`}</span>
        <span class="review-tag">${review.tag || `TODO_USER_TAG_${i + 1}`}</span>
      </div>
    </article>
  `).join("");

  const marqueeItems = [
    "SO CHARMING", "100% VEGAN-FRIENDLY", "NOW 37.9% MORE ADORABLE",
    "CHAOTIC GOOD ALIGNMENT", "SNACK PROTOCOL ACTIVE", "MAIN CHARACTER ENERGY",
    "PLOT ARMOR ENGAGED", "CUDDLE STATISTICS UPDATED", "LAUGHTER FREQUENCY: HIGH",
    "HEART CAPACITY: INFINITE", "ADVENTURE MODE: ALWAYS ON", "PEACE TREATY SIGNED"
  ];

  const marqueeHTML = marqueeItems.map(item => `<span class="marquee-item">${item}</span>`).join("");

  sectionEl.innerHTML = `
    <div class="container" style="padding: var(--space-4xl) var(--space-lg); min-height: 150vh; position: relative;">
      <div class="reviews-bg" style="position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at 50% 0%, var(--cork-20) 0%, transparent 50%); opacity: 0; will-change: opacity;"></div>
      <div style="max-width: 800px; margin: 0 auto var(--space-3xl); text-align: center; position: relative; z-index: 10; opacity: 0; transform: translateY(30px);" id="reviews-header">
        <span class="mono-label" style="display: block; margin-bottom: var(--space-md);">Global Sentiment</span>
        <h2 class="section-title" style="margin-bottom: var(--space-xs);">People all around the world love ${name}.</h2>
        <p class="section-subtitle" style="margin-bottom: var(--space-lg);">Rating <strong>[ 4.9/5 ]</strong> &nbsp; Custom reviews <strong>[ ${reviews.length} ]</strong></p>
      </div>
      <div id="reviews-container" style="display: flex; flex-direction: column; gap: var(--space-lg); margin-bottom: var(--space-4xl); position: relative; z-index: 10;">
        ${reviewsHTML}
      </div>
      <div class="marquee-wrapper" style="overflow: hidden; border-top: 1px solid var(--ink-20); border-bottom: 1px solid var(--ink-20); padding: var(--space-lg) 0; position: relative; z-index: 10;">
        <div class="marquee" id="marquee" aria-hidden="true" style="will-change: transform;">
          ${marqueeHTML}
          ${marqueeHTML}
          ${marqueeHTML}
        </div>
      </div>
      <div class="reviews-transition" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50vh; z-index: 2; pointer-events: none; background: linear-gradient(to top, var(--cream), transparent); opacity: 0;"></div>
    </div>
  `;

  if (isReducedMotion()) {
    document.querySelectorAll(".review-card").forEach(card => {
      card.style.opacity = "1";
      card.style.transform = "none";
    });
    document.getElementById("reviews-header").style.opacity = "1";
    document.getElementById("reviews-header").style.transform = "none";
    return;
  }

  const reviewsBg = sectionEl.querySelector(".reviews-bg");
  const reviewsTransition = sectionEl.querySelector(".reviews-transition");
  const reviewsHeader = document.getElementById("reviews-header");

  gsap.set(reviewsHeader, { opacity: 0, y: 30 });
  gsap.set(reviewsBg, { opacity: 0 });
  gsap.set(reviewsTransition, { opacity: 0 });

  gsap.to(reviewsHeader, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 70%",
      end: "top 30%",
      scrub: 0.5
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out"
  });

  gsap.to(reviewsBg, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 60%",
      end: "top 20%",
      scrub: 0.5
    },
    opacity: 1,
    duration: 1.5,
    ease: "power2.out"
  });

  gsap.utils.toArray(".review-card").forEach((card, i) => {
    const startX = i % 2 === 0 ? 60 : -60;
    gsap.to(card, {
      scrollTrigger: {
        trigger: sectionEl,
        start: "top 70%",
        end: "top 25%",
        scrub: 0.5
      },
      opacity: 1,
      x: 0,
      duration: 1,
      delay: i * 0.08,
      ease: "power3.out"
    });
    gsap.set(card, { x: startX });
  });

  gsap.to(reviewsTransition, {
    scrollTrigger: {
      trigger: sectionEl,
      start: "bottom 80%",
      end: "bottom top",
      scrub: 1
    },
    opacity: 1,
    ease: "none"
  });

  const marquee = document.getElementById("marquee");
  let marqueeX = 0;
  const marqueeWidth = marquee.scrollWidth / 3;

  function animateMarquee() {
    if (isReducedMotion()) return;
    
    if (lenis) {
      lenis.on("scroll", ({ velocity }) => {
        marqueeX -= velocity * 0.3;
        if (marqueeX <= -marqueeWidth) marqueeX += marqueeWidth;
        if (marqueeX > 0) marqueeX -= marqueeWidth;
        gsap.set(marquee, { x: marqueeX });
      });
    } else {
      gsap.to(marquee, { x: -marqueeWidth, duration: 30, ease: "none", repeat: -1 });
    }
  }

  animateMarquee();
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initReviews = initReviews;