// Modern Hero Slideshow Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize hero slideshow
  initHeroSlideshow();
  
  // Initialize promo banner slideshow
  initPromoSlideshow();

  // Project card flip logic
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Only flip if clicking the card or the learn more button
      if (e.target.classList.contains('learn-more-btn') || e.currentTarget === e.target) {
        card.classList.toggle('flipped');
      }
    });
  });
  
  // Add mouse movement effect to floating text
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    heroSlider.addEventListener('mousemove', function(e) {
      const activeSlide = document.querySelector('.hero-slide.active');
      if (!activeSlide) return;
      
      const floatingTexts = activeSlide.querySelectorAll('.hero-floating-text');
      
      floatingTexts.forEach(text => {
        const rect = heroSlider.getBoundingClientRect();
        const x = e.clientX - rect.left; // mouse position within the hero
        const y = e.clientY - rect.top;
        
        // Calculate position relative to center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate movement based on mouse position (subtle effect)
        const moveX = (x - centerX) / 40;
        const moveY = (y - centerY) / 40;
        
        // Apply different effect based on alignment
        const direction = text.classList.contains('right-aligned') ? -1 : 1;
        
        // Apply the transform - make sure text is visible
        text.style.opacity = '1';
        text.style.transform = `translateX(${moveX * direction}px) translateY(${moveY}px) rotate(${direction * (5 + moveX * 0.02)}deg)`;
      });
    });
  }
  
  // Hero parallax effect
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    window.addEventListener('scroll', function() {
      const scrolled = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      
      if (scrolled <= heroHeight) {
        const parallaxOverlays = document.querySelectorAll('.hero-parallax-overlay');
        parallaxOverlays.forEach(overlay => {
          overlay.style.transform = `translateY(${scrolled * 0.25}px)`;
        });
        
        const heroContent = document.querySelector('.hero-content-wrapper');
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
        
        // Parallax effect for floating text
        const activeSlide = document.querySelector('.hero-slide.active');
        if (activeSlide) {
          const floatingTexts = activeSlide.querySelectorAll('.hero-floating-text');
          floatingTexts.forEach(text => {
            const direction = text.classList.contains('right-aligned') ? -1 : 1;
            text.style.opacity = '1'; // Ensure visibility
            text.style.transform = `translateX(${scrolled * 0.05 * direction}px) rotate(${direction * (5 - scrolled * 0.01)}deg)`;
          });
        }
      }
    });
  }
  
  // Smooth scroll for hero scroll indicator
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', function() {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
    });
  }
});

// Setup hero slider functionality
function setupHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevArrow = document.querySelector('.hero-arrow.prev');
  const nextArrow = document.querySelector('.hero-arrow.next');
  
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  let isAnimating = false;
  const animationDuration = 1200; // ms, should match CSS transition time
  
  function goToSlide(index) {
    if (isAnimating || index === currentSlide) return;
    isAnimating = true;
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Don't reset floating text animations - just preserve them
    const currentFloatingTexts = slides[currentSlide].querySelectorAll('.hero-floating-text');
    currentFloatingTexts.forEach(text => {
      // Allow CSS animations to handle the transitions
      text.style.opacity = '1';
    });
    
    // Hide current slide
    slides[currentSlide].classList.remove('active');
    
    // Show new slide
    slides[index].classList.add('active');
    
    // Update current index
    currentSlide = index;
    
    // Reset animation flag after animation completes
    setTimeout(() => {
      isAnimating = false;
    }, animationDuration);
  }
  
  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }
  
  function prevSlide() {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }
  
  // Initialize controls
  if (prevArrow) prevArrow.addEventListener('click', prevSlide);
  if (nextArrow) nextArrow.addEventListener('click', nextSlide);
  
  // Initialize dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  
  // Auto-rotation (optional)
  let autoRotate = setInterval(nextSlide, 8000);
  
  // Pause auto-rotation on hover
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    heroSlider.addEventListener('mouseenter', () => {
      clearInterval(autoRotate);
    });
    
    heroSlider.addEventListener('mouseleave', () => {
      autoRotate = setInterval(nextSlide, 8000);
    });
  }
}

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

// Initialize all carousels and sliders
window.addEventListener('DOMContentLoaded', () => {
  setupHeroSlider();
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

// Project Actions Functions
function viewProject(projectId) {
  // Project details data
  const projectDetails = {
    ecommerce: {
      title: "Modern Shopping Platform",
      description: "A cutting-edge e-commerce platform featuring 3D product visualization, seamless checkout experience, and AI-powered recommendations.",
      technologies: ["React", "Three.js", "Node.js", "MongoDB", "Stripe"],
      features: [
        "3D Product Visualization",
        "AI-Powered Recommendations",
        "Real-time Inventory Management",
        "Advanced Analytics Dashboard",
        "Mobile-First Design",
        "Secure Payment Processing"
      ],
      metrics: {
        "Conversion Rate": "300% increase",
        "Load Time": "50ms average",
        "User Engagement": "45% increase",
        "Revenue Growth": "250% increase"
      }
    },
    fitness: {
      title: "Dynamic Fitness Hub",
      description: "Interactive fitness center platform with real-time class scheduling, trainer booking system, and personalized workout tracking.",
      technologies: ["Vue.js", "Express", "MongoDB", "Socket.io", "PWA"],
      features: [
        "Real-time Class Scheduling",
        "Trainer Booking System",
        "Workout Progress Tracking",
        "Social Community Features",
        "Nutrition Planning",
        "Mobile App Integration"
      ],
      metrics: {
        "User Retention": "85% monthly",
        "Active Users": "1000+ members",
        "Class Bookings": "500% increase",
        "User Satisfaction": "4.8/5 rating"
      }
    },
    enterprise: {
      title: "Enterprise Dashboard",
      description: "Comprehensive business management platform with advanced analytics, real-time reporting, and automated workflows.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Docker"],
      features: [
        "Advanced Analytics",
        "Real-time Reporting",
        "Automated Workflows",
        "Team Collaboration Tools",
        "Data Visualization",
        "API Integration Hub"
      ],
      metrics: {
        "Efficiency Gain": "40% improvement",
        "Uptime": "99.9% availability",
        "Cost Reduction": "35% savings",
        "User Adoption": "95% team adoption"
      }
    }
  };

  const project = projectDetails[projectId];
  if (!project) return;

  // Create and show project modal
  showProjectModal(project);
}

function openLiveDemo(demoUrl) {
  // Add loading animation
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = 'Opening Demo...';
  button.style.opacity = '0.7';
  
  // Open demo in new tab
  setTimeout(() => {
    window.open(demoUrl, '_blank');
    button.textContent = originalText;
    button.style.opacity = '1';
  }, 500);
}

function showProjectModal(project) {
  // Create modal HTML
  const modalHTML = `
    <div id="project-modal" class="project-modal">
      <div class="project-modal-content">
        <div class="project-modal-header">
          <h2>${project.title}</h2>
          <span class="project-modal-close" onclick="closeProjectModal()">&times;</span>
        </div>
        <div class="project-modal-body">
          <div class="project-description">
            <p>${project.description}</p>
          </div>
          
          <div class="project-section">
            <h3>Technologies Used</h3>
            <div class="tech-stack">
              ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
            </div>
          </div>
          
          <div class="project-section">
            <h3>Key Features</h3>
            <ul class="features-list">
              ${project.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="project-section">
            <h3>Project Metrics</h3>
            <div class="metrics-grid">
              ${Object.entries(project.metrics).map(([key, value]) => `
                <div class="metric-item">
                  <div class="metric-label">${key}</div>
                  <div class="metric-value">${value}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="project-modal-actions">
            <button class="btn-primary" onclick="openQuoteModal()">Start Similar Project</button>
            <button class="btn-secondary" onclick="closeProjectModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('project-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal with animation
  const modal = document.getElementById('project-modal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('project-modal');
  if (modal && event.target === modal) {
    closeProjectModal();
  }
});

// Hero Slider and Collection Functionality
document.addEventListener('DOMContentLoaded', function() {
    initHeroSlider();
    initCollectionFilters();
});

// Enhanced Hero Slider Functionality
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-arrow.prev');
    const nextBtn = document.querySelector('.hero-arrow.next');
    const slider = document.querySelector('.hero-slider');
    
    if(!slides.length) return;
    
    let currentSlide = 0;
    let slideInterval = setInterval(nextSlide, 6000);
    let isAnimating = false;
    
    // Touch/swipe variables
    let startX = 0;
    let endX = 0;
    let startY = 0;
    let endY = 0;
    
    // Initialize the first slide
    slides[0].classList.add('active');
    if(dots.length > 0) dots[0].classList.add('active');
    
    // Enhanced slide transition with smooth animations
    function nextSlide() {
        if(isAnimating) return;
        goToSlide((currentSlide + 1) % slides.length);
    }
    
    function prevSlide() {
        if(isAnimating) return;
        goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
    }
    
    // Enhanced slide transition
    function goToSlide(n) {
        if(isAnimating || n === currentSlide) return;
        
        isAnimating = true;
        
        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('active');
        if(dots.length > 0) dots[currentSlide].classList.remove('active');
        
        // Add transition effect
        slides[currentSlide].style.transform = 'translateX(-100%)';
        slides[currentSlide].style.opacity = '0';
        
        // Set new current slide
        currentSlide = n;
        
        // Prepare new slide
        slides[currentSlide].style.transform = 'translateX(100%)';
        slides[currentSlide].style.opacity = '0';
        slides[currentSlide].classList.add('active');
        if(dots.length > 0) dots[currentSlide].classList.add('active');
        
        // Animate new slide in
        setTimeout(() => {
            slides[currentSlide].style.transform = 'translateX(0)';
            slides[currentSlide].style.opacity = '1';
        }, 50);
        
        // Reset previous slide
        setTimeout(() => {
            slides.forEach((slide, index) => {
                if(index !== currentSlide) {
                    slide.style.transform = '';
                    slide.style.opacity = '';
                }
            });
            isAnimating = false;
        }, 800);
        
        // Reset the interval timer
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 6000);
    }
    
    // Touch/Swipe functionality
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        clearInterval(slideInterval); // Pause auto-slide during touch
    }
    
    function handleTouchEnd(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        handleSwipe();
        slideInterval = setInterval(nextSlide, 6000); // Resume auto-slide
    }
    
    function handleSwipe() {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        // Check if it's a horizontal swipe (not vertical scroll)
        if(Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if(deltaX > 0) {
                prevSlide(); // Swipe right - previous slide
            } else {
                nextSlide(); // Swipe left - next slide
            }
        }
    }
    
    // Keyboard navigation
    function handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft':
                prevSlide();
                break;
            case 'ArrowRight':
                nextSlide();
                break;
            case ' ': // Spacebar
                e.preventDefault();
                nextSlide();
                break;
        }
    }
    
    // Mouse wheel navigation
    function handleWheel(e) {
        if(Math.abs(e.deltaY) > 50) { // Threshold to prevent accidental triggers
            if(e.deltaY > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
    
    // Event listeners
    if(prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            prevSlide();
        });
    }
    
    if(nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nextSlide();
        });
    }
    
    // Dot navigation with enhanced feedback
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            goToSlide(index);
        });
        
        // Add hover effects
        dot.addEventListener('mouseenter', function() {
            if(index !== currentSlide) {
                this.style.transform = 'scale(1.2)';
            }
        });
        
        dot.addEventListener('mouseleave', function() {
            if(index !== currentSlide) {
                this.style.transform = 'scale(1)';
            }
        });
    });
    
    // Touch events for swipe navigation
    if(slider) {
        slider.addEventListener('touchstart', handleTouchStart, { passive: true });
        slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Keyboard navigation (only when slider is in focus)
    document.addEventListener('keydown', handleKeyPress);
    
    // Pause on hover for better UX
    if(slider) {
        slider.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        slider.addEventListener('mouseleave', function() {
            slideInterval = setInterval(nextSlide, 6000);
        });
    }
    
    // Pause when page is not visible (performance optimization)
    document.addEventListener('visibilitychange', function() {
        if(document.hidden) {
            clearInterval(slideInterval);
        } else {
            slideInterval = setInterval(nextSlide, 6000);
        }
    });
}

// Hero Slideshow Functions
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-nav-btn.prev');
    const nextBtn = document.querySelector('.hero-nav-btn.next');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const heroSection = document.querySelector('.hero');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let isAnimating = false;
    let slideInterval;
    
    // Touch/swipe variables for mobile optimization
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let isSwiping = false;
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Show specific slide
    function showSlide(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        
        // Show new slide
        setTimeout(() => {
            slides[index].classList.add('active');
            currentSlide = index;
            
            // Reset animation flag
            setTimeout(() => {
                isAnimating = false;
            }, 600);
        }, 100);
    }
    
    // Next slide
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    // Previous slide
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    // Touch event handlers for mobile optimization
    function handleTouchStart(e) {
        if (e.touches.length > 1) return; // Multi-touch ignored
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
        
        // Pause auto-play during touch
        stopAutoplay();
    }
    
    function handleTouchMove(e) {
        if (!isSwiping || e.touches.length > 1) return;
        
        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Prevent default if horizontal swipe is detected
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            e.preventDefault();
        }
    }
    
    function handleTouchEnd(e) {
        if (!isSwiping) return;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = isMobile ? 50 : 80;
        
        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
        
        isSwiping = false;
        
        // Resume auto-play after swipe
        startAutoplay();
    }
    
    // Auto-play functionality
    function startAutoplay() {
        // Longer intervals on mobile to reduce battery usage
        const interval = isMobile ? 8000 : 7000;
        slideInterval = setInterval(nextSlide, interval);
    }
    
    function stopAutoplay() {
        clearInterval(slideInterval);
    }
    
    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // Touch events for mobile
    if (isTouchDevice && heroSection) {
        heroSection.addEventListener('touchstart', handleTouchStart, { passive: false });
        heroSection.addEventListener('touchmove', handleTouchMove, { passive: false });
        heroSection.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Keyboard navigation (desktop only)
    if (!isMobile) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
    }
    
    // Pause on hover (desktop only)
    if (!isTouchDevice && heroSection) {
        heroSection.addEventListener('mouseenter', stopAutoplay);
        heroSection.addEventListener('mouseleave', startAutoplay);
    }
    
    // Scroll indicator click
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Performance optimization: Pause when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });
    
    // Intersection Observer to pause when hero is not visible (mobile optimization)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(heroSection);
    } else {
        // Fallback for older browsers
        startAutoplay();
    }
}

// Promo Banner Slideshow
function initPromoSlideshow() {
    const promoSlides = document.querySelectorAll('.promo-slide');
    
    if (promoSlides.length <= 1) return;
    
    let currentPromo = 0;
    
    function showPromoSlide(index) {
        promoSlides[currentPromo].classList.remove('active');
        promoSlides[index].classList.add('active');
        currentPromo = index;
    }
    
    function nextPromoSlide() {
        const next = (currentPromo + 1) % promoSlides.length;
        showPromoSlide(next);
    }
    
    // Auto-rotate promo slides every 4 seconds
    setInterval(nextPromoSlide, 4000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
