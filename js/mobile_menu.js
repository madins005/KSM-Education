/**
 * RESPONSIVE_ADMIN.JS
 * Mobile Menu & Responsive Functionality for Dashboard Admin
 * KSM EDUCATION
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing responsive menu...');
  
  // Get elements
  const header = document.querySelector('.header-container');
  const nav = document.querySelector('nav');
  const authSection = document.querySelector('.auth-section');
  
  if (!header || !nav) {
    console.error('Required elements not found');
    return;
  }
  
  // Create hamburger menu button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-menu';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('type', 'button');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  
  // Create overlay for mobile menu
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);
  
  // Insert hamburger button before auth section
  if (authSection) {
    header.insertBefore(hamburger, authSection);
  } else {
    header.appendChild(hamburger);
  }
  
  /**
   * Toggle mobile menu
   */
  function toggleMenu() {
    const isActive = hamburger.classList.contains('active');
    
    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  }
  
  /**
   * Open mobile menu
   */
  function openMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    nav.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
  }
  
  /**
   * Close mobile menu
   */
  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    
    // Also close any open dropdowns
    const activeDropdown = document.querySelector('.nav-dropdown.active');
    if (activeDropdown) {
      activeDropdown.classList.remove('active');
    }
  }
  
  // Hamburger click event
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });
  
  // Overlay click event - close menu
  overlay.addEventListener('click', function() {
    closeMenu();
  });
  
  // Handle navigation links - close menu when clicked
  const navLinks = document.querySelectorAll('nav > a');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        // Check if it's an anchor link
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          closeMenu();
        }
      }
    });
  });
  
  // Handle dropdown toggle on mobile
  const dropdownButton = document.querySelector('.nav-link.has-caret');
  const dropdown = document.querySelector('.nav-dropdown');
  
  if (dropdownButton && dropdown) {
    dropdownButton.addEventListener('click', function(e) {
      // Only prevent default and toggle on mobile
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = dropdown.classList.contains('active');
        dropdown.classList.toggle('active');
        
        // Update aria-expanded
        this.setAttribute('aria-expanded', !isActive);
      }
    });
    
    // Close dropdown and menu when clicking dropdown links
    const dropdownLinks = dropdown.querySelectorAll('.dropdown-menu a');
    dropdownLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });
  }
  
  // Close menu when window is resized to desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    }, 250);
  });
  
  // Prevent clicks inside nav from closing menu
  nav.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      const isClickInsideNav = nav.contains(e.target);
      const isClickOnHamburger = hamburger.contains(e.target);
      
      if (!isClickInsideNav && !isClickOnHamburger && nav.classList.contains('active')) {
        closeMenu();
      }
    }
  });
  
  // Handle escape key to close menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeMenu();
    }
  });
  
  // Handle smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or modal trigger
      if (href === '#' || href.includes('Modal') || href.includes('modal')) {
        return;
      }
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMenu();
        
        // Smooth scroll to target
        setTimeout(function() {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      }
    });
  });
  
  // Prevent dropdown from auto-closing on desktop
  if (window.innerWidth > 768) {
    const dropdownBtn = document.querySelector('.nav-dropdown .nav-link.has-caret');
    if (dropdownBtn) {
      dropdownBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = this.closest('.nav-dropdown');
        if (dropdown) {
          dropdown.classList.toggle('open');
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function() {
        const openDropdown = document.querySelector('.nav-dropdown.open');
        if (openDropdown) {
          openDropdown.classList.remove('open');
        }
      });
    }
  }
  
  console.log('Responsive menu initialized successfully');
});