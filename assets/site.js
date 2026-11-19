
(function () {
  "use strict";
  var doc = document.documentElement;
  var C = window.MYBENCH || {};
  var reduce = doc.classList.contains("reduce");
  var motion = doc.classList.contains("motion");

  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function effectiveTheme() {
    var t = doc.getAttribute("data-theme");
    return t || (mq && mq.matches ? "dark" : "light");
  }
  function labelToggle(btn) {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", "Switch to " + next + " theme");
    btn.title = "Switch to " + next + " theme";
  }
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    labelToggle(btn);
    btn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";

      var sys = mq && mq.matches ? "dark" : "light";
      if (next === sys) { doc.removeAttribute("data-theme"); try { localStorage.removeItem("mb-theme"); } catch (e) {} }
      else { doc.setAttribute("data-theme", next); try { localStorage.setItem("mb-theme", next); } catch (e) {} }
      labelToggle(btn);
    });
  });

  function detectOS() {
    var ua = navigator.userAgent || "";
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    if (/Android|iPhone|iPad|iPod|CrOS/i.test(ua)) return "other";
    if (/Mac/i.test(p) && navigator.maxTouchPoints > 1) return "other";
    if (/Win/i.test(p) || /Windows/i.test(ua)) return "win";
    if (/Mac/i.test(p) || /Mac OS X/i.test(ua)) return "mac";
    if (/Linux|X11/i.test(p) || /Linux|X11/i.test(ua)) return "linux";
    return "other";
  }
  var OS_NAME = { mac: "macOS", win: "Windows", linux: "Linux" };
  var os = detectOS();
  function url(key) {
    var f = C.files && C.files[key];
    if (!f) return C.repo + "/releases/tag/" + C.tag;
    return C.repo + "/releases/download/" + C.tag + "/" + f.file;
  }
  var root = document.body.getAttribute("data-root") || "";

  document.querySelectorAll("[data-dl]").forEach(function (a) {
    var label = a.querySelector("[data-dl-label]");
    if (OS_NAME[os] && C.primary) {
      a.href = url(C.primary[os]);
      a.setAttribute("download", "");
      if (label) label.textContent = "Download for " + OS_NAME[os];
    } else {
      a.href = root + "download/";
      if (label) label.textContent = "Download";
    }
  });
  document.querySelectorAll("[data-dl-file]").forEach(function (el) {
    var f = OS_NAME[os] && C.files[C.primary[os]];
    if (f) el.textContent = f.file; else el.hidden = true;
  });
  document.querySelectorAll("[data-pkg]").forEach(function (a) {
    var key = a.getAttribute("data-pkg");
    a.href = url(key);
    a.setAttribute("download", "");
    var fn = a.querySelector(".fname");
    if (fn && C.files[key]) fn.textContent = C.files[key].file;
  });
  document.querySelectorAll("[data-os-card]").forEach(function (card) {
    if (card.getAttribute("data-os-card") === os) {
      var you = card.querySelector(".you"); if (you) you.hidden = false;
      card.parentNode.insertBefore(card, card.parentNode.firstElementChild);
    }
  });
  if (!OS_NAME[os]) document.querySelectorAll("[data-other-os]").forEach(function (el) { el.hidden = false; });

  var canCopy = navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext;
  if (!OS_NAME[os] && (navigator.share || canCopy)) document.querySelectorAll("[data-share]").forEach(function (a) {
    var b = document.createElement("button");
    b.type = "button"; b.className = a.className;
    var label = document.createElement("span"); label.setAttribute("aria-live", "polite");
    label.textContent = "Send to my laptop"; b.appendChild(label);
    var link = (C.site || location.origin) + "/";
    function copy() {
      if (!canCopy) return;
      navigator.clipboard.writeText(link).then(function () {
        label.textContent = "Link copied";
        setTimeout(function () { label.textContent = "Send to my laptop"; }, 2000);
      }, function () {});
    }
    b.addEventListener("click", function () {
      if (navigator.share) navigator.share({ title: "mybench", text: "Bench instruments for the NI myDAQ.", url: link })
        .catch(function (e) { if (!e || e.name !== "AbortError") copy(); });
      else copy();
    });
    a.parentNode.replaceChild(b, a);
  });
  document.querySelectorAll("[data-release]").forEach(function (el) {
    var what = el.getAttribute("data-release");
    if (what === "version") el.textContent = C.version;
    if (what === "notes") el.href = C.repo + "/releases/tag/" + C.tag;
  });
  document.querySelectorAll("[data-repo]").forEach(function (a) {
    a.href = C.repo + (a.getAttribute("data-repo") || "");
  });

  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-active", on);
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
        if (j === null) return;
        e.preventDefault();
        select(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
  });

  var EASE_IN = "cubic-bezier(0.11, 0, 0.5, 0)";
  var EASE_OUT = "cubic-bezier(0.5, 1, 0.89, 1)";

  function sweep(path, at, dur, ease) {
    path.setAttribute("pathLength", "1");
    path.style.strokeDasharray = "1 2";
    path.animate(
      [{ strokeDashoffset: 1, visibility: "visible" }, { strokeDashoffset: 0, visibility: "visible" }],
      { duration: dur, delay: at, easing: ease, fill: "forwards" }
    );
  }

  function drawMark(svg, at) {
    var s1 = svg.querySelector('[class$="-stroke-1"]');
    var s2 = svg.querySelector('[class$="-stroke-2"]');
    if (s1) sweep(s1, at, 420, EASE_IN);
    if (s2) sweep(s2, at + 420, 320, EASE_OUT);
  }

  function drawLockup(svg, at) {
    drawMark(svg, at);
    svg.querySelectorAll(".letter").forEach(function (l, i) { l.style.transitionDelay = (at + 450 + i * 25) + "ms"; });
    svg.querySelectorAll(".wordmark-product path").forEach(function (l, i) { l.style.transitionDelay = (at + 750 + i * 25) + "ms"; });
    requestAnimationFrame(function () { svg.classList.add("drawn"); });
  }

  function drawPaths(svg, at) {
    var t = at;
    svg.querySelectorAll("[data-sweep]").forEach(function (p) {
      var d = parseFloat(p.getAttribute("data-sweep")) || 400;
      var ease = p.getAttribute("data-ease") === "in" ? EASE_IN : p.getAttribute("data-ease") === "out" ? EASE_OUT : "cubic-bezier(0.45, 0, 0.55, 1)";
      var start = p.hasAttribute("data-with-prev") ? t - d : t;
      sweep(p, start, d, ease);
      t = Math.max(t, start + d);
    });
    svg.querySelectorAll("[data-after]").forEach(function (el) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: t - 100, easing: EASE_OUT, fill: "both" });
    });
    svg.classList.add("drawn");
  }

  function draw(svg, at) {
    if (svg.querySelector(".letter")) drawLockup(svg, at);
    else if (svg.querySelector('[class$="-stroke-1"]')) { drawMark(svg, at); svg.classList.add("drawn"); }
    else drawPaths(svg, at);
  }

  if (motion && "animate" in Element.prototype) {

    var hero = document.querySelector(".hero, .web-hero, .nf");
    if (hero) {
      var screen = hero.querySelector(".screen");
      requestAnimationFrame(function () {
        if (screen) screen.classList.add("on");
        var lock = hero.querySelector("svg[data-draw]");
        if (lock) draw(lock, 150);
        hero.classList.add("play");
      });
    }

    var screens = document.querySelectorAll(".screen");
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        if (el.classList.contains("screen")) { el.classList.add("on"); return; }
        if (el.hasAttribute("data-draw")) { draw(el, 200); return; }
        el.classList.add("in");
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }) : null;
    var targets = [].slice.call(document.querySelectorAll("[data-reveal], svg[data-draw]")).concat([].slice.call(screens));
    targets.forEach(function (el) {
      if (hero && hero.contains(el)) return;
      if (io) io.observe(el);
      else { el.classList.add("in"); el.classList.add("on"); }
    });
  }
})();
