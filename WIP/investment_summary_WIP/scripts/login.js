document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const staticUsername = 'admin';
  const staticPassword = 'password123';

  const enteredUsername = document.getElementById('username').value;
  const enteredPassword = document.getElementById('password').value;

  if (enteredUsername === staticUsername && enteredPassword === staticPassword) {
    window.location.href = '../dashboard.html';
  } else {
    document.getElementById('error').textContent = 'Invalid username or password.';
  }
});
