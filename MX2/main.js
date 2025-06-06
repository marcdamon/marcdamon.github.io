// ✅ Define shared Supabase client globally BEFORE anything else
if (!window.supabase || !window.supabase.from) {
    window.supabase = window.supabase.createClient(
      'https://htapkhvxskvqidtugegq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXBraHZ4c2t2cWlkdHVnZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTEyMjMsImV4cCI6MjA2MzUyNzIyM30.m1VLqQwi_Ch_VbbGm4rzvMguxH7YXn5gExmgYPDqFXU'
    );
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    console.log("✅ main.js is running");
  
    // Sidebar toggle
    document.getElementById('toggleSidebar').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');
    });
  
    // View switching logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = {
      aircraft: document.getElementById('aircraftView'),
      vehicles: document.getElementById('vehiclesView'),
      personal: document.getElementById('personalView'),
    };
  
    function switchView(view) {
      Object.keys(views).forEach(key => {
        views[key].style.display = key === view ? 'block' : 'none';
      });
  
      const header = document.querySelector('.header h1');
      if (header) {
        header.textContent =
          view === 'vehicles' ? 'Vehicles' :
          view === 'personal' ? 'Personal Items' : 'Aircraft';
      }
  
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
      }
  
      // Load per-view JS
      if (view === 'aircraft' && typeof window.initAircraftLogic === 'function') {
        window.initAircraftLogic();
      } else if (view === 'vehicles' && typeof window.initVehicleLogic === 'function') {
        window.initVehicleLogic();
      } else if (view === 'personal' && typeof window.initPersonalLogic === 'function') {
        window.initPersonalLogic();
      }
    }
  
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });
  
    switchView('aircraft'); // Default load
  });