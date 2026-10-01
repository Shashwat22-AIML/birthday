export function initChoose(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  const name = content.name;

  const tiers = [
    {
      name: name,
      subtitle: "Standard Edition",
      features: [
        "Lift: 1 hug thick",
        "Connectivity: None needed",
        "Updates: Never",
        "Battery: Infinite love",
        "Warranty: Lifetime"
      ],
      cta: "Choose this one"
    },
    {
      name: `${name} Pro`,
      subtitle: "Enhanced Edition",
      features: [
        "Lift: 2 hugs thick",
        "Connectivity: Telepathic",
        "Updates: Surprise gifts",
        "Battery: Snack-powered",
        "Warranty: Forever + 1 day"
      ],
      cta: "Choose this one"
    },
    {
      name: `${name} Pro Max`,
      subtitle: "Ultimate Edition",
      features: [
        "Lift: 3 hugs thick",
        "Connectivity: Soul-linked",
        "Updates: Daily forehead kisses",
        "Battery: Powered by 'aree'",
        "Warranty: Eternity"
      ],
      cta: "Choose this one"
    }
  ];

  const tiersHTML = tiers.map((tier, i) => `
    <article class="tier-card" data-tier="${i}" tabindex="0" role="button" aria-label="${tier.name}" aria-pressed="false">
      <h3 class="tier-name">${tier.name}</h3>
      <p class="tier-subtitle">${tier.subtitle}</p>
      <ul class="tier-features" role="list">
        ${tier.features.map(f => `<li class="tier-feature">${f}</li>`).join("")}
      </ul>
      <button class="btn btn-primary tier-cta" aria-label="Select ${tier.name}">${tier.cta}</button>
    </article>
  `).join("");

  sectionEl.innerHTML = `
    <div class="container" style="padding: var(--space-4xl) var(--space-lg);">
      <div style="max-width: 1000px; margin: 0 auto; text-align: center; margin-bottom: var(--space-3xl);">
        <span class="mono-label" style="display: block; margin-bottom: var(--space-md);">Pick Your Plan</span>
        <h2 class="section-title" style="margin-bottom: var(--space-xs);">Choose your own ${name}</h2>
        <p class="section-subtitle">All paths lead to the same destination. But pick anyway.</p>
      </div>
      <div class="card-grid" id="tier-grid" style="margin-bottom: var(--space-3xl);">
        ${tiersHTML}
      </div>
      <div id="choose-result" style="text-align: center; opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease;">
        <p style="font-family: var(--font-display); font-size: var(--fs-h3); font-style: italic; color: var(--ink); margin-bottom: var(--space-md);">All options lead to the same ending:</p>
        <p style="font-family: var(--font-display); font-size: var(--fs-h2); font-style: italic; color: var(--pink);">you're stuck with me. Happy Birthday.</p>
      </div>
    </div>
  `;

  const tierCards = sectionEl.querySelectorAll(".tier-card");
  const tierButtons = sectionEl.querySelectorAll(".tier-cta");
  const result = document.getElementById("choose-result");
  let selectedTier = -1;

  tierCards.forEach((card, i) => {
    const btn = card.querySelector(".tier-cta");
    const selectTier = () => {
      if (selectedTier === i) return;
      selectedTier = i;
      tierCards.forEach((c, j) => {
        c.classList.toggle("is-selected", j === i);
        c.setAttribute("aria-pressed", j === i);
      });
      gsap.to(result, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    };
    card.addEventListener("click", selectTier);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectTier();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTier();
      }
    });
  });

  if (isReducedMotion()) {
    return;
  }

  gsap.fromTo(".tier-card", 
    { opacity: 0, y: 40 },
    {
      scrollTrigger: {
        trigger: sectionEl,
        start: "top 75%",
        end: "top 25%",
        scrub: 0.5
      },
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out"
    }
  );
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initChoose = initChoose;