window.addEventListener('load', () => {
    gapiLoaded();
    gisLoaded();
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded.");
});

document.getElementById('updateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Update form submitted.");
    updateFlightHours();
});

function adjustSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (window.innerWidth >= 768) {
        sidebarMenu.style.width = '250px';
    } else {
        sidebarMenu.style.width = '0';
    }
}

function toggleSidebarMenu() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu.style.width === '250px') {
        sidebarMenu.style.width = '0';
    } else {
        sidebarMenu.style.width = '250px';
    }
}
