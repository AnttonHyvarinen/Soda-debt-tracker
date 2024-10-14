// Get references to HTML elements
const addUserButton = document.getElementById('addUserButton');
const userModal = document.getElementById('userModal');
const closeModal = document.getElementsByClassName('close')[0];
const cancelButton = document.getElementById('cancelButton');
const userForm = document.getElementById('userForm');
const userTable = document.getElementById('userTable');
const userTableBody = document.getElementById('userTableBody');
const totalDebtDisplay = document.getElementById('totalDebt');
const searchInput = document.getElementById('searchInput'); // Get the search input element

// Delete modal references
const deleteModal = document.getElementById('deleteModal');
const deleteConfirmationText = document.getElementById('deleteConfirmationText');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');
const closeDeleteModal = document.getElementsByClassName('close')[1];

let users = [];
let lastActiveUser = null;  // Variable to track last active user
let totalDebt = 0;
let userToDeleteIndex = null;
let userToEditIndex = null; // New variable to track editing
let sortDirection = { name: true, debt: true };  // Tracks sorting direction for columns


// Load users and last active user from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsersFromLocalStorage();
    loadLastActiveUserFromLocalStorage();  // Load last active user
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
    let currentTime = new Date().getTime();  // Get current timestamp

    if (isNaN(debt)) {
        debt = 0;
    }

    if (userToEditIndex === null) {
        // Add new user with current timestamp
        users.push({ name: name, debt: debt, lastUpdated: currentTime });
        lastActiveUser = name;  // Set the newly added user as last active user
    } else {
        // Edit existing user and update timestamp
        users[userToEditIndex].name = name;
        users[userToEditIndex].debt = debt;
        users[userToEditIndex].lastUpdated = currentTime;  // Update timestamp
        lastActiveUser = users[userToEditIndex].name;  // Set the edited user as last active user
        userToEditIndex = null; // Reset after editing
    }

    updateUserTable();
    saveUsersToLocalStorage();  // Save to localStorage
    displayLastActiveUser();  // Update the last active user display

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

        // Display "last update" in a new cell
        const lastUpdateCell = document.createElement('td');
        lastUpdateCell.textContent = formatLastUpdated(user.lastUpdated);  // Format last updated time

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
        deleteButton.textContent = 'Delete';
        deleteButton.classList = 'delete';

        // Stop propagation when delete button is clicked
        deleteButton.onclick = function(event) {
            event.stopPropagation();  // Prevent row click from being triggered
            showDeleteConfirmationModal(index);
        }

        const deleteCell = document.createElement('td');
        deleteCell.appendChild(deleteButton);

        // Append all cells to the row
        row.appendChild(nameCell);
        row.appendChild(debtCell);
        row.appendChild(lastUpdateCell);  // Append last update cell
        row.appendChild(increaseCell);
        row.appendChild(decreaseCell);
        row.appendChild(deleteCell);

        userTableBody.appendChild(row);
    });

    updateTotalDebt();
}

// Function to format the "last updated" timestamp
function formatLastUpdated(timestamp) {
    const currentTime = new Date().getTime();
    const differenceInMinutes = Math.floor((currentTime - timestamp) / 60000);  // Convert to minutes

    if (differenceInMinutes < 1) {
        return "just now";
    } else if (differenceInMinutes < 60) {
        return `${differenceInMinutes} minutes ago`;
    } else if (differenceInMinutes < 1440) {  // Less than a day
        const hours = Math.floor(differenceInMinutes / 60);
        return `${hours} hours ago`;
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
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
    userModal.style.display = 'block';

    lastActiveUser = users[index].name;  // Update the last active user
    displayLastActiveUser();  // Update the display of last active user
}

// Function to update the total debt display
function updateTotalDebt() {
    totalDebt = users.reduce((sum, user) => sum + user.debt, 0);
    totalDebtDisplay.querySelector('.debt-value').textContent = `${totalDebt.toFixed(2)} €`;
}

// Function to increase a user's debt by 1
function increaseDebt(index) {
    users[index].debt += 1;
    users[index].lastUpdated = new Date().getTime();  // Update timestamp
    lastActiveUser = users[index].name;  // Update the last active user
    updateUserTable();
    saveUsersToLocalStorage();  // Save to localStorage after increasing debt
    displayLastActiveUser();  // Update the last active user display
}

// Function to decrease a user's debt by 1
function decreaseDebt(index) {
    if (users[index].debt > 0) {
        users[index].debt -= 1;
        users[index].lastUpdated = new Date().getTime();  // Update timestamp
        lastActiveUser = users[index].name;  // Update the last active user
        updateUserTable();
        saveUsersToLocalStorage();  // Save to localStorage after decreasing debt
        displayLastActiveUser();  // Update the last active user display
    }
}

// Function to show delete confirmation modal
function showDeleteConfirmationModal(index) {
    userToDeleteIndex = index;
    const user = users[index];
    // Wrap user name in a span with a class to highlight it
    deleteConfirmationText.innerHTML = `Are you sure you want to delete <span class="highlight">${user.name}</span> and their debt of <span class="debtHighlight"> ${user.debt.toFixed(2)}</span> euros?`;
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

// Function to save users and last active user to localStorage
function saveUsersToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('lastActiveUser', JSON.stringify(lastActiveUser));  // Save last active user
}

// Function to load users from localStorage
function loadUsersFromLocalStorage() {
    const storedUsers = JSON.parse(localStorage.getItem('users'));
    if (storedUsers) {
        users = storedUsers;
        updateUserTable();  // Update table with loaded users
    }
}

// Function to load last active user from localStorage
function loadLastActiveUserFromLocalStorage() {
    const storedLastActiveUser = JSON.parse(localStorage.getItem('lastActiveUser'));
    if (storedLastActiveUser) {
        lastActiveUser = storedLastActiveUser;
        displayLastActiveUser();  // Display the last active user when loaded
    }
}

// Function to display last active user
function displayLastActiveUser() {
    const lastActiveUserDisplay = document.querySelector('#lastActiveUser .last-user');
    if (lastActiveUser) {
        lastActiveUserDisplay.textContent = lastActiveUser;  // Update with the latest active user
    } else {
        lastActiveUserDisplay.textContent = 'None';  // Fallback if no user is active
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

// Debounce search input to filter users
let debounceTimer;
searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase();
        filterUsers(searchTerm);
    }, 300);  // 300ms delay for better performance
});

// Filter users based on search input
function filterUsers(searchTerm) {
    const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm));
    updateFilteredUserTable(filteredUsers);
}

// Function to update the table with filtered user data
function updateFilteredUserTable(filteredUsers) {
    userTableBody.innerHTML = '';  // Clear the table body

    if (filteredUsers.length > 0) {
        userTable.style.display = 'table';
    } else {
        userTable.style.display = 'none';
    }

    filteredUsers.forEach((user, filteredIndex) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = user.name;
        nameCell.classList = "nameCell";
        nameCell.style.cursor = 'pointer';

        // Make name clickable for editing
        nameCell.onclick = function() {
            openEditModal(findOriginalUserIndex(user.name));  // Use the correct index from the original list
        };

        const debtCell = document.createElement('td');
        debtCell.textContent = user.debt.toFixed(2);

        const lastUpdateCell = document.createElement('td');
        lastUpdateCell.textContent = formatLastUpdated(user.lastUpdated);  // Make sure this cell is included

        const increaseButton = document.createElement('button');
        increaseButton.textContent = '+1';
        increaseButton.onclick = function() {
            increaseDebt(findOriginalUserIndex(user.name));
        };

        const decreaseButton = document.createElement('button');
        decreaseButton.textContent = '-1';
        decreaseButton.classList = "decrease";
        decreaseButton.onclick = function() {
            decreaseDebt(findOriginalUserIndex(user.name));
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList = 'delete';

        // Stop propagation when delete button is clicked
        deleteButton.onclick = function(event) {
            event.stopPropagation();
            showDeleteConfirmationModal(findOriginalUserIndex(user.name));
        };

        row.appendChild(nameCell);
        row.appendChild(debtCell);
        row.appendChild(lastUpdateCell);  // Ensure last updated info is added back
        row.appendChild(increaseButton);
        row.appendChild(decreaseButton);
        row.appendChild(deleteButton);

        userTableBody.appendChild(row);
    });
}

// Helper function to find the original index of a user by name
function findOriginalUserIndex(name) {
    return users.findIndex(user => user.name === name);
}