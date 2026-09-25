/* motion-init.js — loads motion-anything JS recipes (magnetic, stagger, glare tracking) */
export default function initMotion() {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;

  // Magnetic buttons
  if (!reduced && !isTouch) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      if (btn._magneticBound) return;
      btn._magneticBound = true;
      var strength = parseFloat(btn.getAttribute('data-magnet-strength')) || 0.3;
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + dx * strength + 'px,' + dy * strength + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }

  // Stagger lists
  var lists = document.querySelectorAll('[data-stagger]');
  if (lists.length) {
    lists.forEach(function (list) {
      var step = parseInt(list.getAttribute('data-stagger-step') || '70', 10);
      [].slice.call(list.children).forEach(function (child, i) {
        child.style.setProperty('--st-delay', (i * step) + 'ms');
      });
    });
    if (reduced) {
      lists.forEach(function (l) { l.classList.add('is-in'); });
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          lists.forEach(function (l) { l.classList.add('is-in'); });
        });
      });
    }
  }

  // Glare hover tracking
  if (!reduced && !isTouch) {
    document.querySelectorAll('.glare-hover').forEach(function (el) {
      if (el._glareBound) return;
      el._glareBound = true;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--glare-x', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--glare-y', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }
}
