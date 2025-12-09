 let smoother;
    document.addEventListener("DOMContentLoaded", () => {
      gsap.registerPlugin(
        ScrollTrigger,
        ScrollToPlugin,
        ScrollSmoother,
        TextPlugin,
        SplitText,
        ScrambleTextPlugin,
        DrawSVGPlugin,
        MorphSVGPlugin,
        MotionPathPlugin,
        Flip,
        Draggable,
        InertiaPlugin,
        Observer
      );

      const SCROLL_KEY = "inoxpran_smoother_scroll";

      /* =========================
         SCROLLSMOOTHER
      ========================== */
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true
      });

      // ---- Restore scroll position sau khi reload (nếu có) ----
      (function restoreScrollPosition() {
        const saved = sessionStorage.getItem(SCROLL_KEY);
        if (!saved) return;

        const y = parseFloat(saved);
        requestAnimationFrame(() => {
          smoother.scrollTo(y, false); // false = không animate
          sessionStorage.removeItem(SCROLL_KEY);
        });
      })();

      /* =========================
         NAV LINKS – STACKED TEXT HOVER
      ========================== */
      const navLinks = document.querySelectorAll(".navbar .links a");

      navLinks.forEach(link => {
        const label = link.textContent.trim();
        link.classList.add("nav-link-anim");

        link.innerHTML = `
                  <span class="nav-label nav-label-normal">${label}</span>
                  <span class="nav-label nav-label-italic">${label}</span>
              `;

        const normalSpan = link.querySelector(".nav-label-normal");
        const italicSpan = link.querySelector(".nav-label-italic");

        gsap.set(normalSpan, { y: "0%", opacity: 1 });
        gsap.set(italicSpan, { y: "100%", opacity: 0 });

        const tl = gsap.timeline({ paused: true })
          .to(normalSpan, {
            y: "-100%",
            opacity: 0,
            duration: 0.25,
            ease: "power3.out"
          }, 0)
          .to(italicSpan, {
            y: "0%",
            opacity: 1,
            duration: 0.25,
            ease: "power3.out"
          }, 0);

        link.addEventListener("mouseenter", () => tl.play());
        link.addEventListener("mouseleave", () => tl.reverse());
      });

      /* =========================
         NAVBAR links -> ScrollTo
      ========================== */
      document.querySelectorAll("[data-scroll-to]").forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const target = link.getAttribute("data-scroll-to");
          if (!target) return;
          smoother.scrollTo(target, true, "top top");
        });
      });

      const backToTop = document.getElementById("back-to-top");
      if (backToTop) {
        backToTop.addEventListener("click", () => {
          smoother.scrollTo("#hero", true, "top top");
        });
      }

      /* ============================================================
         HERO INTRO + TEXTPLUGIN SUBTITLE
      ============================================================ */
      const heroSection = document.querySelector("#hero");
      const heroTitle = document.querySelector(".hero-title");
      const panelLine = document.querySelector(".panel-line");
      const panelSubtitle = document.querySelector(".panel-subtitle");
      const heroStove = document.querySelector(".hero-stove");
      const heroTags = document.querySelectorAll(".tag-row-s1 .tag");
      const heroCta = document.querySelector(".btn-s1");

      if (heroSection && heroTitle && panelLine && panelSubtitle) {
        const fullText = panelSubtitle.getAttribute("data-full") ||
          panelSubtitle.textContent.trim();

        const phrases = [
          "Premium Inox Cookware.",
          fullText
        ];

        // Subtitle bắt đầu rỗng để TextPlugin gõ vào
        panelSubtitle.textContent = "";

        // Vị trí xuất phát của stove
        if (heroStove) {
          gsap.set(heroStove, {
            xPercent: -25,
            yPercent: 30,
            rotate: -6,
            opacity: 0
          });
        }

        // Intro hero: chạy 1 lần (không scrub)
        const heroIntroTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top center",
            once: true
          }
        });

        if (heroStove) {
          heroIntroTl.to(heroStove, {
            opacity: 1,
            duration: 2,
            ease: "power2.out"
          }, 0);
        }

        heroIntroTl
          .from(heroTitle, {
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
          }, 0.1)
          .from(panelLine, {
            width: 0,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
          }, "-=0.6")
          .from(panelSubtitle, {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out"
          }, "-=0.3")
          .to(panelSubtitle, {
            duration: 0.8,
            text: phrases[0],
            ease: "power2.out"
          })
          .to(panelSubtitle, {
            duration: 4,
            text: phrases[1],
            ease: "power3.out"
          })
          .from(heroTags, {
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.1
          }, 0.1)
          .from(heroCta, {
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
          }, 0.1);
      }

      /* ============================================================
         HERO TEXT PARALLAX (DRIFT + FADE OUT ĐỒNG BỘ)
      ============================================================ */
      if (heroSection && heroTitle && panelLine && panelSubtitle && heroCta) {
        const heroElems = [
          heroTitle,
          panelLine,
          panelSubtitle,
          ...heroTags,
          heroCta
        ];

        const heroScrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1
          }
        });

        // nếu muốn drift/fade hero text có thể thêm .to(...) vào heroScrollTl ở đây
      }

      /* ============================================================
         HERO STOVE PARALLAX (THEO VIEWPORT, MATCH MEDIA)
      ============================================================ */
      if (heroStove) {
        const mm = gsap.matchMedia();

        // Desktop ≥ 1025px
        mm.add("(min-width: 1025px)", () => {
          return gsap.to(heroStove, {
            xPercent: 30,
            yPercent: -35,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              immediateRender: false
            }
          });
        });

        // Tablet 769px – 1024px
        mm.add("(max-width: 1024px) and (min-width: 769px)", () => {
          return gsap.to(heroStove, {
            xPercent: 15,
            yPercent: -20,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              immediateRender: false
            }
          });
        });

        // Mobile ≤ 768px
        mm.add("(max-width: 768px)", () => {
          return gsap.to(heroStove, {
            xPercent: 8,
            yPercent: -10,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              immediateRender: false
            }
          });
        });
      }

      /* ============================================================
         INOX SECTION REVEAL + PARALLAX (ĐỒNG BỘ)
      ============================================================ */
      const inoxSection = document.querySelector("#inox");

      if (inoxSection) {
        const inoxTitle = inoxSection.querySelector(".panel-title");
        const inoxSubtitle = inoxSection.querySelector(".panel-subtitle");
        const inoxStatsRow = inoxSection.querySelector(".stats-row");
        const inoxCard = inoxSection.querySelector(".inox-card");

        const inoxElems = [
          inoxTitle,
          inoxSubtitle,
          inoxStatsRow,
          inoxCard
        ].filter(Boolean);

        if (inoxElems.length) {
          gsap.set(inoxElems, { opacity: 0, y: 40 });

          const inoxTl = gsap.timeline({
            scrollTrigger: {
              trigger: "#inox",
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1
            }
          });

          // Giai đoạn vào: trượt lên + rõ dần
          inoxTl.to(inoxElems, {
            opacity: 1,
            y: 0,
            ease: "none",
            duration: 0.4,
            stagger: 0.08
          }, 0);

          // Giai đoạn ra: tiếp tục trượt lên + mờ dần
          inoxTl.to(inoxElems, {
            opacity: 0,
            y: -60,
            ease: "none",
            duration: 0.5
          }, 0.6);
        }
      }

      /* ============================================================
         INOX STATS COUNTERS
      ============================================================ */
      const statConfigs = [
        { sel: "#stat-layers", target: 925, suffix: "°C", duration: 2 },
        { sel: "#stat-grade", target: 20, suffix: " năm", duration: 1.5 },
        { sel: "#stat-warranty", target: 3, suffix: " lần", duration: 2 }
      ];

      function setText(el, val, { pad2 = false, suffix = "" } = {}) {
        const t = pad2 ? String(val).padStart(2, "0") : String(val);
        el.textContent = t + (suffix || "");
      }

      function animateCounter(el, cfg) {
        setText(el, 0, cfg);
        const state = { v: 0 };
        return gsap.to(state, {
          v: cfg.target,
          duration: cfg.duration || 3.2,
          ease: "power2.out",
          onUpdate: () => setText(el, Math.round(state.v), cfg)
        });
      }

      const counters = statConfigs
        .map(cfg => ({ ...cfg, el: document.querySelector(cfg.sel) }))
        .filter(x => x.el);

      if (counters.length) {
        ScrollTrigger.create({
          trigger: "#inox",
          start: "top 70%",
          end: "bottom 30%",
          toggleActions: "restart none none reset",
          onEnter: () => {
            const tl = gsap.timeline();
            counters.forEach((cfg, i) => {
              tl.add(animateCounter(cfg.el, cfg), i === 0 ? 0 : "-=1.1");
            });
          },
          onEnterBack: () => {
            const tl = gsap.timeline();
            counters.forEach((cfg, i) => {
              tl.add(animateCounter(cfg.el, cfg), i === 0 ? 0 : "-=1.1");
            });
          },
          onLeaveBack: () => {
            counters.forEach(cfg => setText(cfg.el, 0, cfg));
          }
        });
      }

      /* ============================================================
         CTA HOVER WIGGLE
      ============================================================ */
      document.querySelectorAll(".cta").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
          gsap.fromTo(
            btn,
            { y: 0 },
            {
              y: -4,
              duration: 0.18,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut"
            }
          );
        });
      });

      /* ============================================================
         VIDEO CARD -> YOUTUBE IFRAME
      ============================================================ */
      const videoTriggers = document.querySelectorAll(".js-video-trigger");
      videoTriggers.forEach(trigger => {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          const videoId = this.getAttribute("data-video-id");
          if (!videoId) return;

          const iframeHTML = `
                      <iframe width="560" height="315"
                          src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
                          title="YouTube video player"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerpolicy="strict-origin-when-cross-origin"
                          allowfullscreen>
                      </iframe>
                  `;

          this.innerHTML = iframeHTML;
          this.classList.remove("js-video-trigger");
        });
      });

      /* ============================================================
         PANEL BACKGROUND PARALLAX (TẤT CẢ .panel-bg)
      ============================================================ */
      document.querySelectorAll(".panel-bg").forEach(bg => {
        const parentPanel = bg.closest("section");
        if (!parentPanel) return;

        gsap.to(bg, {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: parentPanel,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      });

      /* ============================================================
         GLOBAL SECTION REVEAL + PARALLAX (TRỪ HERO & INOX)
         -> tất cả các phần khác đều: vào rõ dần, ra mờ dần
      ============================================================ */
      const allSections = document.querySelectorAll("main section");

      allSections.forEach(sec => {
        const id = sec.id || "";
        if (id === "hero" || id === "inox") return;

        const elems = sec.querySelectorAll(
          ".panel-title, .panel-subtitle, .stats-row, .tag-row, .cta," +
          " .inox-section-title, .inox-article-item, .inox-right-column," +
          " .contact-form, .contact-info"
        );

        if (!elems.length) return;

        gsap.set(elems, { opacity: 0, y: 40 });

        const secTl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1
          }
        });

        // Vào: trượt lên + rõ dần
        secTl.to(elems, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "none"
        }, 0);

        // Ra: trượt tiếp lên + mờ dần
        secTl.to(elems, {
          opacity: 0,
          y: -40,
          duration: 0.5,
          ease: "none"
        }, 0.6);
      });

      /* ============================================================
         REFRESH SCROLLTRIGGER KHI LOAD XONG ẢNH
      ============================================================ */
      window.addEventListener("load", () => {
        ScrollTrigger.refresh();
      });

      /* ============================================================
         HARD RELOAD KHI RESIZE / ZOOM NHƯ JOINFLOW
      ============================================================ */
      let resizeTimer;
      let lastWidth = window.innerWidth;
      let lastHeight = window.innerHeight;
      let lastZoom = window.devicePixelRatio;

      function hardReloadKeepingScroll() {
        if (!smoother) {
          window.location.reload();
          return;
        }
        const currentScroll = smoother.scrollTop();
        sessionStorage.setItem(SCROLL_KEY, String(currentScroll));
        window.location.reload();
      }

      // Resize / breakpoint / zoom qua resize
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const z = window.devicePixelRatio;

          const widthChanged = Math.abs(w - lastWidth) > 40;
          const heightChanged = Math.abs(h - lastHeight) > 40;
          const zoomChanged = z !== lastZoom;

          if (widthChanged || heightChanged || zoomChanged) {
            hardReloadKeepingScroll();
          }

          lastWidth = w;
          lastHeight = h;
          lastZoom = z;
        }, 250);
      });

      // (Optional) backup: detect zoom riêng nếu browser không resize khi zoom
      setInterval(() => {
        const z = window.devicePixelRatio;
        if (z !== lastZoom) {
          hardReloadKeepingScroll();
          lastZoom = z;
        }
      }, 500);
    });