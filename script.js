// Hero background slideshow logic
document.addEventListener('DOMContentLoaded', function() {
	var slides = document.querySelectorAll('.hero-bg-slide');
	if (!slides.length) return;
	var current = 0;
	setInterval(function() {
		slides[current].style.opacity = 0;
		current = (current + 1) % slides.length;
		slides[current].style.opacity = 1;
	}, 5000);
});

// Replace auto-slideshow with manual arrows
function startReviewsCarousel() {
  const reviewList = document.querySelector('.review-list');
  if (!reviewList) return;

  const cards = Array.from(reviewList.children).filter(el => el.classList.contains('review-card'));
  if (!cards.length) return;

  // Enable carousel mode (shows one card at a time)
  reviewList.classList.add('is-carousel');

  let current = cards.findIndex(c => c.classList.contains('active'));
  if (current < 0) current = 0;

  function showReview(idx) {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    current = idx;
  }
  function nextReview() {
    showReview((current + 1) % cards.length);
  }
  function prevReview() {
    showReview((current - 1 + cards.length) % cards.length);
  }

  // Init
  showReview(current);

  // Wire arrows
  const prevBtn = document.querySelector('.reviews-prev');
  const nextBtn = document.querySelector('.reviews-next');
  if (prevBtn) prevBtn.addEventListener('click', prevReview);
  if (nextBtn) nextBtn.addEventListener('click', nextReview);

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevReview();
    if (e.key === 'ArrowRight') nextReview();
  });

  // Basic swipe support
  let startX = 0;
  reviewList.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
  reviewList.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) dx < 0 ? nextReview() : prevReview();
  }, { passive: true });
}

// Remove old auto-rotation call and start manual carousel
window.addEventListener('DOMContentLoaded', () => {
  startReviewsCarousel();
});

// Get A Quote Popup Modal Logic
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(function() {
		var modal = document.getElementById('quote-modal');
		if (modal) modal.classList.add('show');
	}, 6000);

	var closeBtn = document.getElementById('quote-modal-close');
	if (closeBtn) {
		closeBtn.onclick = function() {
			var modal = document.getElementById('quote-modal');
			if (modal) modal.classList.remove('show');
		};
	}

	var form = document.getElementById('quote-modal-form');
	if (form) {
		form.onsubmit = function(e) {
			e.preventDefault();
			var modal = document.getElementById('quote-modal');
			if (modal) modal.classList.remove('show');
			alert('Thank you! We will contact you soon.');
		};
	}
});
// Hamburger menu event listener and navbar scroll effect
document.addEventListener('DOMContentLoaded', function() {
	// Hamburger menu toggle
	var navToggle = document.querySelector(".nav-toggle");
	var navLinks = document.querySelector(".nav-links");
	if (navToggle && navLinks) {
		navToggle.addEventListener("click", function() {
			navToggle.classList.toggle("open");
			navLinks.classList.toggle("open");
		});
		navLinks.querySelectorAll('a').forEach(function(link) {
			link.addEventListener('click', function() {
				navToggle.classList.remove('open');
				navLinks.classList.remove('open');
			});
		});
	}

	// Navbar transparency on scroll
	var navbar = document.querySelector('.navbar');
	function handleNavbarBg() {
		if (window.scrollY > 40) {
			navbar.classList.add('scrolled');
		} else {
			navbar.classList.remove('scrolled');
		}
	}
	window.addEventListener('scroll', handleNavbarBg);
	handleNavbarBg();
});

// Dynamic slideshow for projects section
function startProjectSlideshow() {
	const track = document.querySelector('.carousel-track');
	if (!track) return;
	const cards = Array.from(track.children);
	let current = 0;
	function showSlide(idx) {
		cards.forEach((card, i) => {
			card.style.display = i === idx ? 'block' : 'none';
			card.classList.toggle('active', i === idx);
		});
	}
	function nextSlide() {
		current = (current + 1) % cards.length;
		showSlide(current);
	}
	function prevSlide() {
		current = (current - 1 + cards.length) % cards.length;
		showSlide(current);
	}
	// Auto-advance only, no navigation buttons
	let interval = setInterval(nextSlide, 3500);
	showSlide(current);

	// Swipe gesture support
	let startX = null;
       track.addEventListener('touchstart', (e) => {
	       if (e.touches.length === 1) {
		       startX = e.touches[0].clientX;
	       }
       }, { passive: true });
       track.addEventListener('touchmove', (e) => {
	       if (!startX) return;
	       let diffX = e.touches[0].clientX - startX;
	       if (Math.abs(diffX) > 50) {
		       if (diffX > 0) {
			       prevSlide();
		       } else {
			       nextSlide();
		       }
		       startX = null;
		       clearInterval(interval);
		       interval = setInterval(nextSlide, 3500);
	       }
       }, { passive: true });
       track.addEventListener('touchend', () => {
	       startX = null;
       }, { passive: true });
}

window.addEventListener('DOMContentLoaded', () => {
	startProjectSlideshow();
});

// Card 3D hover effect
function add3DCardEffect(selector) {
	const cards = document.querySelectorAll(selector);
	cards.forEach(card => {
		card.addEventListener('mousemove', (e) => {
			const rect = card.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const rotateX = ((y - centerY) / centerY) * 10;
			const rotateY = ((x - centerX) / centerX) * 10;
			card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
		});
		card.addEventListener('mouseleave', () => {
			card.style.transform = '';
		});
	});
}

window.addEventListener('DOMContentLoaded', () => {
	add3DCardEffect('.service-card');
	add3DCardEffect('.project-card');
	add3DCardEffect('.review-card');
});

// Hero text slideshow logic
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.hero-slide-text');
  const dots = document.querySelectorAll('.hero-dot');
  let current = 0;
  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
      if (dots[i]) dots[i].classList.toggle('active', i === idx);
    });
    current = idx;
  }
  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => showSlide(i));
  });
  setInterval(nextSlide, 4200); // Change every 4.2s
  showSlide(0);
});

// 3D Particles Background Effect
document.addEventListener('DOMContentLoaded', function() {
  // 3D Particles using Three.js
  const container = document.getElementById('particles-bg');
  if (!container) return;
  container.style.position = 'absolute';
  container.style.top = 0;
  container.style.left = 0;
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = 0;
  container.style.pointerEvents = 'none';

  // Set parent to relative for proper overlay
  const heroHeader = document.querySelector('header.hero');
  if (heroHeader) heroHeader.style.position = 'relative';

  // Responsive particle settings
  function getParticleSettings() {
    if (window.innerWidth <= 700) {
      return {
        count: 90,
        spreadX: 110,
        spreadY: 60,
        spreadZ: 90,
        size: 2.2
      };
    }
    return {
      count: 160,
      spreadX: 180,
      spreadY: 80,
      spreadZ: 120,
      size: 3.5
    };
  }

  let scene, camera, renderer, particles, geometry, material;

  function createParticles() {
    const settings = getParticleSettings();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 120;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    for (let i = 0; i < settings.count; i++) {
      positions.push(
        (Math.random() - 0.5) * settings.spreadX,
        (Math.random() - 0.5) * settings.spreadY,
        (Math.random() - 0.5) * settings.spreadZ
      );
      colors.push(0.01 + Math.random() * 0.99, 0.8, 1); // blue-cyan
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
      size: settings.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  createParticles();

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
    renderer.render(scene, camera);
  }
  animate();

  // Responsive resize
  window.addEventListener('resize', () => {
    createParticles();
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
});

// Newsletter form handling
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  const emailInput = document.getElementById('newsletter-email');
  const msg = form.querySelector('.form-msg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = (emailInput.value || '').trim();
    const valid = /^\S+@\S+\.\S+$/.test(email);
    if (!valid) {
      msg.textContent = 'Please enter a valid email address.';
      msg.classList.remove('success');
      msg.classList.add('error');
      return;
    }
    msg.textContent = 'Thanks for subscribing! Please check your inbox.';
    msg.classList.remove('error');
    msg.classList.add('success');
    form.reset();
  });
});

// Get A Quote Popup Modal Logic
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('quote-modal');
  const closeBtn = document.getElementById('quote-modal-close');
  const form = document.getElementById('quote-modal-form');
  let lastTrigger = null;

  if (!modal) return;

  function openQuoteModal(triggerEl = null) {
    lastTrigger = triggerEl;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    const firstField = document.getElementById('q-name');
    if (firstField) setTimeout(() => firstField.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closeQuoteModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
    sessionStorage.setItem('quoteModalDismissed', '1');
  }

  // Auto open after 7 seconds (once per session)
  if (!sessionStorage.getItem('quoteModalShown')) {
    setTimeout(() => {
      if (!sessionStorage.getItem('quoteModalDismissed')) {
        openQuoteModal();
        sessionStorage.setItem('quoteModalShown', '1');
      }
    }, 7000);
  }

  // Open via buttons with class .get-quote-btn
  document.querySelectorAll('.get-quote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuoteModal(e.currentTarget);
    });
  });

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeQuoteModal);
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-quote-close]')) closeQuoteModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeQuoteModal();
  });

  // Simple form validation + message
  if (form) {
    const msg = form.querySelector('.quote-msg');
    form.addEventListener('submit', (e) => {
      const name = (document.getElementById('q-name').value || '').trim();
      const email = (document.getElementById('q-email').value || '').trim();
      const agree = document.getElementById('q-agree').checked;
      const emailOk = /^\S+@\S+\.\S+$/.test(email);
      if (!name || !emailOk || !agree) {
        e.preventDefault();
        if (msg) {
          msg.textContent = 'Please complete all required fields with a valid email.';
          msg.classList.remove('success');
          msg.classList.add('error');
        }
        return;
      }
      if (msg) {
        msg.textContent = 'Sending…';
        msg.classList.remove('error');
        msg.classList.add('success');
      }
    });
  }
});

// Dynamic review carousel with auto-slide and arrows
function startReviewAutoCarousel() {
  const cards = Array.from(document.querySelectorAll('.review-carousel .review-card'));
  if (!cards.length) return;
  let current = 0;
  let timer = null;

  function show(idx) {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    current = idx;
  }
  function next() {
    show((current + 1) % cards.length);
    resetTimer();
  }
  function prev() {
    show((current - 1 + cards.length) % cards.length);
    resetTimer();
  }
  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => show((current + 1) % cards.length), 10000);
  }

  // Arrow events
  document.querySelector('.reviews-next')?.addEventListener('click', next);
  document.querySelector('.reviews-prev')?.addEventListener('click', prev);

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe support
  const carousel = document.querySelector('.review-carousel');
  let startX = 0;
  carousel?.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  carousel?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
  }, { passive: true });

  show(0);
  resetTimer();
}

window.addEventListener('DOMContentLoaded', startReviewAutoCarousel);

// Remove or comment out ScrollReveal for review-card or reviews section
 ScrollReveal().reveal('.review-card', {
   interval: 120,
   distance: '30px',
   origin: 'bottom',
   duration: 800,
   easing: 'ease-in-out',
  reset: false
});

// Learn More button logic for featured projects
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.learn-more-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const desc = btn.nextElementSibling;
      if (!desc) return;
      // Hide all other descriptions
      document.querySelectorAll('.project-desc').forEach(function(d) {
        if (d !== desc) d.style.display = 'none';
      });
      // Toggle this one
      desc.style.display = (desc.style.display === 'block') ? 'none' : 'block';
    });
  });
});

