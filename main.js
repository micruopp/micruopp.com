// micruopp.com
// @author Mic Ruopp dev@micruopp.com
// Copyright 2022. All rights reserved.

(function() {
  // Markup identifiers
  const SCHEME = 'data-color-scheme';

  function toggleColorScheme() {
    const el = document.documentElement;
    let currScheme = el.getAttribute(SCHEME);

    // Detect OS default
    let defaultScheme = 'dark';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      defaultScheme = 'light';
    }
    
    let colorScheme = 'default';
    switch (currScheme) {
    case 'dark':
      colorScheme = 'light';
      break;
    case 'light':
      colorScheme = 'dark';
      break;
    default:
      colorScheme = defaultScheme === 'dark' ? 'light' : 'dark';
    }

    el.setAttribute(SCHEME, colorScheme);
  }
  
  function handleKeyDown(e) {
    switch (e.key) {
    case 'd':
      toggleColorScheme();
      break;
    default:
    }
  }
 
  function addEventListeners() {
    window.addEventListener('keydown', handleKeyDown);
  }
  
  function main() {
    addEventListeners();
  }

  document.addEventListener('DOMContentLoaded', main);
})();
