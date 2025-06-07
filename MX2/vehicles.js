// vehicles.js

window.initVehicleLogic = async function () {
    console.log("🚗 vehicles.js logic initialized");
  
    const supabase = window.supabase;
    const header = document.querySelector('#vehiclesView .header');
    const grid = document.getElementById('vehicleGrid'); // make sure this exists in HTML
  
    if (!grid || !header) {
      console.warn('Vehicle grid or header missing');
      return;
    }
  
    grid.innerHTML = '<p style="color:#888; text-align:center;">Loading...</p>';
  
    const { data: vehicles, error } = await supabase.from('vehicles').select('*');
    if (error || !vehicles || vehicles.length === 0) {
      grid.innerHTML = '<p style="color:#888; text-align:center;">No vehicles found.</p>';
      return;
    }
  
    grid.innerHTML = ''; // clear loading state
  
    vehicles.forEach(vehicle => {
      const card = document.createElement('div');
      card.className = 'card';
  
      const title = document.createElement('h2');
      title.textContent = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.trim || ''}`.trim();
  
      const location = document.createElement('div');
      location.className = 'details';
      location.textContent = `Location: ${vehicle.location || '—'}`;
  
      card.appendChild(title);
      card.appendChild(location);
      grid.appendChild(card);
    });
  };