// ===== ENHANCED PORTFOLIO JAVASCRIPT =====

// ===== GLOBAL VARIABLES =====
let isScrolling = false;
let currentTheme = localStorage.getItem('theme') || 'light';
let animationObserver;
let skillsAnimated = false;

// ===== UTILITY FUNCTIONS =====
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// ===== THEME MANAGEMENT =====
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    this.applyTheme(currentTheme);
    this.bindEvents();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      const moonIcon = themeToggle.querySelector('.fa-moon');
      const sunIcon = themeToggle.querySelector('.fa-sun');
      
      if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      }
    }
  }

  toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  bindEvents() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// ===== NAVIGATION MANAGEMENT =====
class NavigationManager {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.burger = document.querySelector('.burger');
    this.navLinks = document.querySelector('.nav-links');
    this.navItems = document.querySelectorAll('.nav-links a');
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    // Burger menu toggle
    if (this.burger) {
      this.burger.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking nav links
    this.navItems.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });

    // Handle scroll for navbar styling
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.navbar.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNav(e));
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.burger.classList.toggle('active');
    this.navLinks.classList.toggle('nav-active');
    this.burger.setAttribute('aria-expanded', this.isMenuOpen);

    // Animate nav links
    this.navItems.forEach((link, index) => {
      if (this.isMenuOpen) {
        link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
      } else {
        link.style.animation = '';
      }
    });

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  handleScroll() {
    const scrollY = window.scrollY;
    
    // Add/remove scrolled class for navbar styling
    if (scrollY > 100) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    this.updateActiveNavLink();
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        // Remove active class from all nav links
        this.navItems.forEach(link => link.classList.remove('active'));
        // Add active class to current nav link
        if (navLink) {
          navLink.classList.add('active');
        }
      }
    });
  }

  handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  handleKeyboardNav(e) {
    if (e.key === 'Escape' && this.isMenuOpen) {
      this.toggleMobileMenu();
    }
  }
}

// ===== ANIMATION MANAGER =====
class AnimationManager {
  constructor() {
    this.init();
  }

  init() {
    this.initAOS();
    this.initCounters();
    this.initSkillBars();
    this.initTypingEffect();
  }

  initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
      });
    }
  }

  initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  initSkillBars() {
    const skillBars = document.querySelectorAll('.progress[data-progress]');
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !skillsAnimated) {
          this.animateSkillBar(entry.target);
        }
      });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
      skillObserver.observe(bar);
    });
  }

  animateSkillBar(element) {
    const progress = element.getAttribute('data-progress');
    setTimeout(() => {
      element.style.width = progress + '%';
    }, 200);
    skillsAnimated = true;
  }

  initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
      const text = typingElement.textContent;
      typingElement.textContent = '';
      typingElement.style.borderRight = '3px solid white';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          typingElement.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 100);
        } else {
          // Remove cursor after typing is complete
          setTimeout(() => {
            typingElement.style.borderRight = 'none';
          }, 1000);
        }
      };
      
      // Start typing after a delay
      setTimeout(typeWriter, 1000);
    }
  }
}

// ===== FILTER MANAGER =====
class FilterManager {
  constructor() {
    this.init();
  }

  init() {
    this.initSkillsFilter();
    this.initProjectsFilter();
  }

  initSkillsFilter() {
    const filterButtons = document.querySelectorAll('.skills-filter .filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter skill cards
        skillCards.forEach(card => {
          if (filter === 'all' || card.classList.contains(filter)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  initProjectsFilter() {
    const filterButtons = document.querySelectorAll('.projects-filter .filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter project cards
        projectCards.forEach(card => {
          if (filter === 'all' || card.classList.contains(filter)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}

// ===== MODAL MANAGER =====
class ModalManager {
  constructor() {
    this.modal = document.getElementById('project-modal');
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Project preview buttons
    document.querySelectorAll('.project-preview').forEach(button => {
      button.addEventListener('click', (e) => {
        const projectCard = e.target.closest('.project-card');
        this.openProjectModal(projectCard);
      });
    });

    // Close modal events
    if (this.modal) {
      const closeBtn = this.modal.querySelector('.modal-close');
      const overlay = this.modal.querySelector('.modal-overlay');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }
      
      if (overlay) {
        overlay.addEventListener('click', () => this.closeModal());
      }
      
      // Close modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('active')) {
          this.closeModal();
        }
      });
    }
  }

  openProjectModal(projectCard) {
    if (!this.modal || !projectCard) return;

    const title = projectCard.querySelector('h3').textContent;
    const description = projectCard.querySelector('p').textContent;
    const techStack = Array.from(projectCard.querySelectorAll('.tech-tag')).map(tag => tag.textContent);
    const image = projectCard.querySelector('img').src;
    const githubLink = projectCard.querySelector('.project-github').href;

    // Populate modal content
    this.modal.querySelector('#modal-title').textContent = 'Project Details';
    this.modal.querySelector('#modal-project-title').textContent = title;
    this.modal.querySelector('#modal-project-description').textContent = description;
    this.modal.querySelector('#modal-project-image').src = image;
    this.modal.querySelector('#modal-project-image').alt = title;
    this.modal.querySelector('#modal-github-link').href = githubLink;

    // Populate tech stack
    const techStackContainer = this.modal.querySelector('#modal-tech-stack');
    techStackContainer.innerHTML = '';
    techStack.forEach(tech => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = tech;
      techStackContainer.appendChild(span);
    });

    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    this.modal.querySelector('.modal-close').focus();
  }

  closeModal() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ===== FORM MANAGER =====
class FormManager {
  constructor() {
    this.form = document.querySelector('.contact-form');
    this.init();
  }

  init() {
    if (this.form) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    this.clearError(field);

    // Validation rules
    switch (fieldName) {
      case 'name':
        if (!value) {
          errorMessage = 'Name is required';
          isValid = false;
        } else if (value.length < 2) {
          errorMessage = 'Name must be at least 2 characters';
          isValid = false;
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errorMessage = 'Email is required';
          isValid = false;
        } else if (!emailRegex.test(value)) {
          errorMessage = 'Please enter a valid email address';
          isValid = false;
        }
        break;
      
      case 'subject':
        if (!value) {
          errorMessage = 'Subject is required';
          isValid = false;
        }
        break;
      
      case 'message':
        if (!value) {
          errorMessage = 'Message is required';
          isValid = false;
        } else if (value.length < 10) {
          errorMessage = 'Message must be at least 10 characters';
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      this.showError(field, errorMessage);
    }

    return isValid;
  }

  showError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  clearError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const submitButton = this.form.querySelector('.form-submit');
    
    // Validate all fields
    const inputs = this.form.querySelectorAll('.form-input, .form-textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
      // Simulate form submission (replace with actual endpoint)
      await this.simulateFormSubmission(formData);
      
      // Show success state
      submitButton.classList.remove('loading');
      submitButton.classList.add('success');
      
      // Reset form after delay
      setTimeout(() => {
        this.form.reset();
        submitButton.classList.remove('success');
        submitButton.disabled = false;
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      submitButton.classList.remove('loading');
      submitButton.disabled = false;
      alert('There was an error sending your message. Please try again.');
    }
  }

  async simulateFormSubmission(formData) {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form submitted:', Object.fromEntries(formData));
        resolve();
      }, 2000);
    });
  }
}

// ===== SCROLL MANAGER =====
class ScrollManager {
  constructor() {
    this.init();
  }

  init() {
    this.initBackToTop();
    this.initScrollIndicator();
    this.handleParallax();
  }

  initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 300) {
          backToTopBtn.style.opacity = '1';
          backToTopBtn.style.visibility = 'visible';
        } else {
          backToTopBtn.style.opacity = '0';
          backToTopBtn.style.visibility = 'hidden';
        }
      }, 100));

      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          scrollIndicator.style.opacity = '0';
        } else {
          scrollIndicator.style.opacity = '1';
        }
      });
    }
  }

  handleParallax() {
    const parallaxElements = document.querySelectorAll('.floating-shapes .shape');
    
    window.addEventListener('scroll', throttle(() => {
      const scrolled = window.scrollY;
      const rate = scrolled * -0.5;
      
      parallaxElements.forEach((element, index) => {
        const speed = (index + 1) * 0.1;
        element.style.transform = `translateY(${rate * speed}px)`;
      });
    }, 16));
  }
}

// ===== PERFORMANCE MANAGER =====
class PerformanceManager {
  constructor() {
    this.init();
  }

  init() {
    this.lazyLoadImages();
    this.preloadCriticalResources();
    this.optimizeAnimations();
  }

  lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  preloadCriticalResources() {
    // Preload critical images
    const criticalImages = [
      './profile.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  optimizeAnimations() {
    // Reduce animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-normal', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
    }
  }
}

// ===== ACCESSIBILITY MANAGER =====
class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.handleKeyboardNavigation();
    this.manageFocus();
    this.announcePageChanges();
  }

  handleKeyboardNavigation() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector('#main-content');
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      });
    }

    // Tab navigation for interactive elements
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  manageFocus() {
    // Focus management for modals and dynamic content
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
      const modal = document.querySelector('.modal.active');
      if (modal && e.key === 'Tab') {
        const focusableContent = modal.querySelectorAll(focusableElements);
        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  announcePageChanges() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
  }

  announce(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  const themeManager = new ThemeManager();
  const navigationManager = new NavigationManager();
  const animationManager = new AnimationManager();
  const filterManager = new FilterManager();
  const modalManager = new ModalManager();
  const formManager = new FormManager();
  const scrollManager = new ScrollManager();
  const performanceManager = new PerformanceManager();
  const accessibilityManager = new AccessibilityManager();

  // Global error handling
  window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
  });

  // Service worker registration for PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // Console welcome message
  console.log('%c🚀 Portfolio Website Loaded Successfully!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
  console.log('%cDeveloped by Rakesh Raushan', 'color: #8b5cf6; font-size: 14px;');
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    NavigationManager,
    AnimationManager,
    FilterManager,
    ModalManager,
    FormManager,
    ScrollManager,
    PerformanceManager,
    AccessibilityManager
  };
}

