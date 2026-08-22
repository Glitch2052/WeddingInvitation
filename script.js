document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
    const envelopeScreen = document.getElementById('envelope-screen');
    const envelopeVideo = document.getElementById('envelope-video');
    const invitationContainer = document.getElementById('invitation-container');
    const tapToReveal = document.getElementById('tap-to-reveal');
    const audio = document.getElementById('wedding-audio');
    const musicToggle = document.getElementById('music-toggle');
    const iconOn = document.getElementById('music-icon-on');
    const iconOff = document.getElementById('music-icon-off');
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // --- State ---
    let isInvitationRevealed = false;
    let isMusicPlaying = false;

    // --- Interaction & Transition ---
    envelopeScreen.addEventListener('click', () => {
        if (!isInvitationRevealed) {
            // Hide tap hint
            tapToReveal.classList.add('hidden');
            
            // Play audio
            audio.play().then(() => {
                isMusicPlaying = true;
                musicToggle.classList.remove('hidden');
            }).catch(e => console.log("Audio play failed:", e));

            // Play video
            envelopeVideo.play().catch(e => {
                console.log("Video play failed:", e);
                // Fallback if video fails
                transitionToInvitation();
            });
        }
    });

    envelopeVideo.addEventListener('ended', () => {
        transitionToInvitation();
    });

    function transitionToInvitation() {
        isInvitationRevealed = true;
        
        // Start fading out the envelope
        envelopeScreen.style.opacity = '0';
        
        // Show main container
        invitationContainer.classList.remove('hidden');
        // Small delay to ensure display:block applies before animating opacity
        setTimeout(() => {
            invitationContainer.style.opacity = '1';
        }, 50);

        // After fade out completes, remove envelope from DOM to save resources
        setTimeout(() => {
            envelopeScreen.style.display = 'none';
        }, 2000); // matches CSS transition time
    }

    // --- Music Toggle ---
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            audio.pause();
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
        } else {
            audio.play();
            iconOn.classList.remove('hidden');
            iconOff.classList.add('hidden');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // --- Scroll Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Particle System (Falling Flowers) ---
    function resizeCanvas() {
        // Fix for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const flowerImages = [];
    const imageSources = [
        'Images/particles/flower.png',
        'Images/particles/flower-2.png',
        'Images/particles/flower-3.png'
    ];
    
    let loadedImages = 0;
    imageSources.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            flowerImages.push(img);
        };
    });

    class Particle {
        constructor() {
            this.reset();
            // Randomize starting Y to fill screen initially
            this.y = Math.random() * window.innerHeight; 
        }

        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = -50 - Math.random() * 100; // Start above screen
            this.size = Math.random() * 15 + 10; // 10px to 25px
            this.speedY = Math.random() * 1 + 0.5; // Vertical speed
            this.speedX = (Math.random() - 0.5) * 0.5; // Horizontal drift
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
            this.opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
            // Select a random image
            this.image = flowerImages[Math.floor(Math.random() * flowerImages.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5; // gentle sine wave drift
            this.rotation += this.rotationSpeed;

            // Reset if off screen
            if (this.y > window.innerHeight + 50) {
                this.reset();
            }
        }

        draw() {
            if (!this.image) return;
            
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            // Draw image centered
            ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    const particles = [];
    // Adjust density based on screen width for performance
    const particleCount = window.innerWidth > 768 ? 40 : 25; 
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        if (loadedImages === imageSources.length && isInvitationRevealed) {
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }
        
        requestAnimationFrame(animate);
    }

    animate();
});
