// OPENAI configuration
const OPENAI = {
  API_BASE_URL: "https://api.openai.com/v1",
  API_KEY: "", // insert openAI API key
  GPT_MODEL: "gpt-3.5-turbo",
  API_COMPLETIONS: "/chat/completions",
  API_IMAGE: "/images/generations",
};

//variables
const muscles = document.querySelectorAll(".muscle");
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");
const modalImage = document.querySelector(".modal-image");
const modalCloseBtn = document.querySelector(".modal-close");
const muscleImages = [
  "image/abdomen.png",
  "image/biceps.png",
  "image/calves.png",
  "image/chest.png",
  "image/dorsalis.png",
  "image/quadriceps.png",
  "image/shoulders.png",
  "image/trapezius.png",
  "image/triceps.png",
];
let currentImageIndex = 0;
const muscleImage = document.getElementById("muscle-image");
const loader = document.querySelector(".loader");

// Modal close event
modalCloseBtn.addEventListener("click", function () {
  modal.classList.add("hidden");
});

changeImage(); // Initial image change
setInterval(changeImage, 500); // Change image every 3 seconds

// Ingredient click event
muscles.forEach(function (muscle) {
  muscle.addEventListener("click", function () {
    console.log(muscle.getAttribute("data-muscle"));
    createWorkout(muscle.getAttribute("data-muscle"));
  });
});

//FUNCTIONS

async function createWorkout(muscle) {
  loader.classList.remove("hidden");
  changeImage(); // Initial image change
  const imgInterval = setInterval(changeImage, 500); // Change image every 3 seconds

  const prompt = `\
create a home exercise for this muscle group: ${muscle}.
exercise must be simple and doable at home with minimum to no equipment.
Your response must be in JSON format as following example:
###

{
    
    "muscle": "${muscle}",
    "reps": "3x8",
    "exercise": "push up",
    "rest": "2 minutes",
}

###`;

  const workoutResponse = await makeRequest(OPENAI.API_COMPLETIONS, {
    model: OPENAI.GPT_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });
  console.log(workoutResponse);
  const content = JSON.parse(workoutResponse.choices[0].message.content);
  modalContent.innerHTML = `\
<h3>DO THIS</h3>
<p>TARGET: ${content.muscle}</p>
<p>REPS: ${content.reps}</p>
<p>EXERCISE: ${content.exercise}</p>
<p>REST: ${content.rest}</p>`;

  modal.classList.remove("hidden");
  loader.classList.add("hidden");
  clearInterval(imgInterval);

  const imageResponse = await makeRequest(OPENAI.API_IMAGE, {
    prompt: `create an image for this exercise: ${content.exercise}`,
    n: 1,
    size: "512x512",
  });

  const imageUrl = imageResponse.data[0].url;
  modalImage.innerHTML = `<img src="${imageUrl}" alt="exercise" />`;
}

async function makeRequest(endpoint, data) {
  const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI.API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(data),
  });

  const json = await response.json();
  return json;
}

function changeImage() {
  muscleImage.style.opacity = 0;
  setTimeout(() => {
    muscleImage.src = muscleImages[currentImageIndex];
    currentImageIndex = (currentImageIndex + 1) % muscleImages.length;
    muscleImage.style.opacity = 1;
  }, 500);
}
