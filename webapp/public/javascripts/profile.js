var editUsername = document.getElementById('editUsername');
var editUsernameBtn = document.getElementById('editUsernameBtn');
var editUsernameSaveBtn = document.getElementById('editUsernameSaveBtn');
var usernameSpan = document.getElementById('usernameSpan');


editUsernameBtn.addEventListener('click', function () {
    editUsernameBtn.style.display = "none";
    usernameSpan.style.display = "none";
    editUsername.style.display = "table";
});

editUsernameSaveBtn.addEventListener('click', function () {
    editUsername.style.display = "none";
    editUsernameBtn.style.display = "inline-block";
    usernameSpan.style.display = "inline-block";
    event.preventDefault();

    //TODO(emile): Save the data to the DB
});