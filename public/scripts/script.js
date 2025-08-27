let isLightMode = false;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggles = document.querySelectorAll(".theme-toggle");
    const logo = document.querySelector(".main-logo");

    themeToggles.forEach((themeToggle) => {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            isLightMode = !isLightMode;

            themeToggles.forEach((toggle) => {
                toggle.src = isLightMode
                    ? "assets/dark-mode-icon.png"
                    : "assets/light-mode-icon.png";
            });

            logo.src = isLightMode
                ? "assets/main-logo-light-mode.png"
                : "assets/main-logo.png";

            updateIconsAndGif();
        });
    });

    updateIconsAndGif();
});

const updateIconsAndGif = () => {
    document.querySelectorAll(".song-icon").forEach((icon) => {
        icon.src = isLightMode
            ? "assets/black-music-note-icon.png"
            : "assets/white-music-note-icon.png";
    });

    document.querySelectorAll(".video-icon").forEach((icon) => {
        icon.src = isLightMode
            ? "assets/black-video-camera-icon.png"
            : "assets/white-video-camera-icon.png";
    });

    document.querySelectorAll(".loading-gif").forEach((gif) => {
        gif.src = isLightMode
            ? "assets/white-background-loading.gif"
            : "assets/black-background-loading.gif";
    });
};

const updateDynamicIcons = () => {
    updateIconsAndGif();
};

const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');

hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

document.addEventListener('click', (event) => {
    const isClickInside = hamburgerMenu.contains(event.target) || mobileMenu.contains(event.target);
    
    if (!isClickInside) {
        hamburgerMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});

document.querySelectorAll(".language-toggle").forEach((toggle) => {
    toggle.addEventListener('click', function (event) {
        const block = document.getElementById("language-container");

        block.classList.toggle('show');

        event.stopPropagation();
    });
});

document.addEventListener('click', function (event) {
    const block = document.getElementById("language-container");
    const toggle = event.target.closest(".language-toggle");

    if (block && block.classList.contains('show') && !block.contains(event.target) && !toggle) {
        block.classList.remove('show');
    }
});

document.getElementById("close-languages").addEventListener('click', function (event) {
    const block = document.getElementById("language-container");
    block.classList.remove('show');
});

document.querySelectorAll(".contact-toggle").forEach((toggle) => {
    toggle.addEventListener('click', function (event) {
        const block = document.getElementById("contact-container");

        block.classList.toggle('show');

        event.stopPropagation();
    });
});

document.addEventListener('click', function (event) {
    const block = document.getElementById("contact-container");
    const toggle = event.target.closest(".contact-toggle");

    if (block && block.classList.contains('show') && !block.contains(event.target) && !toggle) {
        block.classList.remove('show');
    }
});

document.getElementById("close-contact").addEventListener('click', function (event) {
    const block = document.getElementById("contact-container");
    block.classList.remove('show');
});


document.getElementById("downloadForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let videoUrl = document.getElementById("video-url").value.trim();
    const platform = document.getElementById("platform").value;

    if (!videoUrl || !platform) {
        alert("Por favor, selecione uma plataforma e insira um link válido!");
        return;
    }

    videoUrl = normalizeUrl(videoUrl, platform);

    if (!isValidUrl(videoUrl, platform)) {
        alert("URL inválida! Certifique-se de que o link pertence à plataforma selecionada.");
        return;
    }

    const loadingDiv = document.querySelector(".loading-div");
    loadingDiv.style.display = "block";
    loadingDiv.innerHTML = `
        <img class="loading-gif" src="${
            isLightMode ? "assets/white-background-loading.gif" : "assets/black-background-loading.gif"
        }" alt="loading" style="width: 250px; height: auto; margin-left: 30px">
    `;
    document.querySelector(".media-title").style.display = "none";

    const iframeElement = document.querySelector("iframe");
    if (iframeElement) iframeElement.src = "";

    const videoDiv = document.querySelector(".main-section-presentation-media-type-video-div");
    const audioDiv = document.querySelector(".main-section-presentation-media-type-song-div");

    if (videoDiv) videoDiv.innerHTML = "";
    if (audioDiv) audioDiv.innerHTML = "";

    try {
        const response = await fetch("/video-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: videoUrl, platform }),
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        loadingDiv.style.display = "none";
        document.querySelector(".video").style.display = "block";

        if (data.title) {
            document.querySelector(".media-title").innerHTML = data.title;
        } else {
            document.querySelector(".media-title").innerHTML = "Título indisponível";
        }

        if (iframeElement) iframeElement.src = data.embedUrl || "";
        document.querySelector(".media-title").style.display = "block";

        (data.videoFormats || []).forEach((format) => {
            if (format.itag) {
                const div = document.createElement("div");
                div.classList.add("download-div");
                div.innerHTML = `
                    <a href="/download?url=${encodeURIComponent(videoUrl)}&itag=${format.itag}&title=${encodeURIComponent(data.title)}&platform=${encodeURIComponent(platform)}" target="_blank" class="download-btn" data-button="download-video">Download video</a>
                    <p>${format.quality}</p>
                    <p>${format.size}</p>
                    <img src="${
                        isLightMode ? "assets/black-video-camera-icon.png" : "assets/white-video-camera-icon.png"
                    }" alt="video-icon" class="video-icon">
                `;
                videoDiv.appendChild(div);
            }
        });

        (data.audioFormats || []).forEach((format) => {
            if (format.itag) {
                const div = document.createElement("div");
                div.classList.add("download-div");
                div.innerHTML = `
                    <a href="/download?url=${encodeURIComponent(videoUrl)}&itag=${format.itag}&title=${encodeURIComponent(data.title)}&platform=${encodeURIComponent(platform)}" target="_blank" class="download-btn" data-button="download-audio">Download audio</a>
                    <p>${format.bitrate}</p>
                    <p>${format.size}</p>
                    <img src="${
                        isLightMode ? "assets/black-music-note-icon.png" : "assets/white-music-note-icon.png"
                    }" alt="song-icon" class="song-icon">
                `;
                audioDiv.appendChild(div);
            }
        });

        updateDynamicIcons();

    } catch (error) {
        console.error(error);
        document.querySelector(".media-title").innerText =
            "Erro ao buscar dados. Tente novamente.";
    }
});


function normalizeUrl(url, platform) {
    const platformNormalizers = {
        youtube: normalizeYouTubeUrl,
        vimeo: (url) => url,
        facebook: (url) => url,
        instagram: (url) => url,
        tiktok: (url) => url,
    };
    return platformNormalizers[platform.toLowerCase()] ? platformNormalizers[platform.toLowerCase()](url) : url;
}

function isValidUrl(url, platform) {
    const platformValidators = {
        youtube: isValidYouTubeUrl,
        vimeo: (url) => /vimeo\.com/.test(url),
        facebook: (url) => /facebook\.com\/videos/.test(url),
        instagram: (url) => /instagram\.com\/(p|reel)/.test(url),
        tiktok: (url) => /tiktok\.com/.test(url),
    };
    return platformValidators[platform.toLowerCase()] ? platformValidators[platform.toLowerCase()](url) : false;
}

function normalizeYouTubeUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

function isValidYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
}
