// public/js/onboarding.js

async function startOnboarding() {
  const driver = window.driver.js.driver;

  const d = driver({
    popoverClass: 'driverjs-theme',
    showProgress: true,
    progressText: t("onboarding.progress"),
    allowClose: false,
    disableActiveInteraction: true,
    stageRadius: 10,
    stagePadding: 8,
    nextBtnText: t("onboarding.next"),
    prevBtnText: t("onboarding.prev"),
    doneBtnText: t("onboarding_write.done"),
    steps: [
        {
            element: '#canvas-command',
            popover: {
                title: t("onboarding_write.step1.title"),
                description: t("onboarding_write.step1.desc"),
                side: "bottom"
            }
        },
        {
            element: '#draw-box',
            popover: {
                title: t("onboarding_write.step2.title"),
                description: t("onboarding_write.step2.desc"),
                side: "top"
            }
        },
        {
            element: '#zoom-indicator',
            popover: {
                title: t("onboarding_write.step3.title"),
                description: t("onboarding_write.step3.desc"),
                side: "bottom"
            }
        },
        {
            element: '#selected-brush',
            popover: {
                title: t("onboarding_write.step4.title"),
                description: t("onboarding_write.step4.desc"),
                side: "top",
                onNextClick: () => {
                    document.querySelectorAll("#color-palette span.color-brush").forEach(brush => {
                    document.querySelector("#color-palette").setAttribute("visible", "true");
                    brush.setAttribute("visible", "true");
                    canvas.setAttribute("palette-open", "true");
                    });
                    d.moveNext();
                }
            }
        },
        {
            element: '#color-palette',
            popover: {
                title: t("onboarding_write.step5.title"),
                description: t("onboarding_write.step5.desc"),
                side: "top",
                onPrevClick: () => {
                    document.querySelectorAll("#color-palette span.color-brush").forEach(brush => {
                    document.querySelector("#color-palette").setAttribute("visible", "false");
                    brush.setAttribute("visible", "false");
                    canvas.setAttribute("palette-open", "false");
                    });
                    d.movePrevious();
                },
                onNextClick: () => {
                    document.querySelectorAll("#color-palette span.color-brush").forEach(brush => {
                    document.querySelector("#color-palette").setAttribute("visible", "false");
                    brush.setAttribute("visible", "false");
                    canvas.setAttribute("palette-open", "false");
                    });
                    d.moveNext();
                }
            }
        },
        {
            element: '#brush-size-selector',
            popover: {
                title: t("onboarding_write.step6.title"),
                description: t("onboarding_write.step6.desc"),
                side: "top",
                onPrevClick: () => {
                    document.querySelectorAll("#color-palette span.color-brush").forEach(brush => {
                    document.querySelector("#color-palette").setAttribute("visible", "true");
                    brush.setAttribute("visible", "true");
                    canvas.setAttribute("palette-open", "true");
                    });
                    d.movePrevious();
                }
            }
        }
        ],
        onDestroyed: async () => {
            await api('/user/onboarding', {
                method: 'POST',
                body: { key: 'write' }
            });
        }
  });
  
  setTimeout(() => d.drive(), 500);
}