
// Read embedded itinerary JSON
function getEmbeddedItinerary() {
  const el = document.getElementById('embedded-itinerary');
  return JSON.parse(el.textContent);
}

// Booking links map
const bookingLinks = {
  "La Sagrada Família": "https://sagradafamilia.org/en/tickets",
  "Casa Batlló": "https://www.casabatllo.es/en/online-tickets/",
  "Casa Milà (La Pedrera)": "https://www.lapedrera.com/en/buy-tickets",
  "Palau Dalmases": "https://palaudalmases.com/en/flamenco-barcelona-tickets/",
  "La Boqueria Market": "https://www.boqueria.barcelona/",
  "Montjuïc": "https://www.telefericdemontjuic.cat/en/",
  "Royal Palace of Madrid": "https://www.patrimonionacional.es/en/visita/royal-palace-madrid",
  "El Prado Museum": "https://www.museodelprado.es/en/visit-the-museum",
  "Botín": "https://botin.es/en/bookings/",
  "Círculo de Bellas Artes": "https://www.circulobellasartes.com/visita/azotea/",
  "Reina Sofía Museum": "https://www.museoreinasofia.es/en/visit/information",
  "Cardamomo": "https://cardamomo.com/en/"
};

function bookingLinkForActivity(text) {
  for (const key in bookingLinks) {
    if (text.includes(key)) {
      return `<div class='ticket-link'><a href='${bookingLinks[key]}' target='_blank' rel='noopener'>🎟️ Book tickets for ${key}</a></div>`;
    }
  }
  return '';
}

const container = document.getElementById('itinerary-container');

function sectionKey(dayIndex, sectionName) {
  return `itinerary_section_note__${dayIndex}__${sectionName}`;
}

function saveSectionNote(key) {
  const el = document.getElementById(key);
  localStorage.setItem(key, el.value);
  const parent = el.parentElement;
  const primaryBtn = parent.querySelector('button.btn-primary');
  if (primaryBtn) {
    const original = primaryBtn.textContent;
    primaryBtn.textContent = 'Saved ✓';
    setTimeout(() => (primaryBtn.textContent = original), 1000);
  }
}

function clearAllNotes() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('itinerary_section_note__'))
    .forEach(k => localStorage.removeItem(k));
  document.querySelectorAll('textarea[id^="itinerary_section_note__"]').forEach(t => t.value = '');
}

function exportNotes() {
  const exportData = {};
  Object.keys(localStorage)
    .filter(k => k.startsWith('itinerary_section_note__'))
    .forEach(k => (exportData[k] = localStorage.getItem(k)));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'itinerary_notes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function render(data) {
  container.innerHTML = '';
  data.days.forEach((day, dayIndex) => {
    const collapseId = `collapse${dayIndex}`;
    const headerId = `heading${dayIndex}`;

    const sectionsHtml = Object.entries(day.activities).map(([time, acts]) => {
      const key = sectionKey(dayIndex, time);
      const saved = localStorage.getItem(key) || '';
      const items = acts.map(act => {
        return `<li class="list-group-item d-flex flex-column">
                  <span>${act}</span>
                  ${bookingLinkForActivity(act)}
                </li>`;
      }).join('');
      return `
        <div class="mb-3">
          <h5 class="text-capitalize">${time}</h5>
          <ul class="list-group list-group-flush mb-2">
            ${items}
          </ul>
          <div class="section-notes">
            <label for="${key}" class="form-label mb-1"><strong>Your notes for ${time}:</strong></label>
            <textarea class="form-control" id="${key}" rows="2" placeholder="Add your notes...">${saved}</textarea>
            <div class="mt-2 d-flex gap-2">
              <button class="btn btn-sm btn-primary" onclick="saveSectionNote('${key}')">💾 Save Note</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="document.getElementById('${key}').value=''; localStorage.removeItem('${key}')">Clear</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const dayHtml = `
      <div class="accordion-item">
        <h2 class="accordion-header" id="${headerId}">
          <button class="accordion-button ${dayIndex !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${dayIndex === 0}" aria-controls="${collapseId}">
            ${day.day}: ${day.title}
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse ${dayIndex === 0 ? 'show' : ''}" aria-labelledby="${headerId}" data-bs-parent="#itineraryAccordion">
          <div class="accordion-body">
            ${day.note ? `<p class="fst-italic text-muted">${day.note}</p>` : ''}
            ${sectionsHtml}
            ${day.departure ? `<p class="fst-italic text-muted mt-3">${day.departure}</p>` : ''}
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', dayHtml);
  });

  Sortable.create(container, { animation: 150, ghostClass: 'ghost' });
}

document.getElementById('export-notes').addEventListener('click', exportNotes);
document.getElementById('clear-notes').addEventListener('click', clearAllNotes);

render(getEmbeddedItinerary());
