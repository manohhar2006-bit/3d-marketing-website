// Sony WH-1000XM6 Hyper-Premium Cinematic Scrollytelling Engine
document.addEventListener('DOMContentLoaded', () => {

  const totalFrames = 240;
  const images = [];
  let loadedCount = 0;
  const framesFolder = '/frames';

  const canvas = document.getElementById('scrolly-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let currentFrameValue = 1;
  let targetFrameValue = 1;
  let scrollProgress = 0;

  // --- IMAGES PRELOADER ---
  function preloadImages() {
    const progressBar = document.getElementById('loader-progress');
    const progressPercentage = document.getElementById('loader-percentage');
    const progressStatus = document.getElementById('loader-status');
    const preloader = document.getElementById('loader');

    const statusLines = [
      "Calibrating multi-channel microphones...",
      "Preloading 8K composite structures...",
      "Compiling dual V3 acoustics algorithms...",
      "Initializing digital sound enrichment engines...",
      "Polishing matte black silhouette lighting..."
    ];

    return new Promise((resolve) => {
      console.log(`[Telemetry] Starting cache preloader for ${totalFrames} frames...`);
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const paddedIndex = String(i).padStart(3, '0');
        img.src = `${framesFolder}/ezgif-frame-${paddedIndex}.jpg`;

        img.onload = () => {
          loadedCount++;
          const progress = loadedCount / totalFrames;
          
          if (progressBar) progressBar.style.width = `${progress * 100}%`;
          if (progressPercentage) progressPercentage.textContent = `${Math.round(progress * 100)}%`;
          if (progressStatus) {
            const idx = Math.min(Math.floor(progress * statusLines.length), statusLines.length - 1);
            progressStatus.textContent = statusLines[idx];
          }

          if (loadedCount === totalFrames) {
            console.log(`[Telemetry] Cached all ${totalFrames} frames successfully.`);
            if (preloader) {
              preloader.classList.add('loaded');
            }
            resolve();
          }
        };

        img.onerror = () => {
          loadedCount++;
          console.error(`[Telemetry] Failed loading frame ${i} at: ${img.src}`);
          if (loadedCount === totalFrames) {
            if (preloader) preloader.classList.add('loaded');
            resolve();
          }
        };

        images.push(img);
      }
    });
  }

  // --- CANVAS RESIZING & RENDERING ---
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    renderFrame(currentFrameValue);
  }

  function renderFrame(frameIndex) {
    if (!canvas || !ctx || images.length === 0) return;
    const imgIndex = Math.max(1, Math.min(Math.round(frameIndex), totalFrames)) - 1;
    const img = images[imgIndex];
    if (!img || !img.complete) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderWidth, renderHeight;
    if (canvasRatio > imgRatio) {
      renderHeight = canvasHeight;
      renderWidth = canvasHeight * imgRatio;
    } else {
      renderWidth = canvasWidth;
      renderHeight = canvasWidth / imgRatio;
    }

    const x = (canvasWidth - renderWidth) / 2;
    const y = (canvasHeight - renderHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, x, y, renderWidth, renderHeight);
  }

  // --- SCROLL CALCULATION ENGINE ---
  const container = document.getElementById('scrollytelling-container');

  function updateScroll() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const totalHeight = container.offsetHeight - window.innerHeight;
    
    // progress runs from 0 (top of section) to 1 (bottom of section)
    let progress = -rect.top / totalHeight;
    progress = Math.max(0, Math.min(progress, 1));
    scrollProgress = progress;
  }

  window.addEventListener('scroll', updateScroll);
  window.addEventListener('resize', resizeCanvas);

  // --- NARRATIVE LAYERS FADING & PARALLAX ---
  const layers = [
    { id: 'layer-hero', start: 0.0, end: 0.15, peakStart: 0.0, peakEnd: 0.10 },
    { id: 'layer-engineering', start: 0.15, end: 0.40, peakStart: 0.20, peakEnd: 0.35 },
    { id: 'layer-isolation', start: 0.40, end: 0.65, peakStart: 0.45, peakEnd: 0.60 },
    { id: 'layer-acoustics', start: 0.65, end: 0.85, peakStart: 0.70, peakEnd: 0.80 },
    { id: 'layer-reassembly', start: 0.85, end: 1.00, peakStart: 0.90, peakEnd: 1.00 }
  ];

  function animateLayers(progress) {
    layers.forEach(layer => {
      const el = document.getElementById(layer.id);
      if (!el) return;

      let opacity = 0;
      let translateY = 30; // hidden below

      if (progress >= layer.start && progress <= layer.end) {
        el.classList.add('active');
        el.classList.remove('exit');

        if (progress >= layer.start && progress < layer.peakStart) {
          const range = layer.peakStart - layer.start;
          const t = (progress - layer.start) / range;
          const ease = t * t * (3 - 2 * t);
          opacity = ease;
          translateY = 30 * (1 - ease);
        } else if (progress >= layer.peakStart && progress <= layer.peakEnd) {
          opacity = 1;
          translateY = 0;
        } else if (progress > layer.peakEnd && progress <= layer.end) {
          const range = layer.end - layer.peakEnd;
          const t = (progress - layer.peakEnd) / range;
          const ease = t * t * (3 - 2 * t);
          opacity = 1 - ease;
          translateY = -30 * ease; // slides up
        }
      } else {
        el.classList.remove('active');
        if (progress > layer.end) {
          el.classList.add('exit');
          opacity = 0;
          translateY = -30;
        } else {
          opacity = 0;
          translateY = 30;
        }
      }

      el.style.opacity = opacity;
      el.style.transform = `translateY(${translateY}px)`;
      
      // Control pointer events for overlays
      if (opacity > 0.05) {
        el.style.pointerEvents = 'auto';
      } else {
        el.style.pointerEvents = 'none';
      }
    });

    // Fade out scroll indicator as scroll begins
    const indicator = document.getElementById('scroll-indicator');
    if (indicator) {
      if (progress > 0.05) {
        indicator.classList.add('hidden');
      } else {
        indicator.classList.remove('hidden');
      }
    }
  }

  // --- MICRO MOUSE PARALLAX & IDLE FLOAT ---
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  const mouseLerpFactor = 0.06;

  let lastMouseMoveTime = Date.now();
  let isIdle = false;
  let idleTime = 0;
  let isMouseOverOverview = false;

  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  const heroLayer = document.getElementById('layer-hero');
  if (heroLayer) {
    heroLayer.addEventListener('mousemove', (e) => {
      if (isMobile) return;
      
      // ONLY active when Overview is active (scrollProgress < 0.15)
      if (scrollProgress >= 0.15) {
        isMouseOverOverview = false;
        return;
      }

      isMouseOverOverview = true;
      lastMouseMoveTime = Date.now();
      isIdle = false;

      const rect = heroLayer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      targetMouseX = (x / rect.width) * 2 - 1; // [-1, 1]
      targetMouseY = (y / rect.height) * 2 - 1; // [-1, 1]
    });

    heroLayer.addEventListener('mouseenter', () => {
      if (scrollProgress < 0.15) {
        isMouseOverOverview = true;
      }
    });

    heroLayer.addEventListener('mouseleave', () => {
      isMouseOverOverview = false;
    });
  }

  // --- TICK RENDER LOOP ---
  const frameLerpFactor = 0.09; // Butter-smooth scroll mapping

  function tick() {
    // 1. Calculate and Lerp frame sequence
    if (scrollProgress < 0.15 && isMouseOverOverview && !isMobile) {
      // Mouse frame mapping: Left = frame 1, Right = frame 240, Center = frame 120
      const normalizedX = (targetMouseX + 1) / 2; // [0, 1]
      targetFrameValue = 1 + normalizedX * (totalFrames - 1);
    } else {
      // Scroll-based mapping
      targetFrameValue = 1 + scrollProgress * (totalFrames - 1);
    }

    const frameDiff = targetFrameValue - currentFrameValue;
    if (Math.abs(frameDiff) > 0.001) {
      currentFrameValue += frameDiff * frameLerpFactor;
    } else {
      currentFrameValue = targetFrameValue;
    }

    renderFrame(currentFrameValue);
    animateLayers(scrollProgress);

    // 2. Mouse Parallax and dynamic float
    if (!isMobile) {
      // Force coordinates back to center if mouse leaves Overview or we are on other sections
      if (!isMouseOverOverview || scrollProgress >= 0.15) {
        targetMouseX = 0;
        targetMouseY = 0;
      }

      const dx = targetMouseX - mouseX;
      const dy = targetMouseY - mouseY;
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        mouseX += dx * mouseLerpFactor;
        mouseY += dy * mouseLerpFactor;
      } else {
        mouseX = targetMouseX;
        mouseY = targetMouseY;
      }

      // Check Idle
      const timeSinceLastMove = Date.now() - lastMouseMoveTime;
      if (timeSinceLastMove > 1500) {
        isIdle = true;
      }

      let idleY = 0;
      let idleRotation = 0;
      if (isIdle && scrollProgress < 0.15) {
        idleTime += 0.015;
        idleY = Math.sin(idleTime) * 10;
        idleRotation = Math.cos(idleTime * 0.8) * 1.2;
      }

      // Apply interaction ONLY inside Overview section
      if (scrollProgress < 0.15) {
        // A. Tilt Canvas in 3D perspective with realistic shadow & light shift
        if (canvas) {
          canvas.style.transform = `translate(-50%, -50%) perspective(800px) rotateX(${-mouseY * 8 + idleRotation}deg) rotateY(${mouseX * 10}deg) translateX(${mouseX * 25}px) translateY(${mouseY * 18 + idleY}px)`;
          
          // Realistic shadow / light shift
          const shadowX = -mouseX * 18;
          const shadowY = -mouseY * 12;
          const shadowBlur = 24 + Math.abs(mouseX) * 8;
          const shadowOpacity = 0.12 + Math.abs(mouseX) * 0.05;
          canvas.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 214, 255, ${shadowOpacity}))`;
        }

        // B. Dynamic Radial Glow counter parallax
        const radialGlow = document.querySelector('.radial-glow');
        if (radialGlow) {
          radialGlow.style.transform = `translate(-50%, -50%) translateX(${mouseX * -35}px) translateY(${mouseY * -25}px) scale(${1 + Math.abs(mouseX) * 0.08})`;
        }
        
        // C. Narrative overlay text micro translations (Overview ONLY)
        if (heroLayer) {
          const content = heroLayer.querySelector('.narrative-content');
          if (content) {
            content.style.transform = `translateX(${mouseX * 15}px) translateY(${mouseY * 10}px) translateZ(30px)`;
          }
        }
        
        // Explicitly reset transforms on all other layers
        layers.forEach(layer => {
          if (layer.id !== 'layer-hero') {
            const el = document.getElementById(layer.id);
            if (el) {
              const content = el.querySelector('.narrative-content');
              if (content) {
                content.style.transform = '';
              }
            }
          }
        });
      } else {
        // Reset transforms outside Overview to keep them completely static and stable
        if (canvas) {
          canvas.style.transform = `translate(-50%, -50%)`;
          canvas.style.filter = '';
        }
        const radialGlow = document.querySelector('.radial-glow');
        if (radialGlow) {
          radialGlow.style.transform = `translate(-50%, -50%)`;
        }
        layers.forEach(layer => {
          const el = document.getElementById(layer.id);
          if (el) {
            const content = el.querySelector('.narrative-content');
            if (content) {
              content.style.transform = '';
            }
          }
        });
      }
    }

    requestAnimationFrame(tick);
  }

  // --- NAVBAR CLICK NAVIGATION ---
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSectionId = link.getAttribute('data-scroll-to');

      if (targetSectionId === 'specs') {
        const specsSection = document.getElementById('specs');
        if (specsSection) {
          specsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (!container) return;
        let percentage = 0.0;
        if (targetSectionId === 'overview') percentage = 0.0;
        else if (targetSectionId === 'technology') percentage = 0.25;
        else if (targetSectionId === 'isolation') percentage = 0.50;
        else if (targetSectionId === 'acoustics') percentage = 0.75;

        const containerScrollTop = container.offsetTop;
        const scrollableHeight = container.offsetHeight - window.innerHeight;
        const targetScroll = containerScrollTop + percentage * scrollableHeight;

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- NAV LINK ACTIVE STATS ON SCROLL ---
  function highlightNavLinks() {
    if (!container) return;
    const scrollTop = window.scrollY;
    const containerTop = container.offsetTop;
    const containerHeight = container.offsetHeight;
    const specsSection = document.getElementById('specs');
    
    // Check if scrolled down to bento specs grid
    if (specsSection) {
      const specsRect = specsSection.getBoundingClientRect();
      if (specsRect.top <= window.innerHeight * 0.4) {
        navLinks.forEach(link => {
          if (link.getAttribute('data-scroll-to') === 'specs') link.classList.add('active');
          else link.classList.remove('active');
        });
        return;
      }
    }

    // Highlight narrative layer link based on container progress
    if (scrollTop >= containerTop && scrollTop < containerTop + containerHeight) {
      const progress = scrollProgress;
      let activeId = 'overview';
      if (progress >= 0.15 && progress < 0.40) activeId = 'technology';
      else if (progress >= 0.40 && progress < 0.65) activeId = 'isolation';
      else if (progress >= 0.65) activeId = 'acoustics';

      navLinks.forEach(link => {
        if (link.getAttribute('data-scroll-to') === activeId) link.classList.add('active');
        else link.classList.remove('active');
      });
    }
  }

  window.addEventListener('scroll', highlightNavLinks);

  // --- TRANSITIONAL STICKY HEADER GLASSMORPHISM ---
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // --- WEB AUDIO SIGNAL SIMULATOR (SPECS WIDGET) ---
  const soundToggle = document.getElementById('sound-toggle');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const simulatorMode = document.getElementById('simulator-mode');
  const hzIndicator = document.getElementById('hz-indicator');
  const waveformCanvas = document.getElementById('waveform-canvas');
  
  if (soundToggle && waveformCanvas) {
    const waveCtx = waveformCanvas.getContext('2d');
    
    let audioCtx = null;
    let rumblingOscillator = null;
    let sweepingOscillator = null;
    let gainNode = null;
    let noiseFilter = null;
    let isAudioActive = false;
    let waveAnimId = null;
    let waveTime = 0;

    function initAudio() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      
      rumblingOscillator = audioCtx.createOscillator();
      rumblingOscillator.type = 'sawtooth';
      rumblingOscillator.frequency.setValueAtTime(65, audioCtx.currentTime);

      noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(180, audioCtx.currentTime);

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);

      rumblingOscillator.connect(noiseFilter);
      noiseFilter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      rumblingOscillator.start();
    }

    function playAmbientHum() {
      if (!audioCtx) initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.4);
      
      noiseFilter.frequency.linearRampToValueAtTime(180, audioCtx.currentTime + 0.4);
    }

    function engageActiveCancellation() {
      if (!audioCtx) return;
      
      sweepingOscillator = audioCtx.createOscillator();
      sweepingOscillator.type = 'sine';
      sweepingOscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      sweepingOscillator.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.6);
      
      const sweepGain = audioCtx.createGain();
      sweepGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      
      sweepingOscillator.connect(sweepGain);
      sweepGain.connect(audioCtx.destination);
      sweepingOscillator.start();
      sweepingOscillator.stop(audioCtx.currentTime + 0.6);

      noiseFilter.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    }

    function stopAudio() {
      if (gainNode) {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.3);
      }
    }

    function drawWaves() {
      const width = waveformCanvas.width = waveformCanvas.parentElement.clientWidth;
      const height = waveformCanvas.height = 48;
      waveCtx.clearRect(0, 0, width, height);

      waveTime += 0.15;
      waveCtx.lineWidth = 1.8;
      
      if (isAudioActive) {
        const hasCancellation = soundToggle.classList.contains('active');
        
        if (!hasCancellation) {
          waveCtx.strokeStyle = 'rgba(0, 214, 255, 0.7)';
          waveCtx.beginPath();
          for (let x = 0; x < width; x++) {
            const rawNoise = Math.sin(x * 0.05 + waveTime) * 8 + 
                             Math.cos(x * 0.1 - waveTime * 1.5) * 4 + 
                             Math.sin(x * 0.02 + waveTime * 0.5) * 6;
            const y = height / 2 + rawNoise;
            if (x === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
          }
          waveCtx.stroke();
          
          waveCtx.strokeStyle = 'rgba(0, 80, 255, 0.4)';
          waveCtx.beginPath();
          for (let x = 0; x < width; x++) {
            const rawNoise = Math.sin(x * 0.07 - waveTime * 0.8) * 6 + 
                             Math.cos(x * 0.03 + waveTime * 1.2) * 5;
            const y = height / 2 + rawNoise;
            if (x === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
          }
          waveCtx.stroke();
        } else {
          waveCtx.strokeStyle = 'rgba(0, 214, 255, 0.2)';
          waveCtx.beginPath();
          for (let x = 0; x < width; x++) {
            const rawNoise = Math.sin(x * 0.04 + waveTime) * 10;
            const y = height / 2 + rawNoise;
            if (x === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
          }
          waveCtx.stroke();

          waveCtx.strokeStyle = 'rgba(255, 80, 80, 0.2)';
          waveCtx.beginPath();
          for (let x = 0; x < width; x++) {
            const rawNoise = -Math.sin(x * 0.04 + waveTime) * 10;
            const y = height / 2 + rawNoise;
            if (x === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
          }
          waveCtx.stroke();

          waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          waveCtx.shadowColor = 'var(--accent-cyan)';
          waveCtx.shadowBlur = 4;
          waveCtx.beginPath();
          for (let x = 0; x < width; x++) {
            const microVibration = (Math.random() - 0.5) * 0.6;
            const y = height / 2 + microVibration;
            if (x === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
          }
          waveCtx.stroke();
          waveCtx.shadowBlur = 0;
        }
      } else {
        waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        waveCtx.beginPath();
        waveCtx.moveTo(0, height / 2);
        waveCtx.lineTo(width, height / 2);
        waveCtx.stroke();
      }

      waveAnimId = requestAnimationFrame(drawWaves);
    }

    soundToggle.addEventListener('click', () => {
      const isEngaged = soundToggle.classList.contains('active');
      
      if (!isAudioActive) {
        isAudioActive = true;
        playAmbientHum();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        simulatorMode.textContent = "STATE: CABIN HUM ACTIVE";
        hzIndicator.textContent = "FREQUENCY: 65 Hz (AMPLITUDE HIGH)";
        soundToggle.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      } else if (isAudioActive && !isEngaged) {
        soundToggle.classList.add('active');
        engageActiveCancellation();
        simulatorMode.textContent = "STATE: ISOLATION ON (ACTIVE CANCEL)";
        hzIndicator.textContent = "DESTRUCTIVE INTERFERENCE ENFORCED";
      } else {
        soundToggle.classList.remove('active');
        isAudioActive = false;
        stopAudio();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        simulatorMode.textContent = "STATE: BYPASS (NOISE LIVE)";
        hzIndicator.textContent = "FREQUENCY: --- Hz";
        soundToggle.style.backgroundColor = '';
      }
    });

    drawWaves();
  }

  // --- BOOT AND PLAY ---
  preloadImages().then(() => {
    resizeCanvas();
    updateScroll();
    tick();
  });

});
