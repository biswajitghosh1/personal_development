document.addEventListener('DOMContentLoaded', function () {
    const loginSection = document.getElementById('login-section');
    const budgetSection = document.getElementById('budget-section');
    const trackerSection = document.getElementById('tracker-section');
    const loginBtn = document.getElementById('login-btn');
    const createBudgetBtn = document.getElementById('create-budget-btn');

    loginBtn.addEventListener('click', function () {
        // Basic login logic (replace with actual authentication)
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'user' && password === 'password') {
            loginSection.style.display = 'none';
            budgetSection.style.display = 'block';
        } else {
            alert('Invalid credentials');
        }
    });

    createBudgetBtn.addEventListener('click', function () {
        // Basic budget creation logic
        const budgetAmount = document.getElementById('budget-amount').value;

        if (budgetAmount > 0) {
            budgetSection.style.display = 'none';
            trackerSection.style.display = 'block';
            alert('Budget created successfully!');
        } else {
            alert('Please enter a valid budget amount');
        }
    });
});