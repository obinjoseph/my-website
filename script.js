/* ============================================================
   Portfolio — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     Starfield Background
     ---------------------------------------------------------- */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let constellationLines = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 3000);
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      });
    }
  }

  function buildConstellations() {
    constellationLines = [];
    const connectionDist = 120;
    for (let i = 0; i < stars.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < stars.length; j++) {
        if (connections >= 2) break;
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist && Math.random() > 0.85) {
          constellationLines.push({ a: i, b: j });
          connections++;
        }
      }
    }
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw constellation lines
    constellationLines.forEach((line) => {
      const a = stars[line.a];
      const b = stars[line.b];
      const avgOpacity = (a.opacity + b.opacity) / 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(99, 102, 241, ${avgOpacity * 0.12})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Draw stars
    stars.forEach((star) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const currentOpacity = star.opacity * (0.6 + 0.4 * twinkle);
      const currentRadius = star.radius * (0.85 + 0.15 * twinkle);

      // Glow effect
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, currentRadius * 3
      );
      gradient.addColorStop(0, `rgba(200, 210, 255, ${currentOpacity})`);
      gradient.addColorStop(0.4, `rgba(150, 160, 240, ${currentOpacity * 0.4})`);
      gradient.addColorStop(1, 'rgba(150, 160, 240, 0)');

      ctx.beginPath();
      ctx.arc(star.x, star.y, currentRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(star.x, star.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 235, 255, ${currentOpacity})`;
      ctx.fill();

      // Drift
      star.x += star.vx;
      star.y += star.vy;

      // Wrap around
      if (star.x < -10) star.x = canvas.width + 10;
      if (star.x > canvas.width + 10) star.x = -10;
      if (star.y < -10) star.y = canvas.height + 10;
      if (star.y > canvas.height + 10) star.y = -10;
    });

    animationId = requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  createStars();
  buildConstellations();
  drawStars(0);

  window.addEventListener('resize', () => {
    resizeCanvas();
    createStars();
    buildConstellations();
  });

  /* ----------------------------------------------------------
     Dynamic Years of Experience
     ---------------------------------------------------------- */
  const yearsEl = document.getElementById('yearsExperience');
  if (yearsEl) {
    const startDate = new Date(2018, 10, 1); // November 2018 (month is 0-indexed)
    const now = new Date();
    const diffYears = Math.floor(
      (now - startDate) / (1000 * 60 * 60 * 24 * 365.25)
    );
    yearsEl.textContent = diffYears;
  }

  /* ----------------------------------------------------------
     Construction Banner
     ---------------------------------------------------------- */
  const banner = document.getElementById('constructionBanner');
  const closeBanner = document.getElementById('closeBanner');
  const navbar = document.getElementById('navbar');

  closeBanner.addEventListener('click', () => {
    banner.classList.add('hidden');
    navbar.classList.add('banner-hidden');
  });

  /* ----------------------------------------------------------
     Navbar scroll effect
     ---------------------------------------------------------- */
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    navbar.classList.toggle('scrolled', currentScroll > 50);
    lastScroll = currentScroll;
  });

  /* ----------------------------------------------------------
     Mobile menu toggle
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active')
      ? 'hidden'
      : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ----------------------------------------------------------
     Active nav link on scroll
     ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  /* ----------------------------------------------------------
     Reveal on scroll (Intersection Observer)
     ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------
     Contact Form → Google Forms
     ---------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  contactForm.addEventListener('submit', (e) => {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span>Sending...</span>
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="30 60" /></svg>
    `;

    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      `;

      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }, 1500);
  });

  /* ----------------------------------------------------------
     Smooth parallax on hero shapes
     ---------------------------------------------------------- */
  const shapes = document.querySelectorAll('.shape');

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    shapes.forEach((shape, i) => {
      const speed = (i + 1) * 8;
      shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  });
});
