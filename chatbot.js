document.addEventListener('DOMContentLoaded', function () {
  // Get the Home icon by its ID
  const homeIcon = document.getElementById('home-icon');
  
  // Add an event listener to handle the click
  homeIcon.addEventListener('click', function () {
    // Redirect the user to aivi.html
    window.location.href = 'home.html'; 
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve user details from localStorage
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  if (userDetails) {
    // Log the retrieved user details (you can replace this with whatever you want to do)
    console.log('User Details:', userDetails);

    const { name, education, experience, targetJob } = userDetails;

    // Show the loading bars inside the message content
    showLoadingBars();

    // Example: Make an API request using the stored data (replace this with your actual logic)
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyA8FFGnxqCFGF2VadfkeGHOWD2oYkJQkXM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Name: ${name}\nEducation: ${education}\nExperience: ${experience}\nTarget Job: ${targetJob}\n\nNow, how can I prepare for the interview and can you suggest a sutaible job?`
          }]
        }],
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
        const geminiResponse = data.candidates[0].content.parts[0].text;

        // Remove the loading bars once the response is received
        removeLoadingBars();

        // Create and append the Gemini response as a message
        const chatContainer = document.querySelector('.chat-list');  
        const apiMessage = document.createElement('div');
        apiMessage.classList.add('message', 'gemini-response');  

        // If you want to include the avatar for outgoing messages
        const avatar = document.createElement('img');
        avatar.src = "images/7.png";
        avatar.alt = "AI Coach avatar";
        avatar.classList.add('avatar');
        apiMessage.appendChild(avatar);

        // Create the message content
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = geminiResponse;  // Add the API response text
        apiMessage.appendChild(messageContent);

        // Append the API message to the chat container
        chatContainer.appendChild(apiMessage);

        // Scroll to the bottom of the chat to display the new message
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
      } else {
        throw new Error('No candidates in API response');
      }
    })
    .catch(error => {
      console.error('Error with API request:', error);
      const chatContainer = document.querySelector('.chat-list');
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('message', 'error-message');
      errorMessage.textContent = 'Sorry, there was an error processing the response. Please try again later.';
      chatContainer.appendChild(errorMessage);
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
    });

  } else {
    console.error('No user details found in localStorage');
  }
});

// Show the loading bars inside the message content
const showLoadingBars = () => {
  const loadingHTML = `
    <div class="loading-bar-container">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  `;
  const chatContainer = document.querySelector('.chat-list');
  
  // Create the message element with loading bars inside message-content
  const loadingMessage = document.createElement('div');
  loadingMessage.classList.add('message');
  loadingMessage.classList.add('loading');
  
  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  messageContent.innerHTML = loadingHTML;
  loadingMessage.appendChild(messageContent);

  // Append the loading message with loading bars to the chat container
  chatContainer.appendChild(loadingMessage);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Remove the loading bars after the response is received
const removeLoadingBars = () => {
  const loadingMessage = document.querySelector('.loading');
  if (loadingMessage) {
    loadingMessage.remove();
  }
};





const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestionPills = document.querySelectorAll(".suggestion-pill");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = `AIzaSyA8FFGnxqCFGF2VadfkeGHOWD2oYkJQkXM`; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  // Apply the stored theme
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  // Restore saved chats
  if (savedChats) {
    chatContainer.innerHTML = savedChats;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }
}

// Create a new message element and return it
const createMessageElement = (content, isOutgoing = false) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (isOutgoing) {
    messageDiv.classList.add("outgoing");
  }

  // Add avatar for incoming messages
  if (!isOutgoing) {
    const avatar = document.createElement("img");
    avatar.src = "images/7.png";
    avatar.alt = "AI Coach avatar";
    avatar.classList.add("avatar");
    messageDiv.appendChild(avatar);
  }

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  contentDiv.innerHTML = content;
  messageDiv.appendChild(contentDiv);

  // Add copy button for incoming messages
  if (!isOutgoing) {
    const copyButton = document.createElement("span");
    copyButton.classList.add("icon", "material-symbols-rounded");
    copyButton.innerHTML = "content_copy";
    copyButton.onclick = () => copyMessage(copyButton);
    messageDiv.appendChild(copyButton);
  }

  return messageDiv;
}

// Validate if the user message is related to interviews
const isInterviewRelated = (message) => {
  const interviewKeywords = ["interview", "job", "role", "position", "candidate", 
    "hiring", "skills", "qualifications", "experience", 
    "questions", "answers", "vacancy", "goals", "leadership", "skill", 
    "resume", "CV", "cover letter", "job offer", "salary", "benefits", 
    "company", "culture", "company values", "team", "organization", 
    "career growth", "promotion", "employment", "hiring manager", "recruiter", 
    "job description", "interview questions", "preparation", "technical interview", 
    "behavioral interview", "competency", "fit", "soft skills", "hard skills", 
    "communication", "teamwork", "problem-solving", "adaptability", "motivation", 
    "confidence", "professionalism", "work ethic", "time management", 
    "negotiation", "follow-up", "reference check", "offer letter", "background check", 
    "onboarding", "evaluation", "assessment", "job market", "remote work", 
    "work from home", "interview process", "initial interview", "second interview", 
    "final interview", "interview panel", "interview feedback", "virtual interview", 
    "group interview", "case interview", "assessment center", "interview tips", 
    "dressing for interview", "confidence building", "interview practice", 
    "rejection", "acceptance", "candidate experience", "interview techniques", 
    "interview coaching", "test", "screening", "job search", "career transition", 
    "career development", "professional growth", "job market trends", 
    "employment gap", "exit interview", "salary negotiation", "employer branding", 
    "headhunter", "job board", "recruitment agency", "internship", 
    "entry-level", "mid-level", "senior-level", "leadership development", "mentor", 
    "role-play", "pre-interview preparation", "interview simulation", "personal brand",
    "cultural fit", "job satisfaction", "work-life balance", "psychometric test", 
    "portfolio", "reference letter", "career coaching", "headhunting", 
    "salary range", "compensation package", "non-compete agreement", "employment offer",
    "background screening", "job hunt", "job seeker", "outplacement services", "networking",
    "online interview", "assessment test", "job fair", "headhunting agency", "work experience",
    "executive search", "panel interview", "firing", "job rejection", "skills assessment", "public speaking", "yourself", "IT related job", "it field job", "job", "thank you" , "thanks"
  ];
  // Check if the message contains any of the keywords
  return interviewKeywords.some((keyword) => 
    message.toLowerCase().includes(keyword)
  );
}

// Helper function to check if the message contains "thank you" 
const isEndMessage = (message) => {
  const endMessages = ["thank you", "thanks", "that's all", "no further questions"];
  return endMessages.some((endPhrase) => message.toLowerCase().includes(endPhrase));
}



// Show typing effect by displaying words one by one
const showTypingEffect = (text, messageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;
  const messageContent = messageDiv.querySelector(".message-content");
  messageContent.textContent = '';  // Clear previous content

  const typingInterval = setInterval(() => {
    messageContent.textContent += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      messageDiv.querySelector(".icon")?.classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75); // Adjust typing speed
}

// Generate a detailed message to prompt the user for a more specific response
const generateDetailedMessage = (userMessage) => {
  return `Please provide a detailed, but concise answer to the following question. Highlight the key details: ${userMessage}`;
}

// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
  try {
    const detailedMessage = generateDetailedMessage(userMessage);  // Generate detailed message
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          role: "user", 
          parts: [{ text: detailedMessage }] 
        }] 
      } ),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, incomingMessageDiv);  // Trigger typing effect
  } catch (error) {
    isResponseGenerating = false;
    incomingMessageDiv.querySelector(".message-content").textContent = error.message;
    incomingMessageDiv.classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
}

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const loadingHTML = `
    <div class="loading-indicator">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  `;

  const incomingMessageDiv = createMessageElement(loadingHTML);
  incomingMessageDiv.classList.add("loading");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  
  generateAPIResponse(incomingMessageDiv);
}

// Copy message text to the clipboard
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".message-content").textContent;
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";
  setTimeout(() => copyButton.innerText = "content_copy", 1000);
}

// Function to check if the message contains a greeting (e.g., "hi", "hello")
const isGreeting = (message) => {
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  return greetings.some(greeting => message.toLowerCase().startsWith(greeting));
}

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  // Create and append outgoing message
  const outgoingMessage = createMessageElement(userMessage, true);
  chatContainer.appendChild(outgoingMessage);
  
  // Fix the width issue by applying max-width directly to outgoing message
  const messageContentDiv = outgoingMessage.querySelector(".message-content");
  messageContentDiv.style.maxWidth = "75%"; // Restricting width of the outgoing message

  typingForm.reset();
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  // Check if the message is a greeting
  if (isGreeting(userMessage)) {
    // Show greeting message after the user's message is appended
    const greetingMessage = createMessageElement("Hi there! How can I help you today? ", false);
    chatContainer.appendChild(greetingMessage);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    return; // Exit early after showing the greeting message
  }

  // Validate the message for interview-related content
  if (!isInterviewRelated(userMessage)) {
    // Show warning message after the user message is appended
    const warningMessage = createMessageElement(
      "Hello, kindly ensure that any questions or information provided are strictly related to interviews and the interview process.",
      false
    );
    chatContainer.appendChild(warningMessage);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    return;
  }

  // Check if the message is a "thank you" or "that's all"
  if (isEndMessage(userMessage)) {
    // Function to show the ending message
  const endingMessage = createMessageElement("You're very welcome! I'm glad I could help. If you have any more questions or need further assistance, feel free to reach out. Good luck with your interview!", false);  // Not an outgoing message
  chatContainer.appendChild(endingMessage);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
    return;
  }

  isResponseGenerating = true;
  setTimeout(showLoadingAnimation, 500); // Show loading animation after the user's message
}

// Toggle between light and dark themes
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats
deleteChatButton.addEventListener("click", () => {
  chatContainer.innerHTML = '';
  localStorage.removeItem("saved-chats");
});

// Event listener for suggestion pills
suggestionPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    // Extract only the text after the icon (excluding the <span>)
    const messageText = Array.from(pill.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .join(" ");
    userMessage = messageText;
    handleOutgoingChat();
  });
});

// Initialize the app with stored data
loadDataFromLocalstorage();

// Handle form submission
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

// Add click event to avatar
document.querySelector("#avatar-click").addEventListener("click", () => {
  window.location.href = "aivi.html";
});

