// ✅ Aircraft-specific logic (modular)

window.initAircraftLogic = async function () {
    console.log("✈️ aircraft.js logic initialized");
  
    const supabase = window.supabase;
    let currentAircraftId = null;
    let maintenanceTypes = [];
    let currentFlightHours = 0;
    let resetTimeout = null;
  
    const flightHoursStatus = document.getElementById('flightHoursStatus');
  
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
  
    async function loadMaintenanceTypes() {
      const { data, error } = await supabase
        .from('maintenance_types')
        .select('*')
        .eq('applicable_to', 'Aircraft');
      if (error) return console.error('Error loading maintenance types:', error);
      maintenanceTypes = data || [];
  
      const select = document.getElementById('mxTypeSelect');
      select.innerHTML = '<option value="">-- Select Type --</option>';
      data.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${type.name} (${type.category})`;
        select.appendChild(option);
      });
  
      select.addEventListener('change', (e) => {
        const selectedType = maintenanceTypes.find(t => t.id === e.target.value);
        const selectedTypeCategory = selectedType?.category?.toLowerCase() || '';
        const selectedTypeName = selectedType?.name?.toLowerCase() || '';
        const shouldShowCustomTitle = ['llp', 'misc'].includes(selectedTypeCategory) || selectedTypeName.includes('custom');
        const wrapper = document.getElementById('customTitleWrapper');
        if (wrapper) wrapper.style.display = shouldShowCustomTitle ? 'block' : 'none';
      });
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
  
    async function onAircraftChange(e) {
      if (e?.target?.value) currentAircraftId = e.target.value;
      if (!currentAircraftId) return;
  
      const { data: aircraftData } = await supabase.from('assets').select('flight_hours').eq('id', currentAircraftId).single();
      currentFlightHours = aircraftData?.flight_hours || 0;
      flightHoursStatus.textContent = `Current Flight Hours: ${currentFlightHours.toFixed(1)}`;
  
      const { data: mxItems } = await supabase
        .from('maintenance_items')
        .select('*, maintenance_types(name, category)')
        .eq('asset_id', currentAircraftId)
        .order('sort_order', { ascending: true });
  
      const grid = document.getElementById('cardGrid');
      grid.innerHTML = '';
      const today = new Date();
  
      const categorized = { MX: [], LLP: [], Misc: [] };
      mxItems.forEach(item => {
        const cat = item.maintenance_types?.category || 'Misc';
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push(item);
      });
  
      for (const category of ['MX', 'LLP', 'Misc']) {
        if (!categorized[category].length) continue;
  
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'category-section';
  
        const header = document.createElement('h3');
        header.textContent =
          category === 'MX' ? 'General Maintenance' :
          category === 'LLP' ? 'Life Limited Parts' :
          'Miscellaneous Items';
        header.className = 'tile-section-header';
        sectionContainer.appendChild(header);
  
        const sortableContainer = document.createElement('div');
        sortableContainer.className = 'sortable-subgrid';
  
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
  
          const due = item.next_service_due_date || item.next_service_due_at || 'N/A';
          const info = document.createElement('div');
          info.className = 'due';
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
            const days = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (days < 0) status = 'overdue';
            else if (days <= alert) status = 'soon';
            const direction = days >= 0 ? 'Due in:' : 'Overdue by:';
            remainingText = `${direction} ${getDateDifferenceString(today, dueDate)}`;
          }
  
          extra.textContent = remainingText || '—';
  
          const progress = document.createElement('div');
          progress.className = 'alert-bar';
          const fill = document.createElement('div');
          fill.className = `alert-fill ${status}`;
          progress.appendChild(fill);
  
          const pill = document.createElement('div');
          pill.className = 'pill';
          if (!item.next_service_due_at && !item.next_service_due_date) {
            pill.classList.add('inactive');
            pill.textContent = 'Inactive';
          } else if (status === 'overdue') {
            pill.classList.add('overdue');
            pill.textContent = 'Overdue';
          } else if (status === 'soon') {
            pill.classList.add('soon');
            pill.textContent = 'Due Soon';
          } else {
            pill.classList.add('ok');
            pill.textContent = 'Upcoming';
          }
  
          card.appendChild(title);
          card.appendChild(info);
          card.appendChild(extra);
          card.appendChild(progress);
          card.appendChild(pill);
          card.appendChild(dragHandle);
  
          sortableContainer.appendChild(card);
        });
  
        sectionContainer.appendChild(sortableContainer);
        grid.appendChild(sectionContainer);
  
        Sortable.create(sortableContainer, {
          handle: '.drag-handle',
          animation: 150,
          onEnd: async () => {
            const cards = sortableContainer.querySelectorAll('.card');
            for (let i = 0; i < cards.length; i++) {
              const id = cards[i].getAttribute('data-id');
              if (id) {
                await supabase.from('maintenance_items').update({ sort_order: i }).eq('id', id);
              }
            }
            console.log(`✅ Sort order for ${category} saved.`);
          }
        });
      }
    }
  
    await loadAircraft();
    await loadMaintenanceTypes();
  
    document.getElementById('updateHoursBtn').addEventListener('click', updateFlightHours);
    document.getElementById('addMxBtn').addEventListener('click', addMaintenanceItem);
    document.getElementById('toggleAddForm').addEventListener('click', () => {
      document.getElementById('addMxForm').classList.toggle('visible');
    });
  
    function updateFlightHours() { /* already defined */ }
    function addMaintenanceItem() { /* already defined */ }
  };