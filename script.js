// ===== Live tuning dial =====
// Uses the predicted values for our coil: L from Wheeler's formula,
// and the capacitor's range of 20 pF to 280 pF.
(function () {
  var L = 291e-6;            // henries (prediction, ~291 uH)
  var C_MAX = 280e-12;       // slider at 0%   -> 280 pF (lowest frequency)
  var C_MIN = 20e-12;        // slider at 100% -> 20 pF  (highest frequency)
  var F_LOW = 500e3;         // left edge of the dial scale, Hz
  var F_HIGH = 2200e3;       // right edge of the dial scale, Hz

  var slider = document.getElementById('tune');
  var needle = document.getElementById('needle');
  var scale = document.getElementById('scale');
  var freqOut = document.getElementById('freq');
  var capOut = document.getElementById('cap');
  var markTarget = document.getElementById('markTarget');
  var markMhz = document.getElementById('markMhz');
  var Lshow = document.getElementById('Lshow');

  if (!slider) return;
  if (Lshow) Lshow.textContent = Math.round(L * 1e6);

  function pos(f) { return ((f - F_LOW) / (F_HIGH - F_LOW)) * 100; }

  function capFromSlider(v) { return C_MAX - (C_MAX - C_MIN) * (v / 100); }

  function freqFromC(C) { return 1 / (2 * Math.PI * Math.sqrt(L * C)); }

  // Build the printed scale: a tick every 100 kHz, labelled every 500 kHz.
  for (var f = 500e3; f <= 2200e3; f += 100e3) {
    var t = document.createElement('div');
    var big = f % 500e3 === 0;
    t.className = big ? 'tick big' : 'tick';
    t.style.left = pos(f) + '%';
    scale.appendChild(t);
    if (big) {
      var lab = document.createElement('div');
      lab.className = 'tick-label';
      lab.style.left = pos(f) + '%';
      lab.textContent = f / 1000;
      scale.appendChild(lab);
    }
  }

  // Marker for the 819 kHz target from the lab sheet, and for 1 MHz.
  markTarget.style.left = pos(819e3) + '%';
  markMhz.style.left = pos(1000e3) + '%';

  function update() {
    var C = capFromSlider(parseFloat(slider.value));
    var f = freqFromC(C);
    needle.style.left = pos(f) + '%';
    freqOut.textContent = f >= 1e6
      ? (f / 1e6).toFixed(2) + ' MHz'
      : Math.round(f / 1e3) + ' kHz';
    capOut.textContent = Math.round(C * 1e12) + ' pF';
  }

  slider.addEventListener('input', update);
  update();
})();

// ===== Milestone tabs =====
// Each milestone is a <div class="panel" id="milestone-N">. The address bar
// holds the state: #milestone-2 opens that tab, and a section link such as
// #results opens the tab that contains it and scrolls to the section.
(function () {
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  var tabLinks = Array.prototype.slice.call(document.querySelectorAll('.tabs a'));
  if (!panels.length) return;

  function show(panel) {
    panels.forEach(function (p) { p.classList.toggle('active', p === panel); });
    tabLinks.forEach(function (a) {
      if (a.getAttribute('data-tab') === panel.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = id ? document.getElementById(id) : null;
    var panel = target ? target.closest('[data-panel]') : null;
    var isPanel = target && target.hasAttribute('data-panel');

    if (!panel) { panel = panels[0]; target = null; }
    show(panel);

    if (isPanel || !target) {
      var bar = document.getElementById('tabs');
      var top = bar ? bar.getBoundingClientRect().top + window.pageYOffset : 0;
      window.scrollTo(0, Math.max(0, top - 0));
    } else {
      target.scrollIntoView();
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
