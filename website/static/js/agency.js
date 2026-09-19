/* =========================================================
   CRESCITA MEDIA
   KINETIC / CHAOTIC AGENCY INTERACTIONS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)");

    const isDesktop =
        window.matchMedia("(min-width: 951px)").matches;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let smoothMouseX = mouseX;
    let smoothMouseY = mouseY;

    let scrollY = window.scrollY;
    let previousScrollY = scrollY;
    let scrollVelocity = 0;
    let smoothVelocity = 0;

    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuButton =
        document.querySelector(".mobile-menu-button");

    const mobileNavigation =
        document.querySelector(".mobile-navigation");


    const closeMenu = () => {

        if (!mobileNavigation) return;

        mobileNavigation.classList.remove("open");

        document.body.classList.remove("menu-open");

        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            menuButton.textContent = "MENU";
        }
    };


    if (menuButton && mobileNavigation) {

        menuButton.addEventListener("click", () => {

            const isOpen =
                mobileNavigation.classList.toggle("open");

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuButton.textContent =
                isOpen ? "CLOSE" : "MENU";

        });


        mobileNavigation
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    closeMenu
                );

            });
    }


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMenu();
        }

    });


    /* =====================================================
       SMOOTH ANCHOR SCROLLING
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "visible"
                    );

                    revealObserver.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -70px 0px"
            }
        );


    document
        .querySelectorAll(".section-reveal")
        .forEach(element => {

            revealObserver.observe(element);

        });


    /* =====================================================
       AUTOMATIC REVEAL TARGETS
    ===================================================== */

    [
        ".services-grid",
        ".project-card",
        ".social-card"
    ]
        .forEach(selector => {

            document
                .querySelectorAll(selector)
                .forEach(element => {

                    element.classList.add(
                        "section-reveal"
                    );

                    revealObserver.observe(
                        element
                    );

                });

        });


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header =
        document.querySelector(".site-header");


    const updateHeader = () => {

        scrollY = window.scrollY;

        scrollVelocity =
            scrollY - previousScrollY;

        previousScrollY = scrollY;

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            scrollY > 30
        );

        header.style.setProperty(
            "--scroll-speed",
            Math.min(
                Math.abs(scrollVelocity),
                30
            )
        );

    };


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );


    /* =====================================================
       MOUSE TRACKING
    ===================================================== */

    if (!prefersReducedMotion.matches) {

        window.addEventListener(
            "mousemove",
            event => {

                mouseX = event.clientX;
                mouseY = event.clientY;

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       CURSOR GLOW
    ===================================================== */

    let cursorGlow = null;


    if (
        isDesktop &&
        !prefersReducedMotion.matches
    ) {

        cursorGlow =
            document.createElement("div");

        cursorGlow.className =
            "crescita-cursor-glow";

        document.body.appendChild(
            cursorGlow
        );

    }


    /* =====================================================
       MAGNETIC ELEMENTS
    ===================================================== */

    const magneticElements =
        document.querySelectorAll(
            ".primary-button, .nav-cta, .submit-button"
        );


    /* =====================================================
       STICKERS
    ===================================================== */

    const stickers =
        document.querySelectorAll(
            ".sticker"
        );


    const stickerData = [];


    stickers.forEach(
        (sticker, index) => {

            stickerData.push({
                element: sticker,
                strength:
                    index % 2 === 0
                        ? 16
                        : -12,
                rotation:
                    index % 2 === 0
                        ? -8
                        : 8,
                phase:
                    Math.random() * Math.PI * 2,
                speed:
                    0.001 +
                    Math.random() * 0.001
            });

        }
    );


    /* =====================================================
       HERO VISUAL
    ===================================================== */

    const heroVisual =
        document.querySelector(
            ".hero-visual"
        );


    /* =====================================================
       HERO PARALLAX + CURSOR SYSTEM
    ===================================================== */

    const animateEverything = time => {

        if (
            !prefersReducedMotion.matches
        ) {

            smoothMouseX +=
                (mouseX - smoothMouseX) * 0.08;

            smoothMouseY +=
                (mouseY - smoothMouseY) * 0.08;


            const normalizedX =
                smoothMouseX /
                window.innerWidth -
                0.5;


            const normalizedY =
                smoothMouseY /
                window.innerHeight -
                0.5;


            /* ---------- CURSOR GLOW ---------- */

            if (cursorGlow) {

                cursorGlow.style.transform =
                    `translate3d(
                        ${smoothMouseX}px,
                        ${smoothMouseY}px,
                        0
                    )`;

            }


            /* ---------- STICKERS ---------- */

            stickerData.forEach(data => {

                const wave =
                    Math.sin(
                        time * data.speed +
                        data.phase
                    );

                const x =
                    normalizedX *
                    data.strength;

                const y =
                    normalizedY *
                    data.strength;

                const floatY =
                    wave * 7;


                data.element.style.setProperty(
                    "--mouse-x",
                    `${x}px`
                );

                data.element.style.setProperty(
                    "--mouse-y",
                    `${y + floatY}px`
                );

                data.element.style.setProperty(
                    "--chaos-rotate",
                    `${data.rotation + wave * 2}deg`
                );

            });


            /* ---------- HERO VISUAL ---------- */

            if (heroVisual && isDesktop) {

                const heroX =
                    normalizedX * 10;

                const heroY =
                    normalizedY * 6;


                heroVisual.style.transform =
                    `translate3d(
                        ${heroX}px,
                        ${heroY}px,
                        0
                    )`;

            }


            /* ---------- MAGNETIC BUTTONS ---------- */

            magneticElements.forEach(
                element => {

                    if (
                        !element.matches(":hover")
                    ) {
                        return;
                    }


                    const rect =
                        element.getBoundingClientRect();


                    const localX =
                        smoothMouseX -
                        rect.left -
                        rect.width / 2;


                    const localY =
                        smoothMouseY -
                        rect.top -
                        rect.height / 2;


                    element.style.transform =
                        `translate3d(
                            ${localX * 0.15}px,
                            ${localY * 0.15}px,
                            0
                        )`;

                }
            );

        }


        /* ---------- SCROLL VELOCITY ---------- */

        smoothVelocity +=
            (scrollVelocity - smoothVelocity) *
            0.08;


        const velocity =
            Math.max(
                -1,
                Math.min(
                    1,
                    smoothVelocity / 25
                )
            );


        document.documentElement.style.setProperty(
            "--scroll-velocity",
            velocity
        );


        scrollVelocity *= 0.88;


        requestAnimationFrame(
            animateEverything
        );

    };


    requestAnimationFrame(
        animateEverything
    );


    /* =====================================================
       MAGNETIC BUTTON RESET
    ===================================================== */

    magneticElements.forEach(
        element => {

            element.addEventListener(
                "mouseleave",
                () => {

                    element.style.transform = "";

                }
            );

        }
    );


    /* =====================================================
   AUTOMATIC NAV TEXT SCRAMBLE
===================================================== */

const scrambleElements =
    document.querySelectorAll(
        ".desktop-navigation a, .mobile-navigation a"
    );

const scrambleCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


scrambleElements.forEach(element => {

    const originalText =
        element.textContent.trim();

    if (!originalText) {
        return;
    }

    let running = false;


    element.addEventListener(
        "mouseenter",
        () => {

            if (
                prefersReducedMotion.matches ||
                running
            ) {
                return;
            }

            running = true;

            let iteration = 0;


            const interval =
                setInterval(() => {

                    element.textContent =
                        originalText
                            .split("")
                            .map(
                                (character, index) => {

                                    if (
                                        character === " "
                                    ) {
                                        return " ";
                                    }

                                    if (
                                        index <
                                        iteration
                                    ) {
                                        return originalText[
                                            index
                                        ];
                                    }

                                    return scrambleCharacters[
                                        Math.floor(
                                            Math.random() *
                                            scrambleCharacters.length
                                        )
                                    ];

                                }
                            )
                            .join("");


                    iteration += 0.7;


                    if (
                        iteration >=
                        originalText.length
                    ) {

                        clearInterval(interval);

                        element.textContent =
                            originalText;

                        running = false;

                    }

                }, 25);

        }
    );

});
    /* =====================================================
       RANDOM STICKER CLICK
    ===================================================== */

    stickers.forEach(sticker => {

        sticker.addEventListener(
            "click",
            () => {

                if (
                    prefersReducedMotion.matches
                ) {
                    return;
                }


                const randomRotation =
                    Math.random() * 30 - 15;


                const randomScale =
                    1 +
                    Math.random() * 0.12;


                sticker.style.transform =
                    `rotate(
                        ${randomRotation}deg
                    )
                    scale(
                        ${randomScale}
                    )`;


                setTimeout(
                    () => {

                        sticker.style.transform =
                            "";

                    },
                    450
                );

            }
        );

    });


    /* =====================================================
       SOCIAL CARD CHAOS
    ===================================================== */

    if (
        isDesktop &&
        !prefersReducedMotion.matches
    ) {

        document
            .querySelectorAll(".social-card")
            .forEach(card => {

                card.addEventListener(
                    "mouseenter",
                    () => {

                        const rotation =
                            Math.random() * 4 - 2;


                        card.style.transform =
                            `rotate(
                                ${rotation}deg
                            )
                            translateY(-10px)
                            scale(1.025)`;

                    }
                );


                card.addEventListener(
                    "mouseleave",
                    () => {

                        card.style.transform =
                            "";

                    }
                );

            });

    }


    /* =====================================================
       SERVICE CARD FOLLOW EFFECT
    ===================================================== */

    if (
        isDesktop &&
        !prefersReducedMotion.matches
    ) {

        document
            .querySelectorAll(".service-item")
            .forEach(card => {

                card.addEventListener(
                    "mousemove",
                    event => {

                        const rect =
                            card.getBoundingClientRect();


                        const x =
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width -
                            0.5;


                        const y =
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height -
                            0.5;


                        card.style.setProperty(
                            "--card-x",
                            `${x * 6}px`
                        );

                        card.style.setProperty(
                            "--card-y",
                            `${y * 6}px`
                        );

                    }
                );


                card.addEventListener(
                    "mouseleave",
                    () => {

                        card.style.setProperty(
                            "--card-x",
                            "0px"
                        );

                        card.style.setProperty(
                            "--card-y",
                            "0px"
                        );

                    }
                );

            });

    }


    /* =====================================================
       LOGO EASTER EGG
    ===================================================== */

    const logo =
        document.querySelector(
            ".brand"
        );


    if (
        logo &&
        !prefersReducedMotion.matches
    ) {

        let clickCount = 0;


        logo.addEventListener(
            "click",
            event => {

                clickCount++;


                if (
                    clickCount < 5
                ) {
                    return;
                }


                event.preventDefault();


                document.body.classList.add(
                    "crescita-chaos-mode"
                );


                setTimeout(
                    () => {

                        document.body.classList.remove(
                            "crescita-chaos-mode"
                        );

                        clickCount = 0;

                    },
                    1800
                );

            }
        );

    }


    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    if (
        prefersReducedMotion.matches
    ) {

        document.documentElement.style
            .setProperty(
                "scroll-behavior",
                "auto"
            );

    }

});
