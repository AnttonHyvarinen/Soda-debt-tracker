// Get references to HTML elements
const addUserButton = document.getElementById('addUserButton');
const userModal = document.getElementById('userModal');
const closeModal = document.getElementsByClassName('close')[0];
const cancelButton = document.getElementById('cancelButton');
const userForm = document.getElementById('userForm');
const userTable = document.getElementById('userTable');
const userTableBody = document.getElementById('userTableBody');
const totalDebtDisplay = document.getElementById('totalDebt');

// Delete modal references
const deleteModal = document.getElementById('deleteModal');
const deleteConfirmationText = document.getElementById('deleteConfirmationText');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');
const closeDeleteModal = document.getElementsByClassName('close')[1];

let users = [];
let totalDebt = 0;
let userToDeleteIndex = null;
let userToEditIndex = null; // New variable to track editing
let sortDirection = { name: true, debt: true };  // Tracks sorting direction for columns

// Load users from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsersFromLocalStorage();
});

// Function to open modal for adding or editing a user
addUserButton.onclick = function() {
    userModal.style.display = 'block';
    userToEditIndex = null; // Reset editing when adding a new user
    userForm.reset(); // Clear previous input
    document.getElementById('addNewButton').textContent = "Add User"; // Change button text
    document.getElementById('name').focus(); // Automatically focus on name field
}

// Function to close modal
closeModal.onclick = function() {
    userModal.style.display = 'none';
}
cancelButton.onclick = function() {
    userModal.style.display = 'none';
}
closeDeleteModal.onclick = function() {
    deleteModal.style.display = 'none';
}
cancelDeleteButton.onclick = function() {
    deleteModal.style.display = 'none';
}

// Handle form submission (for both adding and editing)
userForm.onsubmit = function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    let debt = parseFloat(document.getElementById('debt').value);

    if (isNaN(debt)) {
        debt = 0;
    }

    if (userToEditIndex === null) {
        // Add new user
        users.push({ name: name, debt: debt });
    } else {
        // Edit existing user
        users[userToEditIndex].name = name;
        users[userToEditIndex].debt = debt;
        userToEditIndex = null; // Reset after editing
    }

    updateUserTable();
    saveUsersToLocalStorage(); // Save to localStorage

    // Close modal and reset form
    userModal.style.display = 'none';
    userForm.reset();
}

// Function to update the table with user data
function updateUserTable() {
    userTableBody.innerHTML = ''; // Clear the table body

    if (users.length > 0) {
        userTable.style.display = 'table';
    } else {
        userTable.style.display = 'none';
    }

    users.forEach((user, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = user.name;

        // Make name clickable for editing
        nameCell.style.cursor = 'pointer';
        nameCell.classList = "nameCell";
        nameCell.onclick = function() {
            openEditModal(index);  // Open modal for editing when name is clicked
        };

        const debtCell = document.createElement('td');
        debtCell.textContent = user.debt.toFixed(2);

        const increaseButton = document.createElement('button');
        increaseButton.textContent = '+1';
        increaseButton.onclick = function() {
            increaseDebt(index);
        }

        const decreaseButton = document.createElement('button');
        decreaseButton.textContent = '-1';
        decreaseButton.classList = "decrease";
        decreaseButton.onclick = function() {
            decreaseDebt(index);
        }

        const increaseCell = document.createElement('td');
        increaseCell.appendChild(increaseButton);

        const decreaseCell = document.createElement('td');
        decreaseCell.appendChild(decreaseButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.classList = 'delete';

        // Stop propagation when delete button is clicked
        deleteButton.onclick = function(event) {
            event.stopPropagation();  // Prevent row click from being triggered
            showDeleteConfirmationModal(index);
        }

        const deleteCell = document.createElement('td');
        deleteCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(debtCell);
        row.appendChild(increaseCell);
        row.appendChild(decreaseCell);
        row.appendChild(deleteCell);

        userTableBody.appendChild(row);
    });

    updateTotalDebt();
}

// Function to open the modal with existing user details for editing
function openEditModal(index) {
    userToEditIndex = index;  // Store the index of the user being edited
    const user = users[index];

    // Populate form with current user details
    document.getElementById('name').value = user.name;
    document.getElementById('debt').value = user.debt.toFixed(2);

    // Change modal title and button text
    document.getElementById('addNewButton').textContent = "Edit User";

    // Open the modal
    userModal.style.display = 'block';
}

// Function to update the total debt display
function updateTotalDebt() {
    totalDebt = users.reduce((sum, user) => sum + user.debt, 0);
    totalDebtDisplay.querySelector('.debt-value').textContent = `${totalDebt.toFixed(2)} €`;
}

// Function to increase a user's debt by 1
function increaseDebt(index) {
    users[index].debt += 1;
    updateUserTable();
    saveUsersToLocalStorage(); // Save to localStorage after increasing debt
}

// Function to decrease a user's debt by 1
function decreaseDebt(index) {
    if (users[index].debt > 0) {
        users[index].debt -= 1;
        updateUserTable();
        saveUsersToLocalStorage(); // Save to localStorage after decreasing debt
    }
}

// Function to show delete confirmation modal
function showDeleteConfirmationModal(index) {
    userToDeleteIndex = index;
    const user = users[index];
    deleteConfirmationText.textContent = `Are you sure you want to delete ${user.name} and their debt of ${user.debt.toFixed(2)} euros?`;
    deleteModal.style.display = 'block';
}

// Handle delete confirmation
confirmDeleteButton.onclick = function() {
    if (userToDeleteIndex !== null) {
        users.splice(userToDeleteIndex, 1);
        updateUserTable();
        saveUsersToLocalStorage(); // Save to localStorage after deleting
        deleteModal.style.display = 'none';
    }
}

// Function to save users to localStorage
function saveUsersToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Function to load users from localStorage
function loadUsersFromLocalStorage() {
    const storedUsers = JSON.parse(localStorage.getItem('users'));
    if (storedUsers) {
        users = storedUsers;
        updateUserTable(); // Update table with loaded users
    }
}


// Function to sort users by a column (name or debt)
function sortTableBy(column) {
    if (column === 'name') {
        users.sort((a, b) => sortDirection.name ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        sortDirection.name = !sortDirection.name;
    } else if (column === 'debt') {
        users.sort((a, b) => sortDirection.debt ? b.debt - a.debt : a.debt - b.debt);
        sortDirection.debt = !sortDirection.debt;
    }
    updateUserTable();
}

// Add event listeners to table headers for sorting
document.getElementById('nameHeader').onclick = function() {
    sortTableBy('name');
};
document.getElementById('debtHeader').onclick = function() {
    sortTableBy('debt');
};

