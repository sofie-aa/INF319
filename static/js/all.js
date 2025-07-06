// Unified JavaScript for the Web Application

// Utility to extract displayable info from an item
function extractCardData(item) {
  return {
    title: item["Instrument Title"] || item["name"] || item["title"] || "Untitled",
    description: item["Description"] || item["description"] || item["longDesc"] || "No description available.",
    link: item["uri"] || "#"
  };
}

// Function to display cards in a given container
function displayCards(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach(item => {
    const { title, description, link } = extractCardData(item);
    const truncated = description.length > 200 ? description.substring(0, 200) + "..." : description;

    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-3 d-flex";

    const card = document.createElement("div");
    card.className = "card h-100 flex-fill";
    card.style.border = "1px solid #ddd";

    card.innerHTML = `
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${title}</h5>
        <p class="card-text flex-grow-1" style="overflow: hidden;">${truncated}</p>

        <div class="mt-3">
          <button onclick="Like(this)" class="btn btn-success btn-sm">
            <i class="bi bi-check2"></i> Approve <span class="like-count">0</span>
          </button>
        </div>

        <div class="mt-2">
          <textarea class="form-control comment-box" rows="2" placeholder="Add a comment..."></textarea>
          <button onclick="postComment(this)" class="btn btn-primary btn-sm mt-2">Post</button>
          <ul class="comment-list ps-3 mt-2"></ul>
        </div>
      </div>
    `;

    col.appendChild(card);
    container.appendChild(col);
  });

}

// Load a specific category and render it
async function loadCategory(category) {
  const container = document.getElementById(`${category}Container`);
  const res = await fetch(`/api/list/${category}`);
  const items = await res.json();

  if (!Array.isArray(items)) {
    container.innerHTML = `<p>Error loading ${category}</p>`;
    return;
  }

  displayCards(items, `${category}Container`);
}

// Load all categories
["projects", "fields", "Instruments"].forEach(loadCategory);

// Like button handler
function Like(btn) {
  const likeCount = btn.querySelector(".like-count");
  let count = parseInt(likeCount.textContent);
  likeCount.textContent = ++count;
}

// Post comment handler
function postComment(btn) {
  const container = btn.closest("div");
  const textarea = container.querySelector(".comment-box");
  const commentList = container.querySelector(".comment-list");
  const commentText = textarea.value.trim();

  if (commentText !== "") {
    const li = document.createElement("li");
    li.textContent = commentText;
    commentList.appendChild(li);
    textarea.value = "";
  }
}

// Overlays: search, login, register, about. Search does not use spotlightsearch any longer.
function openSearch() {
  document.getElementById("spotlightSearch").style.display = "flex";
  setTimeout(() => document.getElementById("spotlightInput").focus(), 100);
}

function closeSearch() {
  document.getElementById("spotlightSearch").style.display = "none";
}

function openRegister() {
  closeLogin();
  document.getElementById("registerOverlay").style.display = "flex";
  setTimeout(() => {
    const firstInput = document.querySelector("#registerOverlay input");
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeRegister() {
  document.getElementById("registerOverlay").style.display = "none";
}

function openLogin() {
  document.getElementById("loginOverlay").style.display = "flex";
  setTimeout(() => {
    const firstInput = document.querySelector("#loginOverlay input");
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeLogin() {
  document.getElementById("loginOverlay").style.display = "none";
}

function openAbout() {
  document.getElementById("aboutOverlay").style.display = "flex";
}

function closeAbout() {
  document.getElementById("aboutOverlay").style.display = "none";
}

// ESC key handler
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeSearch();
    closeLogin();
    closeRegister();
    closeAbout();
  }
});

// Search input (inline)
function toggleSearchInput() {
  const container = document.querySelector(".search-container");
  const input = document.getElementById("inlineSearchInput");

  container.classList.toggle("active");
  if (container.classList.contains("active")) input.focus();
  else input.value = "";
}

function collapseSearch() {
  const container = document.querySelector(".search-container");
  const input = document.getElementById("inlineSearchInput");
  if (!input.value.trim()) container.classList.remove("active");
}

async function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById("inlineSearchInput").value.trim().toLowerCase();
  if (!query) return;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();

    if (data.projects) {
      displayCards(data.projects, "projectsContainer");
    }
    if (data.fields) {
      displayCards(data.fields, "fieldsContainer");
    }
    if (data.Instruments) {
      displayCards(data.Instruments, "InstrumentsContainer");
    }
    
  } catch (err) {
    console.error("Error during search:", err);
    alert("An error occurred while searching.");
  }
}


// Register form submit
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (response.ok) {
      alert("Registration successful!");
      closeRegister();
      openLogin();
    } else {
      alert(result.message || "Registration failed.");
    }
  });
}



