// content.js
document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.querySelector('button.geBtn.gePrimaryBtn');

  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Perform actions when the Save button is clicked
      console.log('Save button pressed!');
      // You can add code here to send a message to the background script or perform other actions
    });
  }
});

