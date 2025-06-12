// ✅ Vehicle MX logic - vehicle_mx.js

window.initVehicleMxForm = async function (formElement) {
  console.log("🔧 vehicle_mx.js loaded");

  const supabase = window.supabase;
  const form = formElement || document.getElementById('addVehicleMxForm');
  if (!form) return;

  const vehicleSelect = form.querySelector('#vehicleSelect');
  const typeSelect = form.querySelector('#vehicleMxTypeSelect');
  const titleWrapper = form.querySelector('#vehicleCustomTitleWrapper');
  const customTitleInput = form.querySelector('#vehicleCustomTitle');
  const saveBtn = form.querySelector('#saveVehicleMxBtn');
  const statusDiv = form.querySelector('#vehicleAddStatus');

  if (!vehicleSelect || !typeSelect || !saveBtn) return;

  vehicleSelect.innerHTML = '<option value="">-- Select Vehicle --</option>';
  typeSelect.innerHTML = '<option value="">-- Select Type --</option>';

  try {
    const { data: vehicles, error: vehicleError } = await supabase.from('vehicles').select('id, year, make, model');
    if (vehicleError) throw vehicleError;
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.year} ${v.make} ${v.model}`;
      vehicleSelect.appendChild(opt);
    });

    const { data: types, error: typeError } = await supabase.from('maintenance_types').select('*').eq('applicable_to', 'Vehicle');
    if (typeError) throw typeError;
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.tracking_type})`;
      typeSelect.appendChild(opt);
    });

    typeSelect.addEventListener('change', () => {
      const selectedType = types.find(t => t.id === typeSelect.value);
      titleWrapper.style.display = selectedType?.name?.toLowerCase()?.includes('custom') ? 'block' : 'none';
    });
  } catch (e) {
    console.error('🔻 Error populating dropdowns:', e);
    statusDiv.textContent = '❌ Failed to load options';
  }

  saveBtn.addEventListener('click', async () => {
    const vehicle_id = form.dataset.vehicleId || vehicleSelect.value;
    const maintenance_type_id = typeSelect.value;
    const custom_title = customTitleInput.value.trim();
    const mx_date = form.querySelector('#vehicleMxDate').value;
    const usage_at_mx = parseFloat(form.querySelector('#vehicleUsage').value);
    const next_due = form.querySelector('#vehicleNextDue').value;
    const alert_threshold = parseFloat(form.querySelector('#vehicleAlertThreshold').value);
    const notes = form.querySelector('#vehicleNotes').value;

    if (!vehicle_id || !maintenance_type_id || !mx_date) {
      statusDiv.textContent = '⚠️ Required fields missing';
      return;
    }

    const { error } = await supabase.from('vehicle_maintenance_items').insert({
      vehicle_id,
      maintenance_type_id,
      custom_title: custom_title || null,
      mx_date,
      usage_at_mx: isNaN(usage_at_mx) ? null : usage_at_mx,
      next_due: next_due || null,
      alert_threshold: isNaN(alert_threshold) ? null : alert_threshold,
      notes
    });

    if (error) {
      console.error('❌ Error adding vehicle MX:', error);
      statusDiv.textContent = '❌ Error saving item';
    } else {
      statusDiv.textContent = '✅ Maintenance item added';
      form.reset();
      form.classList.remove('visible');
    }
  });
};

window.openVehicleMxForm = async function (vehicle) {
  const existingForm = document.getElementById(`mxForm-${vehicle.id}`);
  if (existingForm) {
    existingForm.classList.add('visible');
    existingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const card = document.querySelector(`.card[data-id="${vehicle.id}"]`);
  if (!card) return;

  const form = document.createElement('div');
  form.className = 'add-mx-form visible';
  form.id = `mxForm-${vehicle.id}`;
  form.innerHTML = `
    <h3>Add Maintenance Item</h3>
    <select id="vehicleSelect"></select>
    <select id="vehicleMxTypeSelect"></select>
    <div id="vehicleCustomTitleWrapper" style="display:none">
      <label for="vehicleCustomTitle">Custom Title</label>
      <input type="text" id="vehicleCustomTitle" placeholder="Enter custom title" />
    </div>
    <input type="date" id="vehicleMxDate" placeholder="Maintenance Date" />
    <input type="number" id="vehicleUsage" placeholder="Usage at maintenance" step="0.1" />
    <input type="text" id="vehicleNextDue" placeholder="Next Due (miles/hours/date)" />
    <input type="number" id="vehicleAlertThreshold" placeholder="Alert threshold" />
    <textarea id="vehicleNotes" placeholder="Notes"></textarea>
    <button id="saveVehicleMxBtn">Save Maintenance Item</button>
    <div id="vehicleAddStatus"></div>
  `;

  card.appendChild(form);
  form.dataset.vehicleId = vehicle.id;

  form.querySelector('#vehicleSelect').value = vehicle.id;
  form.querySelector('#vehicleUsage').value = vehicle.usage_metric || '';

  await window.initVehicleMxForm(form);
};