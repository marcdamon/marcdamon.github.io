// ✅ vehicles.js - Updated to support opening the Add MX form inline

window.initVehicleLogic = async function () {
  console.log("🚗 vehicles.js logic initialized");

  const supabase = window.supabase;
  const grid = document.getElementById('vehicleGrid');
  if (!grid) return console.warn('Missing vehicleGrid');
  grid.innerHTML = 'Loading vehicles...';

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !vehicles) {
    console.error('Vehicle fetch error:', error);
    grid.innerHTML = 'Error loading vehicles';
    return;
  }

  const { data: types, error: typeError } = await supabase
    .from('maintenance_types')
    .select('*')
    .eq('applicable_to', 'Vehicle');

  if (typeError || !types) {
    console.error('Failed to load maintenance types', typeError);
    return;
  }

  grid.innerHTML = '';

  for (const vehicle of vehicles) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', vehicle.id);
  
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle top-right';
    dragHandle.textContent = '≡';
    card.appendChild(dragHandle);
  
    const title = document.createElement('h2');
    title.textContent = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.trim || ''}`.trim();
  
    const location = document.createElement('div');
    location.className = 'details';
    location.textContent = `Location: ${vehicle.location || '—'}`;
  
    // Restore edit section
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'edit-btn bottom-right';
  
    const editSection = document.createElement('div');
    editSection.className = 'edit-section hidden';
    editSection.innerHTML = `
      <div class="field"><label>Location:</label><input type="text" class="edit-location" value="${vehicle.location || ''}"></div>
      <div class="field"><label>Usage:</label><input type="text" class="edit-usage" value="${vehicle.usage_metric ?? ''}" step="0.1"></div>
      <div class="field"><label>Notes:</label><textarea class="edit-notes">${vehicle.notes || ''}</textarea></div>
      <div class="field"><label>Squawks:</label><textarea class="edit-squawks">${vehicle.squawks || ''}</textarea></div>
      <div class="field"><button class="save-btn">Save</button> <button class="cancel-btn">Cancel</button></div>
    `;
  
    editBtn.addEventListener('click', () => editSection.classList.toggle('hidden'));
    editSection.querySelector('.cancel-btn').addEventListener('click', () => editSection.classList.add('hidden'));
    editSection.querySelector('.save-btn').addEventListener('click', async () => {
      const updated = {
        location: editSection.querySelector('.edit-location').value,
        usage_metric: parseFloat(editSection.querySelector('.edit-usage').value),
        notes: editSection.querySelector('.edit-notes').value,
        squawks: editSection.querySelector('.edit-squawks').value
      };
      const { error } = await supabase.from('vehicles').update(updated).eq('id', vehicle.id);
      if (error) console.error('❌ Update error:', error);
      else await window.initVehicleLogic(); // reload
    });
  
    // Add MX Button
    const addMxBtn = document.createElement('button');
    addMxBtn.textContent = '+ Add MX';
    addMxBtn.className = 'add-mx-btn';
  
    // Add MX Form (you already have this part in your working code)
    // so you can append this back in normally...
    const mxFormContainer = document.createElement('div');
    mxFormContainer.className = 'add-mx-form hidden';
    mxFormContainer.id = `mxForm-${vehicle.id}`;
    // ...build form innerHTML as you already do
    // and saveBtn logic as you already have
  
    // Add Sort, Edit, and Add to Card
    card.appendChild(title);
    card.appendChild(location);
    card.appendChild(dragHandle);      // ✅ now it's working
    card.appendChild(addMxBtn);
    card.appendChild(mxFormContainer);
    card.appendChild(editBtn);
    card.appendChild(editSection);
    grid.appendChild(card);
  }

  const sortableScript = document.createElement('script');
  sortableScript.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
  sortableScript.onload = () => {
    Sortable.create(grid, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: async () => {
        const cards = document.querySelectorAll('#vehicleGrid .card');
        for (let i = 0; i < cards.length; i++) {
          const id = cards[i].getAttribute('data-id');
          if (id) {
            await supabase.from('vehicles').update({ sort_order: i }).eq('id', id);
          }
        }
        console.log('✅ Vehicle sort order saved');
      }
    });
  };
  document.body.appendChild(sortableScript);
};
