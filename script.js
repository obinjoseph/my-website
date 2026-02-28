/* ============================================================
   Portfolio — JavaScript
   ============================================================ */

/* ----------------------------------------------------------
   Animated Background
   ---------------------------------------------------------- */
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
  ctx.shadowBlur = this.r * 2;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
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
  this.color = "rgba(255,255,255," + this.a + ")";
  this.linkColor = "rgba(255,255,255," + this.a / 4 + ")";
  this.dir = Math.floor(Math.random() * 140) + 200;
}

Dot.prototype.draw = function () {
  ctx.fillStyle = this.color;
  ctx.shadowBlur = this.r * 2;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
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
  ctx.moveTo(previousDot1.x, previousDot1.y);
  ctx.beginPath();
  ctx.lineTo(this.x, this.y);
  if (previousDot2 !== false) ctx.lineTo(previousDot2.x, previousDot2.y);
  if (previousDot3 !== false) ctx.lineTo(previousDot3.x, previousDot3.y);
  ctx.stroke();
  ctx.closePath();
};

Dot.prototype.move = function () {
  this.a -= this.aReduction;
  if (this.a <= 0) {
    this.die();
    return;
  }
  this.color = "rgba(255,255,255," + this.a + ")";
  this.linkColor = "rgba(255,255,255," + this.a / 4 + ")";
  this.x = this.x + Math.cos(degToRad(this.dir)) * (this.speed + bgParams.dotsSpeed / 100);
  this.y = this.y + Math.sin(degToRad(this.dir)) * (this.speed + bgParams.dotsSpeed / 100);
  this.draw();
  this.link();
};

Dot.prototype.die = function () {
  dots[this.id] = null;
  delete dots[this.id];
};

function getPreviousDot(id, stepback) {
  if (id === 0 || id - stepback < 0) return false;
  if (typeof dots[id - stepback] !== "undefined") return dots[id - stepback];
  return false;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
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
  initStarsPopulation = 1000,
  dots = [],
  dotsMinDist = 1,
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
}

function initBackground() {
  ctx.strokeStyle = "white";
  ctx.shadowColor = "white";
  for (var i = 0; i < initStarsPopulation; i++) {
    stars[i] = new Star(
      i,
      Math.floor(Math.random() * WIDTH),
      Math.floor(Math.random() * HEIGHT)
    );
  }
  ctx.shadowBlur = 0;
  animateBackground();
}

function animateBackground() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (var i in stars) {
    stars[i].move();
  }
  for (var i in dots) {
    dots[i].move();
  }
  drawIfMouseMoving();
  requestAnimationFrame(animateBackground);
}

function drawIfMouseMoving() {
  if (!mouseMoving) return;

  // Reset dots array if all dots have died (sparse array with no live entries)
  var hasDots = false;
  for (var k in dots) {
    if (dots[k]) { hasDots = true; break; }
  }
  if (!hasDots) {
    dots = [];
  }

  if (dots.length === 0) {
    dots[0] = new Dot(0, mouseX, mouseY);
    dots[0].draw();
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
  dots[dots.length] = new Dot(dots.length, mouseX + xVariation, mouseY + yVariation);
  dots[dots.length - 1].draw();
  dots[dots.length - 1].link();
}

// Allow mouse interaction on canvas
canvas.style.pointerEvents = "auto";

window.addEventListener("mousemove", function (e) {
  mouseMoving = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
  clearTimeout(mouseMoveChecker);
  mouseMoveChecker = setTimeout(function () {
    mouseMoving = false;
  }, 100);
});

window.addEventListener("resize", function () {
  setCanvasSize();
  stars = [];
  for (var i = 0; i < initStarsPopulation; i++) {
    stars[i] = new Star(
      i,
      Math.floor(Math.random() * WIDTH),
      Math.floor(Math.random() * HEIGHT)
    );
  }
});

setCanvasSize();
initBackground();

/* ----------------------------------------------------------
   Portfolio UI Logic
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     Dynamic Years of Experience
     ---------------------------------------------------------- */
  var yearsEl = document.getElementById("yearsExperience");
  if (yearsEl) {
    var startDate = new Date(2018, 10, 1); // November 2018 (month is 0-indexed)
    var now = new Date();
    var diffYears = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 365.25));
    yearsEl.textContent = diffYears;
  }

  /* ----------------------------------------------------------
     Construction Banner
     ---------------------------------------------------------- */
  var banner = document.getElementById("constructionBanner");
  var closeBanner = document.getElementById("closeBanner");
  var navbar = document.getElementById("navbar");

  closeBanner.addEventListener("click", function () {
    banner.classList.add("hidden");
    navbar.classList.add("banner-hidden");
  });

  /* ----------------------------------------------------------
     Navbar scroll effect
     ---------------------------------------------------------- */
  window.addEventListener("scroll", function () {
    var currentScroll = window.scrollY;
    navbar.classList.toggle("scrolled", currentScroll > 50);
  });

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

  function updateActiveLink() {
    var scrollPos = window.scrollY + 200;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute("id");

      var link = document.querySelector('.nav-links a[href="#' + id + '"]');
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink();

  /* ----------------------------------------------------------
     Reveal on scroll (Intersection Observer)
     ---------------------------------------------------------- */
  var revealElements = document.querySelectorAll(".reveal");

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add("visible");
          }, index * 100);
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

  contactForm.addEventListener("submit", function () {
    var submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span>Sending...</span>' +
      '<svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="30 60" /></svg>';

    setTimeout(function () {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<span>Send Message</span>' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';

      toast.classList.add("show");
      setTimeout(function () {
        toast.classList.remove("show");
      }, 4000);
    }, 1500);
  });
});
