document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitBtn");
  const reflectionInput = document.getElementById("reflectionInput");
  const plantsLayer = document.getElementById("plantsLayer");
  const historyList = document.getElementById("historyList");
  const loader = document.getElementById("loader");

  const plantPopup = document.getElementById("plantPopup");
  const popupTitle = document.getElementById("popupTitle");
  const popupDesc = document.getElementById("popupDesc");
  const closePopup = document.querySelector(".close-popup");

  const emojiMap = {
    sunflower: "🌻",
    rose: "🌹",
    bamboo: "🎋",
    lotus: "🪷",
    "weeping willow": "🌿",
    cactus: "🌵",
    fern: "🪴",
    sprout: "🌱",
    hibiscus: "🌺",
    "wilted rose": "🥀",
  };

  const wisdomMap = {
    sunflower: "You radiate positivity and light.",
    rose: "Love is the center of your universe.",
    bamboo: "You are flexible and calm in the storm.",
    lotus: "You find peace even in murky waters.",
    "weeping willow": "It is okay to let your tears water the earth.",
    cactus: "You protect your boundaries and thrive in harshness.",
    fern: "You are resilient and endure stress.",
    sprout: "A new hope is beginning to grow within you.",
    hibiscus: "Your vibrant excitement brings color to the world.",
    "wilted rose": "Even in regret, there is beauty and lessons learned.",
  };

  function setBackgroundForSentiment(sentiment) {
    const bgMap = {
      joy: 'url("https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1920")',
      love: 'url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1920")',
      calm: 'url("https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1920")',
      peace:
        'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920")',
      sadness:
        'url("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1920")',
      anger:
        'url("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1920")',
      stress:
        'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920")',
      hope: 'url("https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1920")',
      excitement:
        'url("https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1920")',
      regret:
        'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920")',
    };

    const defaultBg =
      'url("https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80")';

    document.body.style.backgroundImage = bgMap[sentiment] || defaultBg;
  }

  function addPlant(type, analysis) {
    const div = document.createElement("div");
    div.className = "plant-entry";
    div.innerHTML = emojiMap[type] || "🌱";
    div.onclick = () => showPopup(type, analysis);
    plantsLayer.appendChild(div);
  }

  function showPopup(type, analysis) {
    popupTitle.innerText = type.toUpperCase();
    popupDesc.innerText =
      analysis || wisdomMap[type] || "A beautiful sign of your growth.";
    plantPopup.classList.add("active");
  }

  closePopup.onclick = () => plantPopup.classList.remove("active");

  window.onclick = (e) => {
    if (e.target == plantPopup) {
      plantPopup.classList.remove("active");
    }
  };

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const text = reflectionInput.value.trim();
    if (!text) return;

    loader.style.display = "grid";

    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reflection: text }),
      });

      const data = await res.json();

      addPlant(data.plant, data.analysis);
      reflectionInput.value = "";

      showPopup(data.plant, data.analysis);
      setBackgroundForSentiment(data.sentiment);
    } catch (e) {
      alert("Error planting soul.");
      console.error(e);
    } finally {
      loader.style.display = "none";
    }
  });
});
