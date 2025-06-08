// vehicles.js

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
  
    grid.innerHTML = '';
  
    vehicles.forEach(vehicle => {
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
  
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn bottom-right';
      editBtn.textContent = '✏️';
  
      const editSection = document.createElement('div');
      editSection.className = 'edit-section hidden';
      editSection.innerHTML = `
        <div class="field"><label>Location:</label><input type="text" class="edit-location" value="${vehicle.location || ''}"></div>
        <div class="field">
          <label>${vehicle.usage_metric_type === 'miles' ? 'Miles' : 'Hours'}:</label>
          <input type="text" class="edit-usage" value="${(vehicle.usage_metric ?? '').toLocaleString()}" step="0.1">
        </div>
        <div class="field"><label>Notes:</label><textarea class="edit-notes">${vehicle.notes || ''}</textarea></div>
        <div class="field"><label>Squawks:</label><textarea class="edit-squawks">${vehicle.squawks || ''}</textarea></div>
        <div class="field"><label>Upload Files:</label><input type="file" class="upload-files" multiple></div>
        <div class="field file-list"></div>
        <div class="field"><button class="save-btn">Save</button> <button class="cancel-btn">Cancel</button></div>
        <button class="delete-btn" style="color:#f66;">Delete Vehicle</button>
      `;
  
      editBtn.addEventListener('click', () => editSection.classList.toggle('hidden'));
      editSection.querySelector('.cancel-btn').addEventListener('click', () => editSection.classList.add('hidden'));
  
      editSection.querySelector('.save-btn').addEventListener('click', async () => {
        const updated = {
          location: editSection.querySelector('.edit-location').value,
          usage_metric: parseFloat(editSection.querySelector('.edit-usage').value.replace(/,/g, '')),
          notes: editSection.querySelector('.edit-notes').value,
          squawks: editSection.querySelector('.edit-squawks').value,
        };
  
        const { error } = await supabase.from('vehicles').update(updated).eq('id', vehicle.id);
        if (error) console.error('Failed to update vehicle:', error);
        else await window.initVehicleLogic();
      });
  
      editSection.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this vehicle?')) {
          const { error } = await supabase.from('vehicles').delete().eq('id', vehicle.id);
          if (error) {
            console.error('❌ Failed to delete vehicle:', error);
          } else {
            console.log('✅ Vehicle deleted');
            await window.initVehicleLogic();
          }
        }
      });
  
      const uploadInput = editSection.querySelector('.upload-files');
      const fileListDiv = editSection.querySelector('.file-list');
  
      uploadInput.addEventListener('change', async () => {
        const files = uploadInput.files;
        if (!files.length) return;
  
        for (const file of files) {
          const path = `${vehicle.vin || vehicle.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage.from('vehicle_files').upload(path, file);
  
          if (!uploadError) {
            const { error: insertError } = await supabase.from('vehicle_files').insert({
              vehicle_id: vehicle.id,
              filename: file.name,
              filepath: path,
            });
            if (insertError) console.error('Insert failed:', insertError);
          } else {
            console.error('Upload failed:', uploadError);
          }
        }
  
        alert('Files uploaded successfully.');
        await window.initVehicleLogic();
      });
  
      (async () => {
        const { data: files } = await supabase.from('vehicle_files').select('*').eq('vehicle_id', vehicle.id);
        if (files && files.length) {
          files.forEach(file => {
            const fileLink = document.createElement('a');
            fileLink.href = supabase.storage.from('vehicle_files').getPublicUrl(file.filepath).data.publicUrl;
            fileLink.target = '_blank';
            fileLink.textContent = file.filename;
            fileLink.style.display = 'block';
            fileListDiv.appendChild(fileLink);
          });
        }
      })();
  
      card.appendChild(title);
      card.appendChild(location);
      card.appendChild(editBtn);
      card.appendChild(editSection);
      grid.appendChild(card);
    });
  
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