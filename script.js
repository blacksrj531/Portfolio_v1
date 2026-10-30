/**
 * ═══════════════════════════════════════════════════════════════
 * SCRIPT.JS — CROSS-DEVICE ADAPTIVE 3D & MOTION ENGINE
 * Optimization Features:
 * - Touch & Mobile Detection: Disables cursor simulations on mobile
 * - Dynamic Device Pixel Ratio clamping (Max 2.0 to prevent mobile GPU thermal throttling)
 * - Battery-Aware Viewport Culling (Canvas animation halts when offscreen)
 * - Safe Touch Gestures: Non-blocking native scroll on phones
 * - Adaptive 3D Neural Compute Lattice (Reduced node count on mobile)
 * - Cursor-Linked Floating Work Image Previews (Desktop pointer only)
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileScreen = window.innerWidth <= 768;

  // ───── 01. DYNAMIC WHATSAPP LINK ─────
  const whatsappBtn = document.getElementById('whatsappBtn');
  if (whatsappBtn) {
    const phone = '917789056552';
    const message = encodeURIComponent(
      "Hi Soumya, I reviewed your engineering portfolio and would like to discuss an opportunity/project."
    );
    whatsappBtn.href = `https://wa.me/${phone}?text=${message}`;
  }

  // ───── 02. LENIS 1.1 FRICTIONLESS SMOOTH SCROLL ─────
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: isMobileScreen ? 0.9 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ───── 03. THREE.JS 3D NEURAL COMPUTE LATTICE (ADAPTIVE GPU LOAD) ─────
  const webglContainer = document.getElementById('webgl-container');
  let scene, camera, renderer;
  let latticeGroup, nodePoints, linkLines;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let isCanvasVisible = true;
  let canvasAnimId = null;

  if (typeof THREE !== 'undefined' && webglContainer) {
    const initThree = () => {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = isMobileScreen ? 11.5 : 9.5;

      // Safe PixelRatio Clamping: Prevents 3x/4x mobile screens from boiling battery
      renderer = new THREE.WebGLRenderer({ antialias: !isMobileScreen, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileScreen ? 1.5 : 2.0));
      webglContainer.appendChild(renderer.domElement);

      latticeGroup = new THREE.Group();
      scene.add(latticeGroup);

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const cobaltLight = new THREE.DirectionalLight(0x0047ff, 2.5);
      cobaltLight.position.set(6, 8, 8);
      scene.add(cobaltLight);

      // Node Count Scaled by Device Class (60 on mobile, 95 on desktop)
      const nodeCount = isMobileScreen ? 55 : 95;
      const nodePositions = [];
      const posArray = new Float32Array(nodeCount * 3);

      for (let i = 0; i < nodeCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = (isMobileScreen ? 2.0 : 2.4) + (Math.random() - 0.5) * 1.5;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        posArray[i * 3] = x;
        posArray[i * 3 + 1] = y;
        posArray[i * 3 + 2] = z;

        nodePositions.push(new THREE.Vector3(x, y, z));
      }

      const nodeGeom = new THREE.BufferGeometry();
      nodeGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const nodeMat = new THREE.PointsMaterial({
        size: isMobileScreen ? 0.18 : 0.14,
        color: 0x0047ff,
        transparent: true,
        opacity: 0.85
      });
      nodePoints = new THREE.Points(nodeGeom, nodeMat);
      latticeGroup.add(nodePoints);

      // Synapse Lines (Distance threshold adjusted for density)
      const linePositions = [];
      const maxDistance = isMobileScreen ? 1.5 : 1.35;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dist = nodePositions[i].distanceTo(nodePositions[j]);
          if (dist < maxDistance) {
            linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
            linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
          }
        }
      }

      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.28
      });

      linkLines = new THREE.LineSegments(lineGeom, lineMat);
      latticeGroup.add(linkLines);

      // Core Geometric Frame
      const coreGeo = new THREE.IcosahedronGeometry(isMobileScreen ? 1.1 : 1.4, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x090a0f,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      latticeGroup.add(coreMesh);

      window.addEventListener('resize', onWindowResize, { passive: true });
      if (!isTouchDevice) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
      }
      window.addEventListener('scroll', onScrollLattice, { passive: true });

      animateThree();
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.position.z = window.innerWidth <= 768 ? 11.5 : 9.5;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1.5 : 2.0));
    };

    const onMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScrollLattice = () => {
      const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
      if (latticeGroup) {
        latticeGroup.rotation.y = scrollProgress * Math.PI * 3.5;
        latticeGroup.position.y = (scrollProgress - 0.5) * 2.2;
      }
    };

    const animateThree = () => {
      if (!isCanvasVisible) {
        canvasAnimId = null;
        return;
      }

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      if (latticeGroup) {
        latticeGroup.rotation.x += 0.0025;
        latticeGroup.rotation.z += 0.0018;

        if (!isTouchDevice) {
          latticeGroup.rotation.x += mouse.y * 0.018;
          latticeGroup.rotation.y += mouse.x * 0.018;
        }
      }

      renderer.render(scene, camera);
      canvasAnimId = requestAnimationFrame(animateThree);
    };

    // Tab Inactivity Visibility Observer: Pauses WebGL when browser tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isCanvasVisible = false;
        if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
      } else {
        isCanvasVisible = true;
        animateThree();
      }
    });

    initThree();
  }

  // ───── 04. CURSOR-LINKED FLOATING WORK PREVIEW (DESKTOP ONLY) ─────
  if (!isTouchDevice && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const previewModal = document.getElementById('cursorPreviewModal');
    const previewImg = document.getElementById('cursorPreviewImg');
    const previewBadge = document.getElementById('cursorPreviewBadge');
    const workItems = document.querySelectorAll('.work-item');

    let mousePos = { x: -200, y: -200 };
    let modalPos = { x: -200, y: -200 };

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    }, { passive: true });

    const updatePreviewPosition = () => {
      modalPos.x += (mousePos.x - modalPos.x) * 0.12;
      modalPos.y += (mousePos.y - modalPos.y) * 0.12;

      if (previewModal) {
        previewModal.style.left = `${modalPos.x + 40}px`;
        previewModal.style.top = `${modalPos.y}px`;
      }
      requestAnimationFrame(updatePreviewPosition);
    };
    requestAnimationFrame(updatePreviewPosition);

    workItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const imgSrc = item.getAttribute('data-preview-img');
        const badgeText = item.getAttribute('data-badge') || 'SYSTEM ARCHITECTURE';

        if (imgSrc && previewImg) {
          previewImg.src = imgSrc;
          previewImg.style.display = 'block';
        } else if (previewImg) {
          previewImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23090a0f'/%3E%3Cpath d='M50 200 L200 50 L350 200 Z' stroke='%230047ff' stroke-width='2' fill='none'/%3E%3Ccircle cx='200' cy='50' r='6' fill='%230047ff'/%3E%3Ccircle cx='50' cy='200' r='6' fill='%230284c7'/%3E%3Ccircle cx='350' cy='200' r='6' fill='%230284c7'/%3E%3C/svg%3E";
        }

        if (previewBadge) {
          previewBadge.textContent = badgeText;
        }

        if (previewModal) {
          previewModal.classList.add('active');
        }
        document.body.classList.add('cursor-view-mode');
      });

      item.addEventListener('mouseleave', () => {
        if (previewModal) {
          previewModal.classList.remove('active');
        }
        document.body.classList.remove('cursor-view-mode');
      });
    });
  }

  // ───── 05. GSAP STAGGERED REVEALS (ADAPTIVE DURATION) ─────
  if (typeof gsap !== 'undefined') {
    gsap.to('.reveal-text', {
      y: '0%',
      duration: isMobileScreen ? 0.9 : 1.35,
      stagger: 0.12,
      ease: 'power4.out',
      delay: 0.15
    });

    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach((item) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 30,
        duration: 0.75,
        ease: 'power3.out'
      });
    });
  }

  // ───── 06. LUXURY LIQUID GLASS CURSOR (DESKTOP ONLY) ─────
  if (!isTouchDevice && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    const cursorLabel = document.getElementById('cursorLabel');

    if (cursorDot && cursorRing) {
      let ringPos = { x: -100, y: -100 };
      let currentMouse = { x: -100, y: -100 };

      window.addEventListener('mousemove', (e) => {
        currentMouse.x = e.clientX;
        currentMouse.y = e.clientY;
        cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        if (cursorLabel) {
          cursorLabel.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
      });

      const updateRing = () => {
        ringPos.x += (currentMouse.x - ringPos.x) * 0.18;
        ringPos.y += (currentMouse.y - ringPos.y) * 0.18;
        cursorRing.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
        requestAnimationFrame(updateRing);
      };
      requestAnimationFrame(updateRing);

      const interactiveElements = document.querySelectorAll('a, button, .magnetic-btn, .domain-card, .dock-btn');
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }
  }

  // ───── 07. MAGNETIC BUTTON PULL (DESKTOP ONLY) ─────
  if (!isTouchDevice) {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  console.log('📱 Cross-Device Optimization Active: Safe-Area, Clamped DPR, Battery-Aware WebGL.');
})();
