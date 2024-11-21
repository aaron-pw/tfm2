export const tooltip = {
  mounted(el) {
    let isTooltipVisible = false;
    let hideTimeout;

    // Keep track of active tooltip globally
    if (!window._activeTooltip) {
      window._activeTooltip = null;
    }

    const showTooltip = () => {
      if (!el.title || isTooltipVisible) return;

      // Hide any existing tooltip
      if (window._activeTooltip && window._activeTooltip !== el) {
        window._activeTooltip._tooltipHandlers?.hideTooltip();
      }

      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      tooltip.innerHTML = `<span class="tooltip-text">${el.title}</span>`;

      // Clear the native title to prevent default tooltip
      const originalTitle = el.title;
      el.title = '';

      // Position the tooltip
      const rect = el.getBoundingClientRect();
      tooltip.style.top = `${rect.top - 35}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;

      document.body.appendChild(tooltip);
      isTooltipVisible = true;
      window._activeTooltip = el;

      // Store reference to remove later
      el._tooltip = tooltip;
      el._originalTitle = originalTitle;
    };

    const hideTooltip = () => {
      if (!isTooltipVisible) return;

      if (el._tooltip) {
        el._tooltip.remove();
        el._tooltip = null;
        el.title = el._originalTitle;
        isTooltipVisible = false;
        if (window._activeTooltip === el) {
          window._activeTooltip = null;
        }
      }
    };

    // Touch event handler
    const handleTouch = (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      showTooltip();

      // Auto-hide after 2 seconds
      hideTimeout = setTimeout(() => {
        hideTooltip();
      }, 1000);
    };

    // Mouse event handlers with pointer-events
    const handleMouseEnter = () => {
      if (!isTooltipVisible) {
        showTooltip();
      }
    };

    const handleMouseLeave = (e) => {
      // Check if we're not moving to the tooltip itself
      if (!e.relatedTarget?.closest('.custom-tooltip')) {
        hideTooltip();
      }
    };

    // Add event listeners
    el.addEventListener('touchstart', handleTouch);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    // Global touch handler to close tooltip when touching outside
    const handleGlobalTouch = (e) => {
      if (isTooltipVisible && !el.contains(e.target) && !el._tooltip?.contains(e.target)) {
        hideTooltip();
      }
    };

    document.addEventListener('touchstart', handleGlobalTouch);

    // Store event handlers for cleanup
    el._tooltipHandlers = {
      touch: handleTouch,
      mouseEnter: handleMouseEnter,
      mouseLeave: handleMouseLeave,
      globalTouch: handleGlobalTouch,
      hideTooltip,
    };
  },

  unmounted(el) {
    // Clean up all event listeners
    if (el._tooltipHandlers) {
      el.removeEventListener('touchstart', el._tooltipHandlers.touch);
      el.removeEventListener('mouseenter', el._tooltipHandlers.mouseEnter);
      el.removeEventListener('mouseleave', el._tooltipHandlers.mouseLeave);
      document.removeEventListener('touchstart', el._tooltipHandlers.globalTouch);
    }

    // Remove tooltip if it exists
    if (el._tooltip) {
      el._tooltip.remove();
    }

    // Clear active tooltip reference if it's this element
    if (window._activeTooltip === el) {
      window._activeTooltip = null;
    }
  },
};
