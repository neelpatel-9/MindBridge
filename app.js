/* ==========================================================================
   MINDBRIDGE WEB ENGINE - INTERACTIVE COMPONENT SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. SYNAPSE CANVAS PARTICLES BACKGROUND (HIGH PERFORMANCE ANIMATION)
       ========================================================================== */
    const canvas = document.getElementById('synapse-bg');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const maxParticles = 60;
    const connectionDist = 120;
    let mouse = { x: null, y: null, radius: 150 };

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Blueprint
    class Particle {
        constructor() {
            this.reset();
            // Start scattered
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.alpha = Math.random() * 0.5 + 0.25;
            this.baseAlpha = this.alpha;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce on boundaries
            if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
            if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

            // Mouse interaction (push away gently)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    let angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 1.5;
                    this.y += Math.sin(angle) * force * 1.5;
                    this.alpha = Math.min(1, this.baseAlpha + force * 0.4);
                } else {
                    if (this.alpha > this.baseAlpha) this.alpha -= 0.01;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.65})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ffffff';
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    let alpha = (1 - dist / connectionDist) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw and update particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    /* ==========================================================================
       2. SCROLL OBSERVER, ACTIVE NAVIGATION STATES & COUNTERS
       ========================================================================== */
    


    const slides = document.querySelectorAll('.slide');
    const navLinks = document.querySelectorAll('.nav-link');
    const dotLinks = document.querySelectorAll('.slide-dots .dot');

    const observerOptions = {
        root: null,
        threshold: 0.5
    };

    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Update header navigation active class
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                // Update side dot navigation active class
                dotLinks.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('href') === `#${id}`) {
                        dot.classList.add('active');
                    }
                });

                // Trigger stat counters and SVG path animations specifically on slide enter
                if (id === 'problem') {
                    animateProblemStats();
                }
                if (id === 'market') {
                    triggerMarketChartAnimation();
                }
            }
        });
    }, observerOptions);

    slides.forEach(slide => slideObserver.observe(slide));

    // Smooth Scroll Click Handlers
    document.querySelectorAll('.desktop-nav a, .slide-dots a, .scroll-indicator, .hero-actions a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSlide = document.querySelector(targetId);
            if (targetSlide) {
                targetSlide.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Animate stats counting up and radial circle offset drawing
    let statsAnimated = false;
    function animateProblemStats() {
        if (statsAnimated) return; // run once
        statsAnimated = true;

        const cards = document.querySelectorAll('.interactive-stat-card');
        
        cards.forEach((card, index) => {
            const circleFill = card.querySelector('.progress-ring-fill');
            const overlayText = card.querySelector('.stat-value-overlay');
            
            // Stats configuration
            const stats = [33, 70, 85]; // 33% depression, 69.9% (70%) anxiety, 85.2% treatment gap
            const targetVal = stats[index];
            
            // Animate number count up
            let currentVal = 0;
            const duration = 1200; // ms
            const interval = 20; // ms
            const step = targetVal / (duration / interval);
            
            const countInterval = setInterval(() => {
                currentVal += step;
                if (currentVal >= targetVal) {
                    currentVal = targetVal;
                    clearInterval(countInterval);
                }
                overlayText.innerText = Math.round(currentVal) + (index === 0 ? '' : '%');
                if (index === 0 && Math.round(currentVal) === 33) {
                    overlayText.innerText = '1/3';
                }
            }, interval);

            // Animate SVG path draw
            // Circle circumference = 2 * PI * r = 2 * 3.14159 * 34 = 213.6
            const circumference = 213.6;
            const offset = circumference - (targetVal / 100) * circumference;
            circleFill.style.strokeDashoffset = offset;
        });
    }

    // Problem stats hover cards selector
    const statCards = document.querySelectorAll('.interactive-stat-card');
    statCards.forEach((card, idx) => {
        card.addEventListener('mouseenter', () => {
            statCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });


    /* ==========================================================================
       3. INTERACTIVE SIMULATOR MANAGER (SOLUTION SLIDE)
       ========================================================================== */
    const featureCards = document.querySelectorAll('.feature-selector-card');
    const simScreens = document.querySelectorAll('.sim-screen');

    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetFeature = card.getAttribute('data-feature');
            
            // Toggle active feature card
            featureCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Toggle active phone screen
            simScreens.forEach(s => s.classList.remove('active'));
            
            // Map feature code to simulator screens ID
            let screenId = 'sim-cbt-chat';
            if (targetFeature === 'mood-track') screenId = 'sim-mood-track';
            if (targetFeature === 'cbt-exercises') screenId = 'sim-cbt-exercises';
            if (targetFeature === 'peer-support') screenId = 'sim-peer-support';
            if (targetFeature === 'languages') screenId = 'sim-languages';
            if (targetFeature === 'crisis') screenId = 'sim-crisis';

            const activeScreen = document.getElementById(screenId);
            activeScreen.classList.add('active');

            // Trigger specific widget inits
            if (targetFeature === 'mood-track') {
                initMoodChart();
            }
        });
    });


    /* ==========================================================================
       4. INTERACTIVE CBT CHAT COMPANION (MULTI-LANGUAGE STATE DIALOGUE)
       ========================================================================== */
    const chatContainer = document.getElementById('chat-conversation');
    const langSelect = document.getElementById('chat-lang');
    const promptChips = document.querySelectorAll('.prompt-chip');

    // Dialog Data Trees
    const dialogues = {
        en: {
            greetings: "Namaste! I'm your MindBridge companion. I support students with exam anxiety, relationship stress, or simply feeling overwhelmed. How are you feeling today?",
            typing: "MindBridge is typing...",
            exam: {
                user: "My exams are next week, and I feel completely paralyzed by stress.",
                reply: "I hear you. High expectations are incredibly heavy. Let's look at the thought: *'If I fail, my life is ruined.'* Is there a more balanced way to see this? You've prepared before. Can we focus on just the next 25 minutes of revision? Let's try a box breathing exercise together to calm your heartbeat."
            },
            homesick: {
                user: "I moved to this PG in Bangalore, and I feel so homesick and lonely.",
                reply: "It is natural to feel isolated after a major shift. Your roots are still strong, but growing in a new soil takes time. Remember: loneliness is a feeling, not a permanent fact. What is one small thing in your room you can organize today to make it feel like yours? Or we can check out the anonymous Peer forum."
            },
            placements: {
                user: "Placement drives start tomorrow. I'm catastrophizing and can't sleep.",
                reply: "Placement nerves are real. You are predicting a negative future (*'I won't get selected'*). CBT suggests checking the facts: you have completed your degree milestones. One interview doesn't define your entire worth. Let's do a quick breathing cycle now. Inhale confidence, exhale anticipation."
            },
            social: {
                user: "Had a massive fight with my roommate. Now hostel feels toxic.",
                reply: "Roommate conflicts trigger intense campus stress since you can't escape. Try writing down the facts of the conflict, separated from your emotional reaction. Let's pause, let the heat clear, and draft an honest, calm message together using 'I feel...' statements rather than blame."
            }
        },
        hi: {
            greetings: "नमस्ते! मैं आपका माइंडब्रिज साथी हूँ। मैं परीक्षा की चिंता, हॉस्टल के अकेलेपन या अत्यधिक तनाव में छात्रों की मदद करता हूँ। आज आप कैसा महसूस कर रहे हैं?",
            typing: "माइंडब्रिज लिख रहा है...",
            exam: {
                user: "अगले हफ्ते परीक्षा है, और मैं डर के मारे पढ़ाई नहीं कर पा रहा हूँ।",
                reply: "मैं समझ सकता हूँ। उम्मीदों का बोझ बहुत भारी होता है। इस विचार को देखें: *'अगर मैं फेल हो गया तो सब खत्म हो जाएगा।'* क्या सोचने का कोई और तरीका है? आपने पहले भी तैयारी की है। क्या हम सिर्फ अगले 25 मिनट की पढ़ाई पर ध्यान दे सकते हैं? मन शांत करने के लिए चलिए प्राणायाम (सांस की कसरत) करें।"
            },
            homesick: {
                user: "घर से दूर हॉस्टल में बहुत अकेलापन लगता है, घर की बहुत याद आती है।",
                reply: "एक नई जगह जाने पर ऐसा लगना स्वाभाविक है। अकेलेपन की भावना अस्थायी है। आज अपने कमरे में कोई एक छोटी सी चीज़ ठीक करें जिससे वह थोड़ा अपना लगे। आप यहाँ गुमनाम साथियों के ग्रुप में भी अपनी बात शेयर कर सकते हैं।"
            },
            placements: {
                user: "कल से प्लेसमेंट शुरू हो रहे हैं। घबराहट से नींद नहीं आ रही है।",
                reply: "प्लेसमेंट की घबराहट बिल्कुल सामान्य है। आप भविष्य के बारे में सोच रहे हैं कि *'मेरा सिलेक्शन नहीं होगा'*। सच्चाई पर ध्यान दें: आपने अपनी डिग्री पूरी की है, आप योग्य हैं। एक इंटरव्यू आपकी वैल्यू तय नहीं करता। चलिए 2 मिनट गहरी सांस लेते हैं।"
            },
            social: {
                user: "रूममेट के साथ बहुत बड़ा झगड़ा हो गया। हॉस्टल में घुटन हो रही है।",
                reply: "रूममेट से अनबन हॉस्टल लाइफ को मुश्किल बना देती है। भावना को किनारे रखकर केवल सच को एक कागज़ पर लिखें। अभी प्रतिक्रिया न दें, शांत होने के बाद बात करें। हम मिलकर 'मुझे ऐसा लगा...' वाले शांत मैसेज का ड्राफ्ट बना सकते हैं।"
            }
        },
        te: {
            greetings: "నమస్తే! నేను మీ మైండ్‌బ్రిడ్జ్ తోడుని. పరీక్షల భయం, రూమ్మేట్ గొడవలు లేదా ఒంటరితనంతో బాధపడే విద్యార్థులకు నేను సహాయం చేస్తాను. ఈరోజు మీరు ఎలా ఉన్నారు?",
            typing: "మైండ్‌బ్రిడ్జ్ టైప్ చేస్తోంది...",
            exam: {
                user: "వచ్చే వారం ఎగ్జామ్స్ ఉన్నాయి, టెన్షన్ తో ఏమీ చదవలేకపోతున్నాను.",
                reply: "నేను అర్థం చేసుకోగలను. పరీక్షల ఒత్తిడి సహజం. *'నేను ఫెయిల్ అయితే నా జీవితం నాశనం అవుతుంది'* అనే ఆలోచనను మార్చుకుందాం. ఇది కేవలం ఒక పరీక్ష మాత్రమే. రాబోయే 25 నిమిషాలు మాత్రమే చదవడం పై దృష్టి పెడదామా? మీ మనస్సును ప్రశాంతంగా ఉంచడానికి బ్రీతింగ్ వ్యాయామం చేద్దాం."
            },
            homesick: {
                user: "ఇంటికి దూరంగా హాస్టల్లో చాలా ఒంటరిగా ఉంది, ఇంటి జ్ఞాపకాలు వేధిస్తున్నాయి.",
                reply: "కొత్త వాతావరణంలో ఒంటరితనం సహజం. ఈ ఒంటరితనం శాశ్వతం కాదు. ఈరోజు మీ రూమ్ లో మీకు నచ్చిన చిన్న మార్పు చేయండి. మన యాప్ లోని తోటి విద్యార్థుల ఫోరమ్ లో అనామకంగా మీ భావాలను పంచుకోవచ్చు."
            },
            placements: {
                user: "రేపటి నుండి క్యాంపస్ ప్లేస్‌మెంట్స్ ఉన్నాయి. భయంతో నిద్ర పట్టడం లేదు.",
                reply: "ప్లేస్‌మెంట్ భయం చాలా సహజం. రాబోయే ఫలితం గురించి ఆలోచించి ఆందోళన చెందకండి. మీ సత్తాపై నమ్మకం ఉంచండి. ఒక ఇంటర్వ్యూ మీ జీవితాన్ని నిర్ణయించదు. మనసును నిదానపరచడానికి 2 నిమిషాలు నెమ్మదిగా శ్వాస తీసుకోండి."
            },
            social: {
                user: "రూమ్మేట్ తో పెద్ద గొడవ జరిగింది. రూమ్ లో ఉండబుద్ధి కావడం లేదు.",
                reply: "రూమ్మేట్ తో వివాదం హాస్టల్ జీవితాన్ని కష్టతరం చేస్తుంది. కోపంలో ఏ నిర్ణయం తీసుకోకండి. ఇద్దరూ ప్రశాంతంగా ఉన్నప్పుడు 'నాకు ఇలా అనిపించింది...' అని సున్నితంగా మాట్లాడటానికి ప్రయత్నించండి."
            }
        },
        ta: {
            greetings: "வணக்கம்! நான் உங்களது மைண்ட்பிரிட்ஜ் நண்பன். தேர்வு பயம், தனிமை, அல்லது மன உளைச்சலில் இருக்கும் மாணவர்களுக்கு நான் உதவுகிறேன். இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
            typing: "மைண்ட்பிரிட்ஜ் டைப் செய்கிறது...",
            exam: {
                user: "அடுத்த வாரம் தேர்வு, பயத்தால் என்னால் படிக்கவே முடியவில்லை.",
                reply: "உங்களின் பயம் புரிகிறது. *'நான் தேர்ச்சி பெறவில்லை என்றால் என் வாழ்க்கையே வீணாகிவிடும்'* என்ற எண்ணத்தை மாற்றுவோம். இது ஒரு தேர்வு மட்டுமே. அடுத்த 25 நிமிடங்கள் மட்டும் படிப்பில் கவனம் செலுத்துவோம். மனதை அமைதிப்படுத்த என்னுடன் சேர்ந்து மூச்சுப்பயிற்சி செய்யுங்கள்."
            },
            homesick: {
                user: "வீட்டை விட்டு ஹாஸ்டலில் இருப்பது மிகவும் தனிமையாக உள்ளது.",
                reply: "புதிய இடத்திற்கு மாறும்போது தனிமை உணர்வு ஏற்படுவது இயல்பானதே. இது தற்காலிகமானது. இன்று உங்கள் அறையை உங்களுக்கு பிடித்தவாறு அடுக்கி வையுங்கள். நமது ஆப்-ல் உள்ள நண்பர்கள் குழுவில் அநாமதேயமாக உங்கள் உணர்வுகளை பகிரலாம்."
            },
            placements: {
                user: "நாளை பிளேஸ்மென்ட் நேர்காணல் தொடங்குகிறது. பயத்தால் தூக்கம் வரவில்லை.",
                reply: "பிளேஸ்மென்ட் பதற்றம் மிகவும் இயல்பானது. *'எனக்கு வேலை கிடைக்காது'* என்று எதிர்மறையாக நினைக்க வேண்டாம். உங்கள் திறமை மீது நம்பிக்கை வையுங்கள். ஒரு நேர்காணல் உங்களை தீர்மானிக்காது. அமைதியாக 2 நிமிடங்கள் மூச்சு பயிற்சி செய்வோம்."
            },
            social: {
                user: "ரூம்மேட்டுடன் பெரிய சண்டை. ஹாஸ்டலில் இருக்கவே பிடிக்கவில்லை.",
                reply: "ரூம்மேட்டுடன் சண்டை ஏற்படும்போது ஹாஸ்டல் வாழ்க்கை கடினமாக மாறும். கோபத்தில் பேச வேண்டாம். இருவருமே அமைதியான பிறகு 'எனக்கு இப்படி தோன்றியது...' என்று மெதுவாக பேச முயற்சிக்கவும்."
            }
        },
        kn: {
            greetings: "ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ ಮೈಂಡ್‌ಬ್ರಿಡ್ಜ್ ಗೆಳೆಯ. ಪರೀಕ್ಷೆಯ ಆತಂಕ, ಒಂಟಿತನ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡದಲ್ಲಿರುವ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಇಂದು ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತಿದ್ದೀರಿ?",
            typing: "ಮೈಂಡ್‌ಬ್ರಿಡ್ಜ್ ಟೈಪ್ ಮಾಡುತ್ತಿದೆ...",
            exam: {
                user: "ಮುಂದಿನ ವಾರ ಪರೀಕ್ಷೆಗಳಿವೆ, ಆತಂಕದಿಂದ ಏನೂ ಓದಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.",
                reply: "ನಿಮ್ಮ ಆತಂಕ ನನಗೆ ಅರ್ಥವಾಗುತ್ತದೆ. *'ನಾನು ಫೇಲ್ ಆದ್ರೆ ನನ್ನ ಲೈಫ್ ಹಾಳಾಗುತ್ತೆ'* ಅನ್ನೋ ಆಲೋಚನೆಯನ್ನು ಬದಲಿಸೋಣ. ಇದು ಕೇವಲ ಒಂದು ಪರೀಕ್ಷೆ ಅಷ್ಟೇ. ಮುಂದಿನ 25 ನಿಮಿಷಗಳ ಕಾಲ ಮಾತ್ರ ಓದಿನ ಮೇಲೆ ಗಮನ ಹರಿಸೋಣ. ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸಲು ನನ್ನೊಂದಿಗೆ ಉಸಿರಾಟದ ವ್ಯಾಯಾಮ ಮಾಡಿ."
            },
            homesick: {
                user: "ಮನೆಯಿಂದ ದೂರ ಹಾಸ್ಟೆಲ್‌ನಲ್ಲಿ ತುಂಬಾ ಒಂಟಿತನ ಕಾಡುತ್ತಿದೆ.",
                reply: "ಹೊಸ ಜಾಗಕ್ಕೆ ಬಂದಾಗ ಒಂಟಿತನ ಕಾಡುವುದು ಸಹಜ. ಈ ಭಾವನೆ ಶಾಶ್ವತವಲ್ಲ. ಇಂದು ನಿಮ್ಮ ರೂಮಿನಲ್ಲಿ ಸಣ್ಣ ಬದಲಾವಣೆ ಮಾಡಿ. ನಮ್ಮ ಆಪ್‌ನಲ್ಲಿರುವ ಸಹಪಾಠಿಗಳ ಗ್ರೂಪ್‌ನಲ್ಲಿ ಅನಾಮಧೇಯವಾಗಿ ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ."
            },
            placements: {
                user: "ನಾಳೆಯಿಂದ ಕ್ಯಾಂಪಸ್ ಪ್ಲೇಸ್‌ಮೆಂಟ್ಸ್ ಶುರುವಾಗುತ್ತಿದೆ. ಭಯದಿಂದ ನಿದ್ರೆ ಬರುತ್ತಿಲ್ಲ.",
                reply: "ಪ್ಲೇಸ್‌ಮೆಂಟ್ ಆತಂಕ ಸಾಮಾನ್ಯ. *'ನನಗೆ ಕೆಲಸ ಸಿಗಲ್ಲ'* ಎಂದು ಮೊದಲೇ ನಕಾರಾತ್ಮಕವಾಗಿ ಯೋಚಿಸಬೇಡಿ. ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯದ ಮೇಲೆ ನಂಬಿಕೆ ಇರಲಿ. ಒಂದು ಇಂಟರ್ವ್ಯೂ ನಿಮ್ಮ ಯೋಗ್ಯತೆಯನ್ನು ನಿರ್ಧರಿಸುವುದಿಲ್ಲ. ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತಗೊಳಿಸಲು 2 ನಿಮಿಷ ನಿಧಾನವಾಗಿ ಉಸಿರಾಡಿ."
            },
            social: {
                user: "ರೂಮ್‌ಮೇಟ್ ಜೊತೆ ದೊಡ್ಡ ಜಗಳವಾಗಿದೆ. ಹಾಸ್ಟೆಲ್‌ನಲ್ಲಿ ಇರಲು ಹಿಂಸೆಯಾಗುತ್ತಿದೆ.",
                reply: "ರೂಮ್‌ಮೇಟ್ ಜೊತೆಗಿನ ಜಗಳ ಹಾಸ್ಟೆಲ್ ಲೈಫ್ ಕಷ್ಟವಾಗುವಂತೆ ಮಾಡುತ್ತದೆ. ಸಿಟ್ಟಿನಲ್ಲಿ ಯಾವುದೇ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ಇಬ್ಬರೂ ಶಾಂತರಾದ ಮೇಲೆ 'ನನಗೆ ಹೀಗೆ ಅನಿಸಿತು...' ಎಂದು ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಲು ಪ್ರಯತ್ನಿಸಿ."
            }
        }
    };

    let activeLang = 'en';

    function setGreeting() {
        chatContainer.innerHTML = '';
        const greetBubble = document.createElement('div');
        greetBubble.className = 'msg-bubble system';
        greetBubble.innerText = dialogues[activeLang].greetings;
        chatContainer.appendChild(greetBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    setGreeting();

    function appendMessageBubble(container, text, sender) {
        const bubble = document.createElement('div');
        bubble.className = `msg-bubble ${sender}`;
        
        // Format bold/italic symbols for rendering HTML
        let formattedText = text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
        bubble.innerHTML = formattedText;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
        return bubble;
    }

    // Call Pollinations AI API (Keyless and Free)
    async function callPollinationsAPI(userMessage, history) {
        const url = "https://text.pollinations.ai/openai";
        
        let messages = [...history];
        messages.push({
            role: "user",
            content: userMessage
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: 'openai-fast'
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Failed to fetch response from AI engine");
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I am processing your thought. Could you rephrase that?";
    }

    // Format chat history into OpenAI standard messages list
    function getChatHistoryOpenAI(container) {
        let messages = [];
        
        // Add the custom dual-persona system instruction
        messages.push({
            role: "system",
            content: "You are MindBridge AI, a compassionate support companion and student psychologist at IIM Bangalore. For casual chat or general queries, talk normally and answer their questions directly. When they mention stress, anxiety, mental health, sadness, or personal struggles, respond as a professional psychologist using CBT (Cognitive Behavioral Therapy) concepts, helping them reframe their thoughts. Keep responses warm, empathetic, and under 3-4 sentences so they fit on a mobile screen mockup. Never break character."
        });

        const bubbles = container.querySelectorAll('.msg-bubble');
        const lastBubbles = Array.from(bubbles).slice(-10); // Context window of 10 messages
        lastBubbles.forEach(b => {
            if (b.classList.contains('typing')) return;
            let role = b.classList.contains('user') ? 'user' : 'assistant';
            messages.push({
                role: role,
                content: b.innerText.trim()
            });
        });
        return messages;
    }

    // Local Fallback responses (Empathetic CBT Psychologist NLP Parser)
    function getLocalResponse(userText) {
        const text = userText.toLowerCase();
        
        if (text.match(/(anxious|anxiety|stress|panic|depressed|depression|sad|lonely|homesick|roommate|placement|exam|fail|ruined|hopeless|suicide|kill|die|helpless|scared|worried|fight|toxic|isolation)/)) {
            return "I hear you. That sounds incredibly heavy and overwhelming. When stress or worry peaks, our minds often catastrophize or slip into cognitive loops. Let's try to pause for a moment. Can you take a slow deep breath with me right now? Inhale for 4 seconds, hold, and slowly exhale. Now, if you're comfortable, try sharing one small, neutral fact about the situation that is happening, separated from the emotions you are feeling. We can take this step-by-step together.";
        }
        if (text.match(/(hi|hello|hey|namaste|greetings)/)) {
            return "Namaste! I am MindBridge AI, your student support companion. How are you doing today? You can share anything that's on your mind, or ask me a question.";
        }
        if (text.match(/(how are you|how is it going|how's it going)/)) {
            return "I'm doing well, thank you for checking in! I'm here and ready to listen. How are things going with you today?";
        }
        if (text.match(/(thank you|thanks|ty|appreciate)/)) {
            return "You are very welcome! Remember, taking care of your well-being is the most important step. I'm always here if you want to chat again.";
        }
        if (text.match(/(who are you|what is mindbridge|what is this)/)) {
            return "I am MindBridge AI, an evidence-based mental health support companion designed specifically for Indian college students. I help students process academic, placement, and personal stress using interactive CBT tools.";
        }
        if (text.match(/(joke|tell me a joke|laugh)/)) {
            return "Why did the student bring a ladder to the exam? Because they wanted to reach the high expectations! 😄 On a serious note, remember to give yourself some credit today; you're doing the best you can.";
        }
        
        return "I understand. That sounds challenging. Tell me more about what is happening, or let's check how we can break this thought down together. I'm here to listen.";
    }

    async function triggerBotReply(container, replyText, disableControlsList, customUserQuery = null) {
        const typingBubble = document.createElement('div');
        typingBubble.className = 'msg-bubble system typing';
        typingBubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        container.appendChild(typingBubble);
        container.scrollTop = container.scrollHeight;

        if (disableControlsList) {
            disableControlsList.forEach(ctrl => ctrl.disabled = true);
        }

        setTimeout(async () => {
            typingBubble.remove();
            let finalReply = replyText;
            
            if (customUserQuery) {
                try {
                    const history = getChatHistoryOpenAI(container);
                    finalReply = await callPollinationsAPI(customUserQuery, history);
                } catch (err) {
                    console.warn("AI API connection failed, using local fallback:", err);
                    finalReply = getLocalResponse(customUserQuery);
                }
            }
            
            appendMessageBubble(container, finalReply, 'system');

            if (disableControlsList) {
                disableControlsList.forEach(ctrl => ctrl.disabled = false);
            }
        }, 1200);
    }

    // Trigger dialogue scenario
    function runChatScenario(scenario) {
        const textData = dialogues[activeLang];
        if (!textData[scenario]) return;
        
        appendMessageBubble(chatContainer, textData[scenario].user, 'user');
        triggerBotReply(chatContainer, textData[scenario].reply, promptChips);
    }

    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const scenario = chip.getAttribute('data-scenario');
            runChatScenario(scenario);
        });
    });

    langSelect.addEventListener('change', (e) => {
        activeLang = e.target.value;
        setGreeting();
    });

    // Wire up Simulator text inputs
    const simChatInput = document.getElementById('sim-chat-input');
    const simChatSend = document.getElementById('sim-chat-send');

    function handleSimSubmit() {
        const query = simChatInput.value.trim();
        if (query === '') return;
        
        simChatInput.value = '';
        appendMessageBubble(chatContainer, query, 'user');
        
        const controls = [...promptChips, simChatInput, simChatSend];
        triggerBotReply(chatContainer, null, controls, query);
    }

    if (simChatInput && simChatSend) {
        simChatSend.addEventListener('click', handleSimSubmit);
        simChatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSimSubmit();
        });
    }

    // Wire up Hero text inputs
    const heroChatContainer = document.querySelector('.phone-messages');
    const heroChatInput = document.getElementById('hero-chat-input');
    const heroChatSend = document.getElementById('hero-chat-send');

    function handleHeroSubmit() {
        const query = heroChatInput.value.trim();
        if (query === '') return;
        
        heroChatInput.value = '';
        appendMessageBubble(heroChatContainer, query, 'user');
        
        const controls = [heroChatInput, heroChatSend];
        triggerBotReply(heroChatContainer, null, controls, query);
    }

    if (heroChatInput && heroChatSend && heroChatContainer) {
        const heroTyping = heroChatContainer.querySelector('.typing');
        setTimeout(() => {
            if (heroTyping) {
                heroTyping.remove();
                const replyText = dialogues.en.placements.reply;
                appendMessageBubble(heroChatContainer, replyText, 'system');
            }
        }, 1000);

        heroChatSend.addEventListener('click', handleHeroSubmit);
        heroChatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleHeroSubmit();
        });
    }


    /* ==========================================================================
       5. INTERACTIVE MOOD TRACKER & SVG GRAPHING
       ========================================================================== */
    const moodBtns = document.querySelectorAll('.mood-btn');
    const moodSvg = document.getElementById('mood-svg-chart');
    const moodLine = document.getElementById('mood-chart-line');
    const moodPointsContainer = document.getElementById('mood-chart-points');

    // Baseline scores Mon-Sun (1=Stressed, 5=Calm)
    // Y maps: Mood 1 -> Y=110px, Mood 5 -> Y=20px
    let moodValues = [2, 3, 2, 4, 3, 4, 3];
    let displayMoodValues = [...moodValues]; // For animation interpolation
    let moodAnimFrameId = null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    function getSvgCoordinates() {
        const width = moodSvg.clientWidth || 255;
        const paddingX = 15;
        const stepX = (width - paddingX * 2) / 6;

        return displayMoodValues.map((val, idx) => {
            if (val === null) return null;
            const x = paddingX + idx * stepX;
            // Map mood 1-5 to Y 110-20
            const y = 110 - (val - 1) * 22.5; 
            return { x, y };
        });
    }

    function drawMoodChart() {
        const coords = getSvgCoordinates();
        let pathD = '';
        moodPointsContainer.innerHTML = ''; // Clear points and labels

        let firstPoint = true;
        coords.forEach((coord, idx) => {
            if (coord === null) return;

            // Add path coordinate
            if (firstPoint) {
                pathD = `M ${coord.x} ${coord.y}`;
                firstPoint = false;
            } else {
                pathD += ` L ${coord.x} ${coord.y}`;
            }

            // Draw Day Text Label inside SVG for perfect vertical alignment
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', coord.x);
            text.setAttribute('y', '130');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'svg-axis-label');
            text.textContent = days[idx];
            moodPointsContainer.appendChild(text);

            // Draw circular point node
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', coord.x);
            circle.setAttribute('cy', coord.y);
            circle.setAttribute('r', idx === 6 ? '6' : '4'); // Make today's point larger
            circle.setAttribute('fill', idx === 6 ? 'var(--primary-teal)' : 'var(--primary-blue)');
            circle.setAttribute('stroke', 'var(--phone-bg)');
            circle.setAttribute('stroke-width', '2');
            moodPointsContainer.appendChild(circle);
        });

        moodLine.setAttribute('d', pathD);
        drawTouchablePillars();
    }

    function drawTouchablePillars() {
        let touchGroup = moodSvg.querySelector('.mood-touch-pillars');
        if (touchGroup) touchGroup.remove();

        touchGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        touchGroup.setAttribute('class', 'mood-touch-pillars');

        const width = moodSvg.clientWidth || 255;
        const paddingX = 15;
        const stepX = (width - paddingX * 2) / 6;

        for (let idx = 0; idx < 7; idx++) {
            const xCenter = paddingX + idx * stepX;
            const xLeft = xCenter - stepX / 2;
            const colWidth = stepX;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', idx === 0 ? 0 : xLeft);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', idx === 0 || idx === 6 ? colWidth * 1.25 : colWidth);
            rect.setAttribute('height', 135);
            rect.setAttribute('class', 'mood-touch-pillar');
            
            const selectMoodValue = (e) => {
                const rectBounds = moodSvg.getBoundingClientRect();
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const clickY = clientY - rectBounds.top;
                
                // Map clickY (20 to 110) to score (1 to 5)
                let score = Math.round((110 - clickY) / 22.5 + 1);
                score = Math.max(1, Math.min(5, score)); // clamp

                // Trigger smooth animation transition
                animateMoodTransition(idx, score);

                // If Sunday (index 6) is clicked, update active status of buttons
                if (idx === 6) {
                    moodBtns.forEach(btn => btn.classList.remove('active'));
                    const targetBtn = document.querySelector(`.mood-btn[data-mood="${score}"]`);
                    if (targetBtn) targetBtn.classList.add('active');
                }
            };

            rect.addEventListener('click', selectMoodValue);
            rect.addEventListener('touchstart', (e) => {
                e.preventDefault();
                selectMoodValue(e);
            }, { passive: false });

            touchGroup.appendChild(rect);
        }
        moodSvg.appendChild(touchGroup);
    }

    function animateMoodTransition(idx, targetScore) {
        if (moodValues[idx] === targetScore) return;
        
        const startScore = displayMoodValues[idx];
        moodValues[idx] = targetScore;

        const durationFrames = 20;
        let frame = 0;

        function step() {
            frame++;
            const progress = frame / durationFrames;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            displayMoodValues[idx] = startScore + (targetScore - startScore) * easedProgress;
            drawMoodChart();

            if (frame < durationFrames) {
                moodAnimFrameId = requestAnimationFrame(step);
            }
        }

        if (moodAnimFrameId) cancelAnimationFrame(moodAnimFrameId);
        moodAnimFrameId = requestAnimationFrame(step);
    }

    function initMoodChart() {
        setTimeout(() => {
            drawMoodChart();
        }, 100);
    }

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const score = parseInt(btn.getAttribute('data-mood'));
            animateMoodTransition(6, score);
        });
    });


    /* ==========================================================================
       6. CALMING BREATHING EXERCISE TIMER
       ========================================================================== */
    const breathingBubble = document.getElementById('b-bubble');
    const breathingAction = document.getElementById('breathing-action');
    const breathingTimer = document.getElementById('breathing-timer');
    const btnBreathing = document.getElementById('btn-breathing-start');

    let breathingInterval = null;
    let breathingActive = false;

    const breathingCycle = [
        { action: 'Inhale', duration: 4, scale: '1.4', text: 'Breathe In...' },
        { action: 'Hold', duration: 4, scale: '1.4', text: 'Hold...' },
        { action: 'Exhale', duration: 4, scale: '1.0', text: 'Breathe Out...' }
    ];

    let cycleIndex = 0;
    let secondsRemaining = 0;

    function runBreathingStep() {
        if (!breathingActive) return;

        const currentStep = breathingCycle[cycleIndex];
        breathingAction.innerText = currentStep.text;
        breathingBubble.style.transform = `scale(${currentStep.scale})`;
        
        // Dynamic animation shadow colors based on action
        if (currentStep.action === 'Inhale') {
            breathingBubble.style.boxShadow = '0 0 40px rgba(0, 242, 254, 0.6)';
        } else if (currentStep.action === 'Hold') {
            breathingBubble.style.boxShadow = '0 0 50px rgba(161, 140, 209, 0.6)';
        } else {
            breathingBubble.style.boxShadow = '0 0 25px rgba(0, 242, 254, 0.2)';
        }

        secondsRemaining = currentStep.duration;
        breathingTimer.innerText = secondsRemaining;

        const countdown = setInterval(() => {
            if (!breathingActive) {
                clearInterval(countdown);
                return;
            }

            secondsRemaining--;
            if (secondsRemaining > 0) {
                breathingTimer.innerText = secondsRemaining;
            } else {
                clearInterval(countdown);
                // Advance cycle
                cycleIndex = (cycleIndex + 1) % breathingCycle.length;
                runBreathingStep();
            }
        }, 1000);
    }

    btnBreathing.addEventListener('click', () => {
        if (breathingActive) {
            // Stop exercise
            breathingActive = false;
            btnBreathing.innerText = 'Start Exercise';
            breathingAction.innerText = 'Focus';
            breathingTimer.innerText = '';
            breathingBubble.style.transform = 'scale(1.0)';
            breathingBubble.style.boxShadow = '0 0 30px rgba(0, 242, 254, 0.4)';
            cycleIndex = 0;
        } else {
            // Start exercise
            breathingActive = true;
            btnBreathing.innerText = 'Stop Exercise';
            cycleIndex = 0;
            runBreathingStep();
        }
    });


    /* ==========================================================================
       7. DYNAMIC MARKET GROWTH MORPHING CHART
       ========================================================================== */
    const btnChartMarket = document.getElementById('btn-chart-market');
    const btnChartApps = document.getElementById('btn-chart-apps');
    const chartDesc = document.getElementById('market-chart-desc');
    const marketAreaPath = document.getElementById('market-area-path');
    const marketLinePath = document.getElementById('market-line-path');
    const marketNodesGroup = document.getElementById('market-nodes');

    // Chart Datasets: X=50 to 450 (width=400), Y=20 to 185 (height=165)
    // Coordinates mapping values to SVG viewport
    const datasetMarket = {
        label: "India online mental health market is projected to reach $451.73M by 2033, growing at a CAGR of 13.4%. <span class='citation'>Source: IMARC</span>",
        points: [
            { x: 50, y: 185, val: "$133M" },  // 2024
            { x: 150, y: 155, val: "$182M" }, // 2026
            { x: 250, y: 120, val: "$250M" }, // 2028
            { x: 350, y: 80, val: "$340M" },  // 2030
            { x: 450, y: 20, val: "$452M" }   // 2033
        ]
    };

    const datasetApps = {
        label: "The India mental health apps market specifically is projected to reach $363M by 2030, growing at 18.2% CAGR. <span class='citation'>Source: Insights10</span>",
        points: [
            { x: 50, y: 185, val: "$85M" },   // 2024
            { x: 150, y: 158, val: "$124M" }, // 2026
            { x: 250, y: 125, val: "$185M" }, // 2028
            { x: 350, y: 88, val: "$265M" },  // 2030
            { x: 450, y: 40, val: "$363M" }   // 2033
        ]
    };

    let activeDataset = datasetMarket;

    // Simple interpolation logic for path morphing
    let animationFrameId = null;
    function morphChart(targetDataset) {
        activeDataset = targetDataset;
        chartDesc.innerHTML = targetDataset.label;

        // Current coordinates of points
        let currentPoints = [];
        const circles = marketNodesGroup.querySelectorAll('circle');
        
        if (circles.length === 0) {
            // First build
            renderChart(targetDataset.points);
            return;
        }

        circles.forEach(c => {
            currentPoints.push({
                x: parseFloat(c.getAttribute('cx')),
                y: parseFloat(c.getAttribute('cy'))
            });
        });

        const targetPoints = targetDataset.points;
        const durationFrames = 25;
        let frame = 0;

        function step() {
            frame++;
            const progress = frame / durationFrames;
            // Easing: easeOutCubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            let intermediatePoints = currentPoints.map((cp, idx) => {
                const tp = targetPoints[idx];
                return {
                    x: cp.x + (tp.x - cp.x) * easedProgress,
                    y: cp.y + (tp.y - cp.y) * easedProgress,
                    val: tp.val
                };
            });

            renderChart(intermediatePoints);

            if (frame < durationFrames) {
                animationFrameId = requestAnimationFrame(step);
            }
        }

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(step);
    }

    function renderChart(points) {
        let linePathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            linePathD += ` L ${points[i].x} ${points[i].y}`;
        }
        
        // Area path drops down to baseline (Y=185) at endpoints
        let areaPathD = `${linePathD} L ${points[points.length - 1].x} 185 L ${points[0].x} 185 Z`;

        marketLinePath.setAttribute('d', linePathD);
        marketAreaPath.setAttribute('d', areaPathD);

        // Setup tooltip
        let tooltip = document.getElementById('market-chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'market-chart-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        // Render point labels & dots
        marketNodesGroup.innerHTML = '';
        points.forEach((p, idx) => {
            // Draw circle dot
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', p.x);
            dot.setAttribute('cy', p.y);
            dot.setAttribute('r', '5');
            dot.setAttribute('fill', 'var(--primary-teal)');
            dot.setAttribute('stroke', 'var(--bg-dark)');
            dot.setAttribute('stroke-width', '2.5');
            dot.setAttribute('class', 'market-node-hover');
            
            const showTooltip = (e) => {
                const year = [2024, 2026, 2028, 2030, 2033][idx];
                const val = p.val || activeDataset.points[idx].val;
                const cagr = activeDataset === datasetMarket ? "13.4% CAGR" : "18.2% CAGR";
                tooltip.innerHTML = `<strong>Year ${year}</strong><br>Market: ${val}<br>Rate: ${cagr}`;
                tooltip.style.opacity = 1;
                
                const pageX = e.touches ? e.touches[0].pageX : e.pageX;
                const pageY = e.touches ? e.touches[0].pageY : e.pageY;
                tooltip.style.left = (pageX + 12) + 'px';
                tooltip.style.top = (pageY - 20) + 'px';
            };

            const hideTooltip = () => {
                tooltip.style.opacity = 0;
            };

            dot.addEventListener('mouseenter', showTooltip);
            dot.addEventListener('mousemove', showTooltip);
            dot.addEventListener('mouseleave', hideTooltip);

            dot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                showTooltip(e);
            }, { passive: false });
            dot.addEventListener('touchend', hideTooltip);
            
            marketNodesGroup.appendChild(dot);

            // Draw Value labels
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', p.x);
            text.setAttribute('y', p.y - 12);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text-main)');
            text.setAttribute('font-family', "'Plus Jakarta Sans', sans-serif");
            text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', '700');
            text.textContent = p.val || activeDataset.points[idx].val;
            marketNodesGroup.appendChild(text);
        });
    }

    btnChartMarket.addEventListener('click', () => {
        btnChartMarket.classList.add('active');
        btnChartApps.classList.remove('active');
        morphChart(datasetMarket);
    });

    btnChartApps.addEventListener('click', () => {
        btnChartApps.classList.add('active');
        btnChartMarket.classList.remove('active');
        morphChart(datasetApps);
    });

    function triggerMarketChartAnimation() {
        morphChart(activeDataset);
    }


    /* ==========================================================================
       8. TARGET AUDIENCE COHORT TABS
       ========================================================================== */
    const cohortTabs = document.querySelectorAll('.cohort-tab');
    const cohortPanes = document.querySelectorAll('.cohort-pane');

    cohortTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetCohort = tab.getAttribute('data-cohort');

            cohortTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            cohortPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.getAttribute('id') === `pane-${targetCohort}`) {
                    pane.classList.add('active');
                }
            });
        });
    });


    /* ==========================================================================
       9. COGNITIVE BEHAVIORAL THERAPY (CBT) CYCLE EXPLORER
       ========================================================================== */
    const cbtNodes = document.querySelectorAll('.cbt-node');
    const cbtPanes = document.querySelectorAll('.cbt-pane');

    cbtNodes.forEach(node => {
        node.addEventListener('click', () => {
            const targetNode = node.getAttribute('data-node');

            cbtNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            cbtPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.getAttribute('id') === `cbt-pane-${targetNode}`) {
                    pane.classList.add('active');
                }
            });
        });
    });


    /* ==========================================================================
       10. ANONYMOUS PASS BADGE GENERATOR
       ========================================================================== */
    const badgeForm = document.getElementById('badge-generator-form');
    const badgeResult = document.getElementById('badge-result');
    const badgeCard = badgeResult.querySelector('.generated-badge');
    const dispNick = document.getElementById('badge-disp-nick');
    const dispLang = document.getElementById('badge-disp-lang');

    badgeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nickVal = document.getElementById('form-nick').value;
        const langVal = document.getElementById('form-lang').value;
        const themeVal = document.getElementById('form-color').value;

        // Compile badge values
        dispNick.innerText = nickVal;
        dispLang.innerText = langVal;

        // Apply theme color styling class
        badgeCard.className = 'generated-badge'; // reset
        if (themeVal === 'purple') {
            badgeCard.classList.add('theme-purple');
        } else if (themeVal === 'amber') {
            badgeCard.classList.add('theme-amber');
        }

        // Hide form fields & display computed card badge
        badgeForm.style.display = 'none';
        badgeResult.style.display = 'block';
    });


    /* ==========================================================================
       11. DEDICATED BIBLIOGRAPHY CARD INDEX (SOURCES DIRECTORY)
       ========================================================================== */
    const references = [
        {
            category: "prevalence",
            title: "India Student Depression Rates",
            citation: "Cherian, A. et al. (2025). Mental Health Status of Higher Education Students in India. SAGE Journals.",
            claim: "In a study spanning 9 Indian states, 1 in 3 college students showed moderate-to-severe depression symptoms, and nearly 1 in 4 showed moderate-to-severe anxiety.",
            link: "https://journals.sagepub.com"
        },
        {
            category: "prevalence",
            title: "Student Anxiety Prevalence in Cities",
            citation: "SRM University Mental Survey. (2025). Psychological Distress among Indian University Cohorts. ScienceDirect.",
            claim: "A 2025 study of students across 8 major Indian cities found that 69.9% showed moderate-to-high anxiety and 59.9% showed moderate-to-high depression.",
            link: "https://www.sciencedirect.com"
        },
        {
            category: "prevalence",
            title: "Suicidal Ideation Indices",
            citation: "Cherian, A. et al. (2025). Mental Health Status of Higher Education Students in India. SAGE Journals.",
            claim: "Among Indian college students, 12.4% had seriously considered suicide in the past year, and 6.7% had attempted it.",
            link: "https://journals.sagepub.com"
        },
        {
            category: "barriers",
            title: "India Mental Health Treatment Gap",
            citation: "National Mental Health Survey Reports. (2024). India Healthcare Treatment Metrics. Astuteanalytica.",
            claim: "India's treatment gap is staggering — 70–92% of individuals with mental disorders do not receive adequate care.",
            link: "https://www.astuteanalytica.com"
        },
        {
            category: "barriers",
            title: "Depression-Specific Treatment Gaps",
            citation: "Systematic Review of Depression Care in South Asia. (2024). PMC / PubMed Central.",
            claim: "The treatment gap for depression in India alone is 85.2%.",
            link: "https://www.ncbi.nlm.nih.gov/pmc/"
        },
        {
            category: "barriers",
            title: "Psychiatrist Infrastructure Shortage",
            citation: "Government of India Economic Survey 2023-24. Business Standard.",
            claim: "India has only 0.75 psychiatrists per lakh population — far below the WHO's recommended 3 per lakh.",
            link: "https://www.business-standard.com"
        },
        {
            category: "barriers",
            title: "Cost of Traditional Therapy in India",
            citation: "Indian Mental Health App Market Trends. (2025). NorthEast Now News.",
            claim: "A single in-person therapy session in India costs ₹800–₹5,000 and is rarely covered by insurance.",
            link: "https://nenow.in"
        },
        {
            category: "barriers",
            title: "Psychiatrist Geographic Distribution",
            citation: "Rao, K. (2024). Rural vs Urban Mental Health Support Disparities. Psychology Town.",
            claim: "Around 70% of psychiatrists practice in urban areas, leaving students in tier-2/3 cities and rural colleges severely underserved.",
            link: "https://www.psychologytown.com"
        },
        {
            category: "science",
            title: "CBT App Efficacy for Universities",
            citation: "Umbrella Review of Digital Interventions. (2022). NCBI/PMC Efficacy Audits.",
            claim: "A comprehensive umbrella review found that CBT-based mobile applications and web-delivered interventions were effective or partially effective at reducing depression, anxiety, and stress symptoms in university students.",
            link: "https://pubmed.ncbi.nlm.nih.gov"
        },
        {
            category: "science",
            title: "Blinded Randomized Control Trial of CBT",
            citation: "RCT Student Wellness Trials. (2025). JMIR RCT Guides.",
            claim: "In a blinded randomized trial, students using a CBT app alongside brief sessions showed medium-to-large improvements in depression (d = 0.70–0.90) and large improvements in anxiety (d = 0.80).",
            link: "https://www.jmir.org"
        },
        {
            category: "science",
            title: "Wysa GAD-7 Anxiety Statistics",
            citation: "India AI Mental Wellness Penetration. (2026). Mordor Intelligence Report.",
            claim: "Wysa (an AI mental health app operating in India) achieved a 30% reduction in GAD-7 anxiety scores across its user base, showing real-world viability.",
            link: "https://www.mordorintelligence.com"
        },
        {
            category: "science",
            title: "Peer Element Engagement Benefits",
            citation: "Digital Intervention Peer Solidarities. (2024). JMIR Mental Health.",
            claim: "Research confirms that 'interventions with a peer element were associated with greater effectiveness, adherence, and lower dropout' than fully automated approaches.",
            link: "https://mental.jmir.org"
        },
        {
            category: "science",
            title: "Academic Impact of Distress",
            citation: "Emotional Health and College Achievements. (2024). Inside Higher Ed.",
            claim: "Among college students globally, 68% report that mental/emotional difficulties had impacted their academic performance at least one day per month.",
            link: "https://www.insidehighered.com"
        },
        {
            category: "science",
            title: "Digital Support Adoption Trends",
            citation: "Healthy Minds Study 2024-2025. (UCLA & Michigan Research). Psychiatric News.",
            claim: "The 2024–2025 Healthy Minds Study of 84,000+ students found that 37% received therapy or counseling — showing that when access is made easy, students actively use mental health resources.",
            link: "https://psychnews.psychiatryonline.org"
        },
        {
            category: "market",
            title: "India Online Mental Health Market Growth",
            citation: "India Online Mental Health Market Report. (2024). IMARC Group.",
            claim: "The India online mental health market was valued at USD 133.47 million in 2024 and is projected to reach USD 451.73 million by 2033, growing at a CAGR of 13.4%.",
            link: "https://www.imarcgroup.com"
        },
        {
            category: "market",
            title: "India Mental Health App Specific Size",
            citation: "India Mental Health Apps Insights. (2024). Insights10 Research.",
            claim: "The India mental health apps market specifically is projected to reach $363 million by 2030, growing at 18.2% CAGR.",
            link: "https://www.insights10.com"
        }
    ];

    const sourcesCardsGrid = document.getElementById('sources-cards-grid');
    const sourcesSearch = document.getElementById('sources-search');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let activeFilter = 'all';
    let searchQuery = '';

    function renderSources() {
        sourcesCardsGrid.innerHTML = '';

        // Filter and Search logic
        const filteredRefs = references.filter(ref => {
            const matchesFilter = activeFilter === 'all' || ref.category === activeFilter;
            const matchesSearch = searchQuery === '' || 
                ref.title.toLowerCase().includes(searchQuery) ||
                ref.citation.toLowerCase().includes(searchQuery) ||
                ref.claim.toLowerCase().includes(searchQuery);
            return matchesFilter && matchesSearch;
        });

        if (filteredRefs.length === 0) {
            sourcesCardsGrid.innerHTML = `
                <div class="no-sources-box" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: middle;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    No citations match your search query. Try typing another keyword.
                </div>
            `;
            return;
        }

        filteredRefs.forEach(ref => {
            const card = document.createElement('div');
            card.className = 'source-detail-card';

            // Category tag pretty labels
            let tagLabel = ref.category;
            if (ref.category === 'prevalence') tagLabel = 'Prevalence Stats';
            if (ref.category === 'barriers') tagLabel = 'Cost & Barriers';
            if (ref.category === 'science') tagLabel = 'CBT & Science';
            if (ref.category === 'market') tagLabel = 'Market Growth';

            card.innerHTML = `
                <div class="source-card-header">
                    <h5>${ref.title}</h5>
                    <span class="source-tag ${ref.category}">${tagLabel}</span>
                </div>
                <div class="source-body">
                    <p class="source-citation">${ref.citation}</p>
                    <p class="source-claim"><strong>Validated Claim:</strong> ${ref.claim}</p>
                </div>
                <a href="${ref.link}" target="_blank" class="source-link-btn">View Journal Source ↗</a>
            `;
            sourcesCardsGrid.appendChild(card);
        });
    }

    // Filter Buttons Clicks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            renderSources();
        });
    });

    // Search input Keystrokes
    sourcesSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderSources();
    });

    // Initial render
    renderSources();

    /* ==========================================================================
       12. ACCURATE DYNAMIC IST STATUS BAR TIME UPDATE
       ========================================================================== */
    const phoneTimeEl = document.getElementById('phone-time');
    
    function updatePhoneTime() {
        if (!phoneTimeEl) return;
        try {
            const options = {
                timeZone: 'Asia/Kolkata',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const timeStr = formatter.format(new Date());
            phoneTimeEl.textContent = timeStr.replace(/\s*[AP]M\s*/i, '');
        } catch (e) {
            // Fallback to local system time if timezone options fail
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            hours = hours % 12;
            hours = hours ? hours : 12;
            phoneTimeEl.textContent = `${hours}:${minutes}`;
        }
    }
    
    updatePhoneTime();
    // Update the clock every 10 seconds to keep in sync
    setInterval(updatePhoneTime, 10000);

});
