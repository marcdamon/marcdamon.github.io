window.addEventListener('load', () => {
    gapiLoaded();
    gisLoaded();
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const flightHours = document.getElementById('flightHours').value;
            console.log("Update form submitted.");
            updateFlightHours(flightHours);
        });
    } else {
        console.error('Element with ID updateForm not found');
    }
});

function adjustSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu) {
        if (window.innerWidth >= 768) {
            sidebarMenu.style.width = '250px';
        } else {
            sidebarMenu.style.width = '0';
        }
    } else {
        console.error('Element with ID sidebarMenu not found');
    }
}

function toggleSidebarMenu() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu) {
        if (sidebarMenu.style.width === '250px') {
            sidebarMenu.style.width = '0';
        } else {
            sidebarMenu.style.width = '250px';
        }
    } else {
        console.error('Element with ID sidebarMenu not found');
    }
}
