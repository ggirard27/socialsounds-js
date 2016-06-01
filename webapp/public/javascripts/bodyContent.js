// To set the correct active link in the navigation bar
var currentPage = document.location.pathname.split("/");
if (currentPage[1] === 'player') {
    document.getElementById('playerLink').className += " active";
}
else if (currentPage[1] === 'remote') {
    document.getElementById('remoteLink').className += " active";
}
else if (currentPage[1] === 'profile') {
    document.getElementById('profileLink').className += " active";
}
