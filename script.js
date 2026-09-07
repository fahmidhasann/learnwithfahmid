/**
 * Portfolio Site JavaScript
 * Wrapped in IIFE to prevent global scope pollution.
 * Uses strict mode for safer execution.
 */
(function () {
  'use strict';

  /* ==========================================================================
     Utility Functions
     ========================================================================== */

  /**
   * Throttle a function to run at most once per wait period.
   * @param {Function} fn
   * @param {number} wait - milliseconds
   * @returns {Function}
   */
  function throttle(fn, wait) {
    let lastTime = 0;
    return function () {
      var now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, arguments);
      }
    };
  }

  /**
   * Sanitize user input to remove HTML tags and trim whitespace.
   * @param {string} input
   * @returns {string}
   */
  function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '').trim();
  }

  /**
   * Validate an email address format.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    // RFC 5322 simplified regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Calculate scroll target position with nav offset.
   * @param {HTMLElement} targetElement
   * @returns {number}
   */
  function getScrollTargetTop(targetElement) {
    var NAV_OFFSET = 80;
    var top = targetElement.getBoundingClientRect().top + window.scrollY;
    return Math.max(top - NAV_OFFSET, 0);
  }

  /* ==========================================================================
     Theme Functions
     ========================================================================== */

  function initializeTheme() {
    var storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', storedTheme);
      return;
    }
    document.documentElement.setAttribute('data-theme', 'light');
  }

  function setThemeToggleIcon(toggleButton, theme) {
    if (!toggleButton) return;
    var icon = document.createElement('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    icon.setAttribute('aria-hidden', 'true');
    toggleButton.textContent = '';
    toggleButton.appendChild(icon);
    toggleButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggleTheme() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    var toggleButton = document.querySelector('.dark-mode-toggle');
    setThemeToggleIcon(toggleButton, newTheme);
    if (typeof window.Cal !== 'undefined') {
      window.Cal('ui', { theme: newTheme });
    }
  }

  /* ==========================================================================
     Animation & Visual Effects
     ========================================================================== */

  function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { value: 35, density: { enable: true, value_area: 800 } },
          color: { value: '#C4704B' },
          shape: { type: 'circle' },
          opacity: {
            value: 0.45,
            random: true,
            anim: { enable: true, speed: 0.4, opacity_min: 0.15, sync: false }
          },
          size: { value: 2.2, random: true, anim: { enable: false } },
          line_linked: { enable: false },
          move: {
            enable: true,
            speed: 0.4,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'bubble' },
            onclick: { enable: false },
            resize: true
          },
          modes: {
            bubble: { distance: 100, size: 4, duration: 2, opacity: 0.8 }
          }
        },
        retina_detect: true
      });
    }
  }

  function initializeScrollEffects() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.project-card').forEach(function (card, i) {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=50',
            toggleActions: 'play none none reverse'
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.08
        });
      });

      // Scroll activation for timeline process steps
      gsap.utils.toArray('.process-step').forEach(function (step) {
        gsap.to(step, {
          scrollTrigger: {
            trigger: step,
            start: 'top bottom-=100',
            onEnter: function () {
              step.classList.add('active-step');
            },
            onLeaveBack: function () {
              step.classList.remove('active-step');
            }
          }
        });
      });
    } else {
      var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
      };

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            if (entry.target.classList.contains('process-step')) {
              entry.target.classList.add('active-step');
            }
          }
        });
      }, observerOptions);

      document.querySelectorAll('.project-card, .process-step').forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    }
  }

  function updateProgressBar() {
    var progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height <= 0) {
      progressBar.style.width = '0%';
      return;
    }
    var scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  }

  /* ==========================================================================
     Navigation Functions
     ========================================================================== */

  function initializeNavigation() {
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    function setMobileMenuOpen(isOpen) {
      if (!navToggle || !navMenu) return;
      navMenu.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var targetElement = document.querySelector(targetId);
        if (targetElement) {
          requestAnimationFrame(function () {
            window.scrollTo({
              top: getScrollTargetTop(targetElement),
              behavior: 'smooth'
            });
          });
          if (navMenu && navMenu.classList.contains('active')) {
            setMobileMenuOpen(false);
          }
        }
      });
    });

    if (navToggle && navMenu) {
      setMobileMenuOpen(navMenu.classList.contains('active'));

      navToggle.addEventListener('click', function () {
        setMobileMenuOpen(!navMenu.classList.contains('active'));
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          setMobileMenuOpen(false);
          navToggle.focus();
        }
      });
    }
  }

  /* ==========================================================================
     Command Palette Functions
     ========================================================================== */

  function initializeCommandPalette() {
    var commandPalette = document.getElementById('commandPalette');
    var commandInput = document.getElementById('commandInput');
    var commandList = document.getElementById('commandList');
    if (!commandPalette || !commandInput || !commandList) return;

    var commandItems = Array.from(commandList.querySelectorAll('[role="option"]'));
    var lastFocusedElement = null;

    function getVisibleCommands() {
      return commandItems.filter(function (command) {
        return !command.hidden;
      });
    }

    function setActiveCommand(command) {
      commandItems.forEach(function (item) {
        var isActive = item === command;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });
    }

    function resetCommandFilter() {
      commandInput.value = '';
      commandItems.forEach(function (command) {
        command.hidden = false;
      });
      setActiveCommand(null);
    }

    function openCommandPalette() {
      lastFocusedElement = document.activeElement;
      resetCommandFilter();
      commandPalette.classList.add('active');
      commandPalette.setAttribute('aria-hidden', 'false');
      commandInput.focus();
    }

    function closeCommandPalette(restoreFocus) {
      if (restoreFocus === undefined) restoreFocus = true;
      commandPalette.classList.remove('active');
      commandPalette.setAttribute('aria-hidden', 'true');
      setActiveCommand(null);
      if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    function runCommand(action) {
      closeCommandPalette(false);
      executeCommand(action);
    }

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (commandPalette.classList.contains('active')) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
      }
      if (e.key === 'Escape' && commandPalette.classList.contains('active')) {
        closeCommandPalette();
      }
    });

    commandPalette.addEventListener('click', function (e) {
      if (e.target === commandPalette) {
        closeCommandPalette();
      }
    });

    commandList.addEventListener('click', function (e) {
      var command = e.target.closest('li[data-action]');
      if (command && !command.hidden) {
        runCommand(command.getAttribute('data-action'));
      }
    });

    commandInput.addEventListener('keydown', function (e) {
      var activeElement = commandList.querySelector('.active');
      var visibleCommands = getVisibleCommands();
      var activeIndex = visibleCommands.indexOf(activeElement);
      var newActiveElement;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!visibleCommands.length) break;
          newActiveElement = activeIndex >= 0
            ? visibleCommands[(activeIndex + 1) % visibleCommands.length]
            : visibleCommands[0];
          setActiveCommand(newActiveElement);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!visibleCommands.length) break;
          newActiveElement = activeIndex >= 0
            ? visibleCommands[(activeIndex - 1 + visibleCommands.length) % visibleCommands.length]
            : visibleCommands[visibleCommands.length - 1];
          setActiveCommand(newActiveElement);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeElement && !activeElement.hidden) {
            runCommand(activeElement.getAttribute('data-action'));
          } else if (visibleCommands[0]) {
            runCommand(visibleCommands[0].getAttribute('data-action'));
          }
          break;
      }
    });

    commandInput.addEventListener('input', function () {
      var filter = commandInput.value.toLowerCase();
      commandItems.forEach(function (command) {
        var text = command.textContent.toLowerCase();
        command.hidden = !text.includes(filter);
      });
      var activeCmd = commandList.querySelector('.active');
      if (activeCmd && activeCmd.hidden) {
        setActiveCommand(getVisibleCommands()[0] || null);
      }
    });
  }

  function executeCommand(action) {
    var commandPalette = document.getElementById('commandPalette');
    if (commandPalette) {
      commandPalette.classList.remove('active');
      commandPalette.setAttribute('aria-hidden', 'true');
    }
    switch (action) {
      case 'home':
        scrollToSection('hero');
        break;
      case 'process':
        scrollToSection('process');
        break;
      case 'faq':
        scrollToSection('faq');
        break;
      case 'contact':
        scrollToSection('contact');
        break;
      case 'dark-mode':
        toggleTheme();
        break;
    }
  }

  function scrollToSection(sectionId) {
    var targetElement = document.getElementById(sectionId);
    if (targetElement) {
      window.scrollTo({
        top: getScrollTargetTop(targetElement),
        behavior: 'smooth'
      });
    }
  }

  /* ==========================================================================
     Custom Subtitle Slider, FAQ Accordions, and Magnetic Buttons
     ========================================================================== */

  function initializeSubtitleSlider() {
    var slider = document.querySelector('.subtitle-slider');
    if (!slider) return;

    var slides = Array.from(slider.querySelectorAll('.hero-title'));
    if (slides.length <= 1) return;

    var currentIndex = 0;

    setInterval(function () {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');

      var translateY = -currentIndex * (100 / slides.length);
      slider.style.transform = 'translateY(' + translateY + '%)';
    }, 3000);
  }

  function initializeFaqAccordions() {
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      var trigger = item.querySelector('.faq-trigger');
      var panel = item.querySelector('.faq-panel');
      var inner = item.querySelector('.faq-panel-inner');
      if (!trigger || !panel || !inner) return;

      trigger.addEventListener('click', function () {
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        faqItems.forEach(function (otherItem) {
          if (otherItem === item) return;
          var otherTrigger = otherItem.querySelector('.faq-trigger');
          var otherPanel = otherItem.querySelector('.faq-panel');
          if (otherTrigger && otherPanel && otherTrigger.getAttribute('aria-expanded') === 'true') {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherItem.classList.remove('faq-active');
            if (typeof gsap !== 'undefined') {
              gsap.to(otherPanel, { height: 0, duration: 0.35, ease: 'power2.inOut' });
            } else {
              otherPanel.style.height = '0px';
            }
          }
        });

        trigger.setAttribute('aria-expanded', String(!isExpanded));
        item.classList.toggle('faq-active', !isExpanded);

        if (typeof gsap !== 'undefined') {
          gsap.to(panel, {
            height: !isExpanded ? inner.scrollHeight : 0,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          panel.style.height = !isExpanded ? inner.scrollHeight + 'px' : '0px';
        }
      });
    });
  }



  /* ==========================================================================
     UI Components
     ========================================================================== */

  function initializeDarkModeToggle() {
    var toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.classList.add('dark-mode-toggle');
    setThemeToggleIcon(toggleButton, document.documentElement.getAttribute('data-theme'));
    toggleButton.addEventListener('click', toggleTheme);
    document.body.appendChild(toggleButton);
  }

  function initializeNavScroll() {
    var nav = document.querySelector('.compact-nav');
    if (!nav) return;

    window.addEventListener('scroll', throttle(function () {
      if (window.scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, 100));
  }

  /* ==========================================================================
     Contact Form
     ========================================================================== */

  function initializeContactForm() {
    var form = document.getElementById('contactForm');
    var result = document.getElementById('formResult');
    if (!form || !result) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('.contact-submit');
      if (!submitBtn) return;

      var btnText = submitBtn.querySelector('.btn-text');
      var btnIcon = submitBtn.querySelector('.fa-paper-plane');
      var btnLoading = submitBtn.querySelector('.btn-loading');
      if (!btnText || !btnIcon || !btnLoading) return;

      // Sanitize and validate inputs
      var nameField = form.querySelector('#contact-name');
      var emailField = form.querySelector('#contact-email');
      var companyField = form.querySelector('#contact-company');
      var topicField = form.querySelector('#contact-topic');
      var messageField = form.querySelector('#contact-message');

      var nameVal = nameField ? sanitizeInput(nameField.value) : '';
      var emailVal = emailField ? sanitizeInput(emailField.value) : '';
      var companyVal = companyField ? sanitizeInput(companyField.value) : '';
      var topicVal = topicField ? sanitizeInput(topicField.value) : '';
      var messageVal = messageField ? sanitizeInput(messageField.value) : '';

      if (!nameVal || nameVal.length < 2) {
        result.textContent = 'Please enter a valid name (at least 2 characters).';
        result.className = 'form-result error';
        return;
      }
      if (!isValidEmail(emailVal)) {
        result.textContent = 'Please enter a valid email address.';
        result.className = 'form-result error';
        return;
      }
      if (!topicVal) {
        result.textContent = 'Please choose what you need help with.';
        result.className = 'form-result error';
        return;
      }
      if (!messageVal || messageVal.length < 10) {
        result.textContent = 'Please enter a message (at least 10 characters).';
        result.className = 'form-result error';
        return;
      }

      // Update sanitized values back to form
      if (nameField) nameField.value = nameVal;
      if (emailField) emailField.value = emailVal;
      if (companyField) companyField.value = companyVal;
      if (topicField) topicField.value = topicVal;
      if (messageField) messageField.value = messageVal;

      // Loading state
      btnText.style.display = 'none';
      btnIcon.style.display = 'none';
      btnLoading.style.display = 'inline';
      submitBtn.disabled = true;

      try {
        var formData = new FormData(form);
        var response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        var data = await response.json();

        if (data.success) {
          result.textContent = 'Message sent! I\'ll get back to you within 24 hours.';
          result.className = 'form-result success';
          form.reset();
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        result.textContent = 'Failed to send message. Please try emailing me directly.';
        result.className = 'form-result error';
      } finally {
        btnText.style.display = 'inline';
        btnIcon.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;

        setTimeout(function () {
          result.textContent = '';
          result.className = 'form-result';
        }, 5000);
      }
    });
  }

  /* ==========================================================================
     Easter Egg Functions
     ========================================================================== */

  function initializeEasterEgg() {
    var konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    var konamiIndex = 0;

    document.addEventListener('keydown', function (e) {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          activateEasterEgg();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  function activateEasterEgg() {
    document.body.classList.add('konami-activated');
    createConfetti();
    setTimeout(function () {
      document.body.classList.remove('konami-activated');
    }, 5000);
  }

  function createConfetti() {
    var confettiContainer = document.createElement('div');
    confettiContainer.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(confettiContainer);

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < 100; i++) {
      var confetti = document.createElement('div');
      var hue = Math.floor(Math.random() * 360);
      var left = (Math.random() * 100).toFixed(2);
      var opacity = (Math.random() * 0.5 + 0.5).toFixed(2);
      var rotation = Math.floor(Math.random() * 360);
      var duration = (Math.random() * 3 + 2).toFixed(2);
      confetti.style.cssText =
        'position:absolute;width:10px;height:10px;background-color:hsl(' + hue + ',100%,50%);' +
        'top:-10px;left:' + left + '%;opacity:' + opacity + ';transform:rotate(' + rotation + 'deg);' +
        'animation:confetti-fall ' + duration + 's linear forwards;';
      fragment.appendChild(confetti);
    }
    confettiContainer.appendChild(fragment);

    var style = document.createElement('style');
    style.textContent =
      '@keyframes confetti-fall{0%{transform:translateY(0) rotate(0deg);}100%{transform:translateY(100vh) rotate(720deg);}}';
    document.head.appendChild(style);

    setTimeout(function () {
      confettiContainer.remove();
      style.remove();
    }, 5000);
  }

  function initializeCalBooking() {
    if (typeof window.Cal !== 'undefined') {
      var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      window.Cal('ui', {
        theme: currentTheme,
        styles: { branding: { brandColor: '#1B2A4A' } },
        hideEventTypeDetails: false,
        layout: 'month_view'
      });
    }

    var bookingTriggers = document.querySelectorAll('[data-cal-open]');
    bookingTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var calLink = trigger.getAttribute('data-cal-open') || 'fahmid-hasan-taohid-n2y05r/15min';
        if (typeof window.Cal !== 'undefined') {
          var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          window.Cal('ui', {
            theme: currentTheme,
            styles: { branding: { brandColor: '#1B2A4A' } }
          });
          window.Cal('modal', {
            calLink: calLink,
            config: { layout: 'month_view' }
          });
        } else {
          window.open('https://cal.com/' + calLink, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', function () {
    initializeTheme();
    initializeParticles();
    initializeScrollEffects();
    initializeNavigation();
    initializeCommandPalette();
    initializeDarkModeToggle();
    initializeNavScroll();
    initializeContactForm();
    initializeEasterEgg();
    initializeSubtitleSlider();
    initializeFaqAccordions();
    initializeCalBooking();

    window.addEventListener('scroll', throttle(updateProgressBar, 50));
  });
})();
