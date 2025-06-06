// ✅ Stable working JS with conditional custom_title field, sort, alerts, and LLP/Misc support

window.addEventListener('DOMContentLoaded', () => {
    console.log("✅ main.js is running");
  
    const supabase = window.supabase.createClient(
      'https://htapkhvxskvqidtugegq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXBraHZ4c2t2cWlkdHVnZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTEyMjMsImV4cCI6MjA2MzUyNzIyM30.m1VLqQwi_Ch_VbbGm4rzvMguxH7YXn5gExmgYPDqFXU'
    );
  
    let currentAircraftId = null;
    let maintenanceTypes = [];
    let currentFlightHours = 0;
    let resetTimeout = null;
  
    function getDateDifferenceString(fromDate, toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      let years = to.getFullYear() - from.getFullYear();
      let months = to.getMonth() - from.getMonth();
      let days = to.getDate() - from.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const parts = [];
      if (years) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
      if (days || (!years && !months)) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
      return parts.join(', ');
    }
  
    async function loadAircraft() {
      const { data, error } = await supabase.from('assets').select('*').eq('type', 'Aircraft');
      if (error || !data) return console.error('Error loading aircraft:', error);
      const select = document.getElementById('aircraftSelect');
      select.innerHTML = '<option value="">-- Select Aircraft --</option>';
      data.forEach(ac => {
        const option = document.createElement('option');
        option.value = ac.id;
        option.textContent = `${ac.n_number} (${ac.make} ${ac.model})`;
        select.appendChild(option);
      });
      select.addEventListener('change', onAircraftChange);
      if (data.length > 0) {
        currentAircraftId = data[0].id;
        select.value = currentAircraftId;
        await onAircraftChange();
      }
    }
  
    async function loadMaintenanceTypes() {
        const { data, error } = await supabase.from('maintenance_types').select('*');
        if (error) {
          console.error('Error loading maintenance types:', error);
          return;
        }
      
        maintenanceTypes = data || [];
        const select = document.getElementById('mxTypeSelect');
        select.innerHTML = '<option value="">-- Select Type --</option>';
      
        data.forEach(type => {
          const option = document.createElement('option');
          option.value = type.id;
          option.textContent = `${type.name} (${type.category})`;
          select.appendChild(option);
        });
      
        // 🔄 Listen for dropdown changes to toggle custom title input
        select.addEventListener('change', (e) => {
          const selectedType = maintenanceTypes.find(t => t.id === e.target.value);
          const selectedTypeCategory = selectedType?.category?.toLowerCase() || '';
          const selectedTypeName = selectedType?.name?.toLowerCase() || '';
      
          const shouldShowCustomTitle = 
            ['llp', 'misc'].includes(selectedTypeCategory) || 
            selectedTypeName.includes('custom');
      
          const wrapper = document.getElementById('customTitleWrapper');
          if (wrapper) {
            wrapper.style.display = shouldShowCustomTitle ? 'block' : 'none';
          }
        });
      }
  
    async function onAircraftChange(e) {
      if (e?.target?.value) currentAircraftId = e.target.value;
      if (!currentAircraftId) return;
  
      const { data: aircraftData } = await supabase.from('assets').select('flight_hours').eq('id', currentAircraftId).single();
      currentFlightHours = aircraftData?.flight_hours || 0;
      document.getElementById('flightHoursStatus').textContent = `Current Flight Hours: ${currentFlightHours.toFixed(1)}`;
  
      const { data: mxItems } = await supabase
        .from('maintenance_items')
        .select('*, maintenance_types(name, category)')
        .eq('asset_id', currentAircraftId)
        .order('sort_order', { ascending: true });
  
      const grid = document.getElementById('cardGrid');
      grid.innerHTML = '';
      const today = new Date();
  
      // === Replace your mxItems.forEach block with this ===
const categorized = {
    MX: [],
    LLP: [],
    Misc: [],
  };
  
  mxItems.forEach(item => {
    const cat = item.maintenance_types?.category || 'Misc';
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(item);
  });
  
  for (const category of ['MX', 'LLP', 'Misc']) {
    if (!categorized[category].length) continue;
  
    const header = document.createElement('h3');
    header.textContent =
      category === 'MX' ? 'General Maintenance'
      : category === 'LLP' ? 'Life Limited Parts'
      : 'Miscellaneous Items';
    header.className = 'tile-section-header';
    grid.appendChild(header);
  
    categorized[category].forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-id', item.id);
  
      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle top-right';
      dragHandle.textContent = '≡';
      card.appendChild(dragHandle);
  
      const title = document.createElement('h2');
      title.textContent = item.custom_title || item.maintenance_types?.name || 'Unknown Type';
  
      const info = document.createElement('div');
      info.className = 'due';
      const due = item.next_service_due_date || item.next_service_due_at || 'N/A';
      info.textContent = `Due: ${due}`;
  
      const extra = document.createElement('div');
      extra.className = 'details';
      const isHours = item.due_type?.toLowerCase() === 'hours';
      const isDate = item.due_type?.toLowerCase() === 'date';
      const alert = item.alert_threshold || 30;
      let remainingText = '';
      let status = 'ok';
  
      if (isHours && item.next_service_due_at) {
        const remaining = item.next_service_due_at - currentFlightHours;
        if (remaining < 0) status = 'overdue';
        else if (remaining <= alert) status = 'soon';
        remainingText = remaining >= 0 ? `Next Due In: ${remaining.toFixed(1)} hours` : `Overdue by ${Math.abs(remaining).toFixed(1)} hours`;
      } else if (isDate && item.next_service_due_date) {
        const dueDate = new Date(item.next_service_due_date);
        const days = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) status = 'overdue';
        else if (days <= alert) status = 'soon';
        const direction = days >= 0 ? 'Due in:' : 'Overdue by:';
        remainingText = `${direction} ${getDateDifferenceString(new Date(), dueDate)}`;
      }
  
      extra.textContent = remainingText || '—';
  
      const progress = document.createElement('div');
      progress.className = 'alert-bar';
      const fill = document.createElement('div');
      fill.className = `alert-fill ${status}`;
      progress.appendChild(fill);
  
      const pill = document.createElement('div');
      pill.className = 'pill';
      pill.textContent = 'Active';
  
      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.className = 'edit-btn bottom-right';
      card.appendChild(editBtn);
  
      const showCustomTitle = item.custom_title || ['LLP', 'Misc'].includes(item.maintenance_types?.category);
      const editSection = document.createElement('div');
      editSection.className = 'edit-section hidden';
      editSection.innerHTML = `
        ${showCustomTitle ? `<div class="field"><label>Custom Title:</label><input type="text" value="${item.custom_title || ''}" class="edit-custom-title"></div>` : ''}
        <div class="field"><label>Date of Last MX:</label><input type="date" value="${item.mx_date || ''}" class="edit-date"></div>
        <div class="field"><label>Flight Hours at Last MX:</label><input type="number" value="${item.mx_flight_hours || ''}" step="0.1" class="edit-hours"></div>
        <div class="field" ${isHours ? '' : 'style="display:none"'}><label>Next MX Due at Flight Hours:</label><input type="text" value="${item.next_service_due_at || ''}" class="edit-next-hours"></div>
        <div class="field" ${isDate ? '' : 'style="display:none"'}><label>Next MX Due Date:</label><input type="date" value="${item.next_service_due_date || ''}" class="edit-next-date"></div>
        <div class="field"><label>Alert Threshold:</label><input type="number" value="${item.alert_threshold ?? ''}" class="edit-alert-threshold"></div>
        <div class="field"><label>Squawks / Notes:</label><textarea class="edit-squawks">${item.squawks || ''}</textarea></div>
        <div class="field"><button class="save-btn">Save</button><button class="delete-btn">Delete</button><button class="cancel-btn">Cancel</button></div>
      `;
  
      editBtn.addEventListener('click', () => editSection.classList.toggle('hidden'));
      editSection.querySelector('.cancel-btn').addEventListener('click', () => editSection.classList.add('hidden'));
  
      editSection.querySelector('.save-btn').addEventListener('click', async () => {
        const alertValue = parseFloat(editSection.querySelector('.edit-alert-threshold').value);
        const customTitleInput = editSection.querySelector('.edit-custom-title');
        const updated = {
          custom_title: customTitleInput ? customTitleInput.value : null,
          mx_date: editSection.querySelector('.edit-date').value,
          mx_flight_hours: parseFloat(editSection.querySelector('.edit-hours').value),
          next_service_due_at: parseFloat(editSection.querySelector('.edit-next-hours').value),
          next_service_due_date: editSection.querySelector('.edit-next-date').value || null,
          squawks: editSection.querySelector('.edit-squawks').value,
          alert_threshold: isNaN(alertValue) ? null : alertValue
        };
        const { error } = await supabase.from('maintenance_items').update(updated).eq('id', item.id);
        if (error) console.error('❌ Failed to update maintenance item:', error);
        else await onAircraftChange();
      });
  
      editSection.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this maintenance item?')) {
          await supabase.from('maintenance_items').delete().eq('id', item.id);
          await onAircraftChange();
        }
      });
  
      card.appendChild(title);
      card.appendChild(info);
      card.appendChild(extra);
      card.appendChild(progress);
      card.appendChild(pill);
      card.appendChild(editSection);
      grid.appendChild(card);
  });
  }}
  
    async function refreshFlightHours() {
      const { data } = await supabase.from('assets').select('flight_hours').eq('id', currentAircraftId).single();
      currentFlightHours = data?.flight_hours || 0;
      document.getElementById('flightHoursStatus').textContent = `Current Flight Hours: ${currentFlightHours.toFixed(1)}`;
    }
  
    async function updateFlightHours() {
      const newHours = parseFloat(document.getElementById('newFlightHours').value);
      const statusDiv = document.getElementById('flightHoursStatus');
      if (!currentAircraftId || isNaN(newHours)) return statusDiv.textContent = '⚠️ Select aircraft and enter a valid number.';
      const { error } = await supabase.from('assets').update({ flight_hours: newHours }).eq('id', currentAircraftId);
      if (error) return statusDiv.textContent = '❌ Failed to update flight hours.';
      statusDiv.textContent = `✅ Flight hours updated to ${newHours.toFixed(1)}`;
      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(async () => {
        await refreshFlightHours();
        await onAircraftChange();
      }, 2500);
    }
  
    async function addMaintenanceItem() {
      const status = document.getElementById('addMxStatus');
      const typeId = document.getElementById('mxTypeSelect').value;
      const customTitle = document.getElementById('customTitle').value.trim();
      const mxDate = document.getElementById('mxDate').value;
      const mxHours = parseFloat(document.getElementById('mxFlightHours').value);
      const nextHours = parseFloat(document.getElementById('nextServiceDueAt').value);
      const nextDate = document.getElementById('nextServiceDueDate').value;
      const autoNext = document.getElementById('autoNextDue').checked;
      const dueType = document.getElementById('dueType').value;
      const squawks = document.getElementById('squawks').value;
      const alertThreshold = parseFloat(document.getElementById('alertThreshold').value);
  
      if (!currentAircraftId || !typeId || !mxDate) {
        status.textContent = '⚠️ Missing required fields';
        return;
      }
  
      const { error } = await supabase.from('maintenance_items').insert({
        asset_id: currentAircraftId,
        maintenance_type_id: typeId,
        custom_title: customTitle || null,
        mx_date: mxDate,
        mx_flight_hours: isNaN(mxHours) ? null : mxHours,
        next_service_due_at: isNaN(nextHours) ? null : nextHours,
        next_service_due_date: nextDate || null,
        auto_next_due: autoNext,
        due_type: dueType,
        squawks: squawks,
        alert_threshold: isNaN(alertThreshold) ? null : alertThreshold
      });
  
      if (error) {
        console.error('Add error:', error);
        status.textContent = '❌ Failed to add maintenance item.';
      } else {
        status.textContent = '✅ Maintenance item added.';
        await onAircraftChange();
      }
    }
  
    document.getElementById('updateHoursBtn').addEventListener('click', updateFlightHours);
    document.getElementById('addMxBtn').addEventListener('click', addMaintenanceItem);
    document.getElementById('toggleAddForm').addEventListener('click', () => {
      document.getElementById('addMxForm').classList.toggle('visible');
    });
  
    loadAircraft();
    loadMaintenanceTypes();
  
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
    script.onload = () => {
      Sortable.create(document.getElementById('cardGrid'), {
        handle: '.drag-handle',
        animation: 150,
        onEnd: async () => {
          const cards = document.querySelectorAll('#cardGrid .card');
          for (let i = 0; i < cards.length; i++) {
            const id = cards[i].getAttribute('data-id');
            if (id) {
              await supabase.from('maintenance_items').update({ sort_order: i }).eq('id', id);
            }
          }
          console.log('✅ Sort order saved');
        }
      });
    };
    document.body.appendChild(script);
  });