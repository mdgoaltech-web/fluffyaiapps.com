/* Fluffy AI Apps — site behaviour. No dependencies. */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header state ---------- */
  var header = document.querySelector('[data-header]');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      header.classList.add('is-scrolled');
    } else {
      menu.classList.remove('is-open');
      menu.hidden = true;
      document.body.style.overflow = '';
      onScroll();
    }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll('.nav-list a[data-nav]');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Hero: orbit + phone tilt ---------- */
  var stage = document.querySelector('[data-stage]');
  var pills = stage ? Array.prototype.slice.call(stage.querySelectorAll('.pill')) : [];
  var phoneBody = stage ? stage.querySelector('.phone-body') : null;
  pills.forEach(function (p) { p.style.setProperty('--h', p.getAttribute('data-h') || '260'); });

  if (stage && pills.length) {
    var rx = 0, ry = 0;
    var measure = function () {
      var cs = getComputedStyle(stage);
      var probe = stage.querySelector('.orbit-ring');
      rx = probe.offsetWidth / 2;
      ry = probe.offsetHeight / 2;
      if (!rx) { rx = parseFloat(cs.getPropertyValue('--rx')) || 300; ry = 80; }
    };
    measure();
    window.addEventListener('resize', measure);

    var angle = -Math.PI / 2;
    var speed = 0.00011; // radians per ms
    var last = 0;
    var visible = true;
    var n = pills.length;

    var place = function () {
      for (var i = 0; i < n; i++) {
        var a = angle + (i / n) * Math.PI * 2;
        var x = Math.cos(a) * rx;
        var y = Math.sin(a) * ry;
        var depth = (Math.sin(a) + 1) / 2;           // 0 = back, 1 = front
        var s = 0.78 + depth * 0.32;
        var p = pills[i];
        p.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
        p.style.opacity = (0.5 + depth * 0.5).toFixed(3);
        p.style.zIndex = depth > 0.5 ? '10' : '1';
      }
    };

    var tick = function (t) {
      if (!visible) { last = 0; return; }
      if (last) angle += (t - last) * speed;
      last = t;
      place();
      requestAnimationFrame(tick);
    };

    place();
    if (!reduceMotion.matches && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var was = visible;
        visible = entries[0].isIntersecting;
        if (visible && !was) requestAnimationFrame(tick);
      }).observe(stage);
      requestAnimationFrame(tick);
    }

    // Gentle pointer tilt on devices that can hover
    if (phoneBody && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion.matches) {
      var hero = document.querySelector('.hero');
      hero.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        phoneBody.style.setProperty('--ty', (dx * 22 - 4).toFixed(2) + 'deg');
        phoneBody.style.setProperty('--tx', (-dy * 14 + 6).toFixed(2) + 'deg');
      });
      hero.addEventListener('pointerleave', function () {
        phoneBody.style.removeProperty('--ty');
        phoneBody.style.removeProperty('--tx');
      });
    }
  }

  /* ---------- Approach: progress + current principle ---------- */
  var principlesEl = document.querySelector('[data-principles]');
  var progress = document.querySelector('[data-progress]');
  if (principlesEl) {
    var items = principlesEl.querySelectorAll('.principle');
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = principlesEl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.55 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      if (progress) progress.style.setProperty('--p', p.toFixed(3));
      var mid = vh * 0.5;
      items.forEach(function (it) {
        var b = it.getBoundingClientRect();
        it.classList.toggle('is-current', b.top < mid && b.bottom > mid);
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var success = document.querySelector('[data-success]');
  var statusEl = form.querySelector('[data-status]');
  var submitBtn = form.querySelector('[data-submit]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var countEl = form.querySelector('[data-count]');
  var message = form.elements.message;
  var startedAt = Date.now();
  var lastSent = 0;
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

  var clean = function (v) {
    // trim, collapse control characters, keep line breaks
    return String(v || '').replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  };

  var rules = {
    name: function (v) {
      if (!v) return 'Please tell us your name.';
      if (v.length < 2) return 'That name looks a little short.';
      if (/https?:\/\/|www\./i.test(v)) return 'Please enter just your name.';
      return '';
    },
    email: function (v) {
      if (!v) return 'We need an email address to reply to.';
      if (!EMAIL_RE.test(v) || v.length > 120) return 'Please enter a valid email address, like name@company.com.';
      return '';
    },
    message: function (v) {
      if (!v) return 'Please add a short message.';
      if (v.length < 20) return 'A little more detail helps — at least 20 characters.';
      if (v.length > 3000) return 'Please keep it under 3,000 characters.';
      var links = (v.match(/https?:\/\//gi) || []).length;
      if (links > 3) return 'Please include no more than three links.';
      return '';
    },
    consent: function (_, el) {
      return el.checked ? '' : 'Please confirm we may use your details to reply.';
    }
  };

  var setError = function (name, msg) {
    var el = form.elements[name];
    var box = form.querySelector('[data-error-for="' + name + '"]');
    var wrap = name === 'consent' ? el.closest('.consent') : el.closest('.field');
    if (box) box.textContent = msg;
    if (wrap) wrap.classList.toggle('has-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  var validateField = function (name) {
    var el = form.elements[name];
    var msg = rules[name](clean(el.value), el);
    setError(name, msg);
    return !msg;
  };

  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    var evt = el.type === 'checkbox' ? 'change' : 'blur';
    el.addEventListener(evt, function () {
      if (el.type === 'checkbox' || clean(el.value) || el.getAttribute('aria-invalid') === 'true') validateField(name);
    });
    if (el.type !== 'checkbox') {
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(name);
      });
    }
  });

  var updateCount = function () {
    if (countEl) countEl.textContent = message.value.length.toLocaleString('en-US') + ' / 3,000';
  };
  message.addEventListener('input', updateCount);
  updateCount();

  var setStatus = function (msg, isError) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-error', !!isError);
  };

  var busy = function (on) {
    submitBtn.disabled = on;
    submitLabel.textContent = on ? 'Sending…' : 'Send message';
  };

  var showSuccess = function (viaEmail) {
    form.hidden = true;
    success.hidden = false;
    success.querySelector('[data-success-title]').textContent = viaEmail
      ? 'Almost there — your email app is open.'
      : 'Thank you — message received.';
    success.querySelector('[data-success-body]').textContent = viaEmail
      ? 'We pre-filled a message to ' + form.getAttribute('data-email') + '. Just press send in your email app.'
      : 'We’ll get back to you at the address you gave us.';
    success.focus();
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('');

    var ok = true, firstBad = null;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name)) { ok = false; if (!firstBad) firstBad = form.elements[name]; }
    });
    if (!ok) {
      setStatus('Please check the highlighted fields.', true);
      firstBad.focus();
      return;
    }

    // Quiet bot checks: honeypot filled, or submitted impossibly fast — pretend success.
    if (clean(form.elements.website.value) || Date.now() - startedAt < 2500) {
      showSuccess(false);
      return;
    }
    // Simple client-side throttle
    if (Date.now() - lastSent < 30000) {
      setStatus('You just sent a message — please wait a moment before sending another.', true);
      return;
    }

    var topics = Array.prototype.filter.call(form.querySelectorAll('input[name="topics"]'), function (c) { return c.checked; })
      .map(function (c) { return c.value; });
    var data = {
      name: clean(form.elements.name.value).slice(0, 80),
      email: clean(form.elements.email.value).slice(0, 120),
      company: clean(form.elements.company.value).slice(0, 100),
      topics: topics.join(', '),
      message: clean(form.elements.message.value).slice(0, 3000)
    };

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();

    if (!endpoint) {
      // No form backend configured: hand off to the visitor's email app.
      var to = form.getAttribute('data-email');
      var subject = 'Project inquiry from ' + data.name + (data.company ? ' (' + data.company + ')' : '');
      var lines = [data.message, '', '—', 'Name: ' + data.name, 'Email: ' + data.email];
      if (data.company) lines.push('Company: ' + data.company);
      if (data.topics) lines.push('Interested in: ' + data.topics);
      var body = lines.join('\n');
      lastSent = Date.now();
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      showSuccess(true);
      return;
    }

    if (!/^https:\/\/formspree\.io\//.test(endpoint)) {
      setStatus('This form is not configured correctly. Please email us directly.', true);
      return;
    }

    busy(true);
    var controller = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ _subject: 'Project inquiry — fluffyaiapps.com' }, data)),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      busy(false);
      if (res.ok) { lastSent = Date.now(); showSuccess(false); return; }
      setStatus('Something went wrong sending your message. Please try again, or email ' + form.getAttribute('data-email') + '.', true);
    }).catch(function () {
      clearTimeout(timer);
      busy(false);
      setStatus('We couldn’t reach the server. Check your connection, or email ' + form.getAttribute('data-email') + '.', true);
    });
  });

  var resetBtn = document.querySelector('[data-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      Object.keys(rules).forEach(function (n) { setError(n, ''); });
      updateCount();
      setStatus('');
      success.hidden = true;
      form.hidden = false;
      startedAt = Date.now();
      form.elements.name.focus();
    });
  }
})();
