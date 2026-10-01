export function initFooter(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  const fromName = content.fromName;
  const name = content.name;
  const disclaimer = content.footerDisclaimer || `This entire site is a fictional creative project. ${name} is very real.`;

  sectionEl.innerHTML = `
    <div class="container" style="max-width: 600px;">
      <p class="footer-text">Built by ${fromName}, with love.</p>
      <button class="btn btn-secondary" id="copy-url-btn" style="margin: var(--space-lg) 0;" aria-label="Copy page URL">
        Copy URL
      </button>
      <p class="footer-disclaimer">${disclaimer}</p>
    </div>
  `;

  const copyBtn = document.getElementById("copy-url-btn");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      copyBtn.style.background = "var(--pink)";
      copyBtn.style.color = "var(--ink)";
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = "";
        copyBtn.style.color = "";
      }, 2000);
    } catch (err) {
      copyBtn.textContent = "Failed";
      setTimeout(() => {
        copyBtn.textContent = "Copy URL";
      }, 2000);
    }
  });
}

window.initFooter = initFooter;