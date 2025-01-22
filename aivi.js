document.addEventListener('DOMContentLoaded', function () {
    const themeIcons = document.querySelectorAll(".icon");
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
        setDarkMode();
    }

    // Event listener for both buttons
    document.getElementById("modeToggle").addEventListener("click", function () {
        setTheme();
    });
    
    document.getElementById("modeToggle2").addEventListener("click", function () {
        setTheme();
    });

    function setTheme() {
        let currentTheme = document.body.getAttribute("theme");
        
        if (currentTheme === "dark") {
            setLightMode();
        } else {
            setDarkMode();
        }
    }

    function setDarkMode() {
        document.body.setAttribute("theme", "dark");
        document.querySelector("header").setAttribute("theme", "dark");
        localStorage.setItem("theme", "dark");
        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-dark");
        });
    }

    function setLightMode() {
        document.body.setAttribute("theme", "light");
        document.querySelector("header").setAttribute("theme", "light");
        localStorage.setItem("theme", "light");
        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-light");
        });
    }
});


//Scroll Reveal
document.addEventListener('DOMContentLoaded', function () {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '20px',
      duration: 1000,
      delay: 200,
      easing: 'cubic-bezier(0.5, 0, 0, 1)',
      reset: true
    });
  
    sr.reveal('.home-text', {});
    sr.reveal('.home-img', { delay: 400 });
    sr.reveal('.aivi-text', { delay: 200 });
    sr.reveal('.parent-container > div', { interval: 200 });
    sr.reveal('.additional-section > div', { interval: 200 });
  });