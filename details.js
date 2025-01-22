document.addEventListener('DOMContentLoaded', () => {
    const userDetailsForm = document.getElementById('user-details-form'); // Get the form
  
    // Handle form submission
    userDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent default form submission
  
      // Gather form data
      const formData = {
        name: document.getElementById('name').value,
        education: document.getElementById('education').value,
        experience: document.getElementById('experience').value,
        targetJob: document.getElementById('target-job').value,
      };
  
      // Store the data in localStorage
      localStorage.setItem('userDetails', JSON.stringify(formData));
  
      // Redirect to aivi.html
      window.location.href = 'chatbot.html';
    });
  });
  