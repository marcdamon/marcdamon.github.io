// ✅ vehicles.js - Enhanced UI for Option B with sortable cards, inline edit, MX form, and styled history

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

    const title = document.createElement('h2');
    title.textContent = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.trim || ''}`.trim();

    const location = document.createElement('div');
    location.className = 'details';
    location.textContent = `Location: ${vehicle.location || '—'}`;

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
      else await window.initVehicleLogic();
    });

    const mxHistoryBtn = document.createElement('button');
    mxHistoryBtn.textContent = 'Show MX History';
    mxHistoryBtn.className = 'add-mx-btn';

    const mxHistory = document.createElement('div');
    mxHistory.className = 'mx-history hidden';

    const { data: mxItems, error: mxErr } = await supabase
      .from('vehicle_maintenance_items')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('next_service_due_date', { ascending: true });

    if (mxErr) console.error('❌ Failed to load MX for vehicle', vehicle.id);

    (mxItems || []).forEach(item => {
      const row = document.createElement('div');
      row.className = 'mx-row';
      row.innerHTML = `
        <div><strong>${item.title}</strong> (${item.due_type})</div>
        <div>Done: ${item.last_completed_date || '—'}</div>
        <div>Next: ${item.next_service_due_date || item.next_service_due_at || '—'}</div>
      `;
      mxHistory.appendChild(row);
    });

    mxHistoryBtn.addEventListener('click', () => {
      mxHistory.classList.toggle('hidden');
      mxHistoryBtn.textContent = mxHistory.classList.contains('hidden') ? 'Show MX History' : 'Hide MX History';
    });

    const addMxBtn = document.createElement('button');
    addMxBtn.textContent = '+ Add MX';
    addMxBtn.className = 'add-mx-btn';

    const mxFormContainer = document.createElement('div');
    mxFormContainer.className = 'add-mx-form hidden';
    mxFormContainer.id = `mxForm-${vehicle.id}`;

    const formHTML = `
      <h3>Add Maintenance</h3>
      <select class="vehicle-mx-type"></select>
      <div class="custom-title-wrapper" style="display: none;">
        <label>Custom Title</label>
        <input type="text" class="vehicle-custom-title" placeholder="Enter custom title">
      </div>
      <input type="date" class="vehicle-mx-date" style="display: none;" />
      <input type="number" class="vehicle-usage" placeholder="Usage at maintenance" step="0.1" />
      <input type="date" class="vehicle-next-due-date" style="display: none;" />
      <input type="text" class="vehicle-next-due-text" placeholder="Next Due (miles/hours)" />
      <input type="number" class="vehicle-alert-threshold" placeholder="Alert threshold" />
      <textarea class="vehicle-notes" placeholder="Notes"></textarea>
      <button class="vehicle-save-btn">Save Maintenance Item</button>
      <div class="vehicle-add-status"></div>
    `;
    mxFormContainer.innerHTML = formHTML;

    const typeSelect = mxFormContainer.querySelector('.vehicle-mx-type');
    const dateInput = mxFormContainer.querySelector('.vehicle-mx-date');
    const titleWrapper = mxFormContainer.querySelector('.custom-title-wrapper');
    const nextDueDate = mxFormContainer.querySelector('.vehicle-next-due-date');
    const nextDueText = mxFormContainer.querySelector('.vehicle-next-due-text');

    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.tracking_type})`;
      typeSelect.appendChild(opt);
    });

    typeSelect.addEventListener('change', () => {
      const selected = types.find(t => t.id === typeSelect.value);
      const isCustom = selected?.name?.toLowerCase()?.includes('custom');
      const isCalendar = selected?.tracking_type === 'calendar';

      titleWrapper.style.display = isCustom ? 'block' : 'none';
      dateInput.style.display = 'block';
      nextDueDate.style.display = isCalendar ? 'block' : 'none';
      nextDueText.style.display = isCalendar ? 'none' : 'block';
    });

    const saveBtn = mxFormContainer.querySelector('.vehicle-save-btn');
    saveBtn.addEventListener('click', async () => {
      const typeId = typeSelect.value;
      const selected = types.find(t => t.id === typeId);
      const isCalendar = selected?.tracking_type === 'calendar';
      const isMileageOrHours = ['mileage', 'hours'].includes(selected?.tracking_type);

      const customTitle = mxFormContainer.querySelector('.vehicle-custom-title').value.trim();
      const mxDate = mxFormContainer.querySelector('.vehicle-mx-date').value;
      const usage = parseFloat(mxFormContainer.querySelector('.vehicle-usage').value);
      const threshold = parseInt(mxFormContainer.querySelector('.vehicle-alert-threshold').value);
      const notes = mxFormContainer.querySelector('.vehicle-notes').value;
      const statusDiv = mxFormContainer.querySelector('.vehicle-add-status');

      const nextServiceDueAt = isMileageOrHours
        ? parseInt(mxFormContainer.querySelector('.vehicle-next-due-text').value)
        : null;

      const nextServiceDueDate = isCalendar
        ? mxFormContainer.querySelector('.vehicle-next-due-date').value || null
        : null;

      if (!typeId || !mxDate) {
        statusDiv.textContent = '⚠️ Required fields missing';
        return;
      }

      const title = customTitle || selected?.name || 'Untitled';

      const payload = {
        vehicle_id: vehicle.id,
        maintenance_type_id: selected?.id,
        due_type: selected?.tracking_type,
        title,
        custom_title: customTitle || null,
        last_completed_date: mxDate,
        last_completed_usage: isNaN(usage) ? null : Math.round(usage),
        next_service_due_at: isNaN(nextServiceDueAt) ? null : nextServiceDueAt,
        next_service_due_date: nextServiceDueDate,
        alert_threshold: isNaN(threshold) ? null : threshold,
        is_active: true,
        notes: notes || null
      };

      const { error } = await supabase
        .from('vehicle_maintenance_items')
        .insert(payload);

      statusDiv.textContent = error ? '❌ Error saving: ' + error.message : '✅ Saved';
      if (!error) mxFormContainer.classList.add('hidden');
    });

    addMxBtn.addEventListener('click', () => {
      mxFormContainer.classList.toggle('hidden');
    });

    card.appendChild(dragHandle);
    card.appendChild(title);
    card.appendChild(location);
    card.appendChild(addMxBtn);
    card.appendChild(mxFormContainer);
    card.appendChild(mxHistoryBtn);
    card.appendChild(mxHistory);
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
