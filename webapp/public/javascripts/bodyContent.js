// To set the correct active link in the navigation bar
if (document.location.pathname === '/player') {
    document.getElementById('playerLink').className += " active";
}
else if (document.location.pathname === '/profile') {
    document.getElementById('profileLink').className += " active";
}
