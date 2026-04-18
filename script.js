/* ============================================================
   Portfolio — JavaScript
   ============================================================ */

var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----------------------------------------------------------
   Animated Background
   ---------------------------------------------------------- */
var TWO_PI = 2 * Math.PI;
var DEG_TO_RAD = Math.PI / 180;

function Star(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = Math.floor(Math.random() * 2) + 1;
  var alpha = (Math.floor(Math.random() * 10) + 1) / 10 / 2;
  this.color = "rgba(255,255,255," + alpha + ")";
}

Star.prototype.draw = function () {
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, TWO_PI, false);
  ctx.closePath();
  ctx.fill();
};

Star.prototype.move = function () {
  this.y -= 0.15 + bgParams.backgroundSpeed / 100;
  if (this.y <= -10) this.y = HEIGHT + 10;
  this.draw();
};

function Dot(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = Math.floor(Math.random() * 5) + 1;
  this.maxLinks = 2;
  this.speed = 0.5;
  this.a = 0.5;
  this.aReduction = 0.005;
  this.color = "rgba(255,255,255,0.5)";
  this.linkColor = "rgba(255,255,255,0.125)";
  var dirRad = (Math.floor(Math.random() * 140) + 200) * DEG_TO_RAD;
  this.dx = Math.cos(dirRad);
  this.dy = Math.sin(dirRad);
}

Dot.prototype.draw = function () {
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, TWO_PI, false);
  ctx.closePath();
  ctx.fill();
};

Dot.prototype.link = function () {
  if (this.id === 0) return;
  var previousDot1 = getPreviousDot(this.id, 1);
  var previousDot2 = getPreviousDot(this.id, 2);
  var previousDot3 = getPreviousDot(this.id, 3);
  if (!previousDot1) return;
  ctx.strokeStyle = this.linkColor;
  ctx.beginPath();
  ctx.moveTo(previousDot1.x, previousDot1.y);
  ctx.lineTo(this.x, this.y);
  if (previousDot2 !== false) ctx.lineTo(previousDot2.x, previousDot2.y);
  if (previousDot3 !== false) ctx.lineTo(previousDot3.x, previousDot3.y);
  ctx.stroke();
};

Dot.prototype.move = function () {
  this.a -= this.aReduction;
  if (this.a <= 0) {
    this.die();
    return;
  }
  this.color = "rgba(255,255,255," + this.a + ")";
  this.linkColor = "rgba(255,255,255," + (this.a * 0.25) + ")";
  var spd = this.speed + bgParams.dotsSpeed / 100;
  this.x += this.dx * spd;
  this.y += this.dy * spd;
  this.draw();
  this.link();
};

Dot.prototype.die = function () {
  activeDotCount--;
  dots[this.id] = null;
};

function getPreviousDot(id, stepback) {
  if (id === 0 || id - stepback < 0) return false;
  var d = dots[id - stepback];
  return d != null ? d : false;
}

var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  WIDTH,
  HEIGHT,
  mouseMoving = false,
  mouseMoveChecker,
  mouseX,
  mouseY,
  stars = [],
  initStarsPopulation = 700,
  dots = [],
  activeDotCount = 0,
  dotsMinDist = 1,
  animationId = null,
  bgParams = {
    maxDistFromCursor: 100,
    dotsSpeed: 0,
    backgroundSpeed: 50,
  };

function setCanvasSize() {
  WIDTH = document.documentElement.clientWidth;
  HEIGHT = document.documentElement.clientHeight;
  canvas.setAttribute("width", WIDTH);
  canvas.setAttribute("height", HEIGHT);
  initStarsPopulation = WIDTH < 768 ? 280 : 700;
}

function initBackground() {
  ctx.strokeStyle = "white";
  for (var i = 0; i < initStarsPopulation; i++) {
    stars[i] = new Star(
      i,
      Math.floor(Math.random() * WIDTH),
      Math.floor(Math.random() * HEIGHT)
    );
  }
  animateBackground();
}

function animateBackground() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (var i = 0, len = stars.length; i < len; i++) {
    stars[i].move();
  }
  for (var i = 0, len = dots.length; i < len; i++) {
    if (dots[i]) dots[i].move();
  }
  drawIfMouseMoving();
  animationId = requestAnimationFrame(animateBackground);
}

function stopBackground() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function drawIfMouseMoving() {
  if (!mouseMoving) return;

  if (activeDotCount === 0) {
    dots = [];
    dots[0] = new Dot(0, mouseX, mouseY);
    dots[0].draw();
    activeDotCount = 1;
    return;
  }

  var previousDot = getPreviousDot(dots.length, 1);
  if (!previousDot) return;
  var prevX = previousDot.x;
  var prevY = previousDot.y;

  var diffX = Math.abs(prevX - mouseX);
  var diffY = Math.abs(prevY - mouseY);

  if (diffX < dotsMinDist || diffY < dotsMinDist) return;

  var xVariation = Math.random() > 0.5 ? -1 : 1;
  xVariation = xVariation * Math.floor(Math.random() * bgParams.maxDistFromCursor) + 1;
  var yVariation = Math.random() > 0.5 ? -1 : 1;
  yVariation = yVariation * Math.floor(Math.random() * bgParams.maxDistFromCursor) + 1;
  var newDot = new Dot(dots.length, mouseX + xVariation, mouseY + yVariation);
  dots[dots.length] = newDot;
  newDot.draw();
  newDot.link();
  activeDotCount++;
}

canvas.style.pointerEvents = "auto";

var pendingMouseMove = false;
window.addEventListener("mousemove", function (e) {
  if (pendingMouseMove) return;
  pendingMouseMove = true;
  requestAnimationFrame(function () {
    mouseMoving = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    clearTimeout(mouseMoveChecker);
    mouseMoveChecker = setTimeout(function () {
      mouseMoving = false;
    }, 100);
    pendingMouseMove = false;
  });
}, { passive: true });

var resizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    setCanvasSize();
    stars = [];
    for (var i = 0; i < initStarsPopulation; i++) {
      stars[i] = new Star(
        i,
        Math.floor(Math.random() * WIDTH),
        Math.floor(Math.random() * HEIGHT)
      );
    }
  }, 150);
});

document.addEventListener("visibilitychange", function () {
  if (prefersReducedMotion) return;
  if (document.hidden) {
    stopBackground();
  } else if (!animationId) {
    animateBackground();
  }
});

setCanvasSize();
if (!prefersReducedMotion) {
  initBackground();
} else {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "white";
  for (var i = 0; i < initStarsPopulation; i++) {
    stars[i] = new Star(
      i,
      Math.floor(Math.random() * WIDTH),
      Math.floor(Math.random() * HEIGHT)
    );
    stars[i].draw();
  }
}

/* ----------------------------------------------------------
   Portfolio UI Logic
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     Dynamic Years of Experience
     ---------------------------------------------------------- */
  var yearsEl = document.getElementById("yearsExperience");
  var yearsElInline = document.getElementById("yearsExperienceInline");
  if (yearsEl || yearsElInline) {
    var startDate = new Date(2018, 10, 1); // November 2018 (month is 0-indexed)
    var now = new Date();
    var diffYears = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 365.25));
    if (yearsEl) yearsEl.textContent = diffYears;
    if (yearsElInline) yearsElInline.textContent = diffYears;
  }

  /* ----------------------------------------------------------
     Navbar scroll effect
     ---------------------------------------------------------- */
  var navbar = document.getElementById("navbar");
  window.addEventListener("scroll", function () {
    var currentScroll = window.scrollY;
    navbar.classList.toggle("scrolled", currentScroll > 50);
  }, { passive: true });

  /* ----------------------------------------------------------
     Mobile menu toggle
     ---------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  navToggle.addEventListener("click", function () {
    navToggle.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navToggle.classList.remove("active");
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  /* ----------------------------------------------------------
     Active nav link on scroll
     ---------------------------------------------------------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinkMap = {};
  sections.forEach(function (section) {
    var id = section.getAttribute("id");
    var link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (link) navLinkMap[id] = link;
  });

  function updateActiveLink() {
    var scrollPos = window.scrollY + 200;

    var sectionData = [];
    sections.forEach(function (section) {
      sectionData.push({
        id: section.getAttribute("id"),
        top: section.offsetTop,
        height: section.offsetHeight
      });
    });

    sectionData.forEach(function (data) {
      var link = navLinkMap[data.id];
      if (link) {
        if (scrollPos >= data.top && scrollPos < data.top + data.height) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      }
    });
  }

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateActiveLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
  updateActiveLink();

  /* ----------------------------------------------------------
     Reveal on scroll (Intersection Observer)
     ---------------------------------------------------------- */
  var revealElements = document.querySelectorAll(".reveal");

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Contact Form → Google Forms
     ---------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var toast = document.getElementById("toast");
  var toastContent = toast.querySelector(".toast-content");
  var toastMessage = toast.querySelector(".toast-message");
  var toastIcon = toast.querySelector(".toast-icon");
  var submitBtn = contactForm.querySelector('button[type="submit"]');
  var hiddenIframe = document.getElementById("hidden_iframe");

  var SPINNER_HTML =
    '<span>Sending...</span>' +
    '<svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="30 60" /></svg>';
  var SEND_HTML =
    '<span>Send Message</span>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';

  var formSubmitted = false;
  var submitTimeout;

  function showToast(success) {
    if (success) {
      toastContent.classList.remove("error");
      toastIcon.innerHTML = '<use href="#icon-check"/>';
      toastMessage.textContent = "Message sent successfully!";
    } else {
      toastContent.classList.add("error");
      toastIcon.innerHTML = '<use href="#icon-external"/>';
      toastMessage.textContent = "Failed to send. Please reach out via LinkedIn.";
    }
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 4000);
  }

  hiddenIframe.addEventListener("load", function () {
    if (!formSubmitted) return;
    clearTimeout(submitTimeout);
    formSubmitted = false;
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = SEND_HTML;
    showToast(true);
  });

  contactForm.addEventListener("submit", function () {
    submitBtn.disabled = true;
    submitBtn.innerHTML = SPINNER_HTML;
    formSubmitted = true;

    submitTimeout = setTimeout(function () {
      if (!formSubmitted) return;
      formSubmitted = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = SEND_HTML;
      showToast(false);
    }, 5000);
  });
});