const createTooltip = (el, text) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.innerHTML = `<span class="tooltip-text">${text}</span>`;
  document.body.appendChild(tooltip);
  return tooltip;
};

const positionTooltip = (tooltip, el) => {
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Position above the element
  tooltip.style.left = rect.left + rect.width / 2 + 'px';
  tooltip.style.top = rect.top + scrollTop - 40 + 'px'; // Increased offset for better visibility
};

const showTooltip = (el, text) => {
  if (!el._tooltip) {
    el._tooltip = createTooltip(el, text);
  }
  positionTooltip(el._tooltip, el);
  el._tooltip.style.display = 'flex';
};

const hideTooltip = (el) => {
  if (el._tooltip) {
    el._tooltip.style.display = 'none';
  }
};

let touchTimer = null;

export default {
  mounted(el, binding) {
    const text = binding.value || el.getAttribute('title');
    if (!text) return;

    // Remove title attribute to prevent default tooltip
    el.removeAttribute('title');

    // Handle mouse events for desktop
    el.addEventListener('mouseenter', () => showTooltip(el, text));
    el.addEventListener('mouseleave', () => hideTooltip(el));

    // Handle touch events for mobile/tablet
    el.addEventListener(
      'touchstart',
      (e) => {
        // Prevent default to avoid any unwanted behaviors
        e.preventDefault();
        e.stopPropagation();

        // Clear any existing timer
        if (touchTimer) {
          clearTimeout(touchTimer);
        }

        // Show tooltip immediately
        showTooltip(el, text);

        // Hide after delay
        touchTimer = setTimeout(() => {
          hideTooltip(el);
          touchTimer = null;
        }, 2000); // Show for 2 seconds
      },
      { passive: false }
    );

    // Hide tooltip on scroll or touch move
    document.addEventListener('scroll', () => hideTooltip(el));
    el.addEventListener('touchmove', () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
      hideTooltip(el);
    });
  },

  unmounted(el) {
    // Clean up
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
    if (el._tooltip) {
      el._tooltip.remove();
      delete el._tooltip;
    }
  },
};
