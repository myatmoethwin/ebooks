let allBooks = [];
let currentFilter = 'all';

async function loadBooks() {
  try {
    const res = await fetch('books.json?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to load books.json');
    allBooks = await res.json();
    renderBooks(allBooks);
  } catch (err) {
    document.getElementById('bookGrid').innerHTML = 
      '<p style="text-align:center;padding:40px;color:#de6f6f">Error: ' + err.message + '</p>';
  }
}

function renderBooks(books) {
  const grid = document.getElementById('bookGrid');
  if (books.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;grid-column:1/-1">No books found.</p>';
    return;
  }
  grid.innerHTML = books.map(book => `
    <div class="book-card" onclick="openModal('${book.id}')">
      <img src="${book.cover || 'https://via.placeholder.com/200x300/2a2a3e/888?text=No+Cover'}" 
           alt="${book.title}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/200x300/2a2a3e/888?text=No+Cover'">
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}${book.translator ? ' · ' + book.translator : ''}</div>
        <div class="download-btns">
          ${book.downloads.epub ? `<a class="dl-btn epub" href="${book.downloads.epub}" onclick="event.stopPropagation()" target="_blank">EPUB</a>` : ''}
          ${book.downloads.pdf ? `<a class="dl-btn pdf" href="${book.downloads.pdf}" onclick="event.stopPropagation()" target="_blank">PDF</a>` : ''}
          ${book.downloads.kfx ? `<a class="dl-btn kfx" href="${book.downloads.kfx}" onclick="event.stopPropagation()" target="_blank">KFX</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function openModal(id) {
  const book = allBooks.find(b => b.id === id);
  if (!book) return;
  document.getElementById('modalContent').innerHTML = `
    <h2>${book.title}</h2>
    <p class="modal-meta">✍️ ${book.author}</p>
    ${book.translator ? `<p class="modal-meta">📖 ဘာသာပြန်: ${book.translator}</p>` : ''}
    ${book.genre ? `<p class="modal-meta">📚 အမျိုးအစား: ${book.genre}</p>` : ''}
    <p class="modal-desc">${book.description || ''}</p>
    <div class="download-btns">
      ${book.downloads.epub ? `<a class="dl-btn epub" href="${book.downloads.epub}" target="_blank">⬇️ EPUB</a>` : ''}
      ${book.downloads.pdf ? `<a class="dl-btn pdf" href="${book.downloads.pdf}" target="_blank">⬇️ PDF</a>` : ''}
      ${book.downloads.kfx ? `<a class="dl-btn kfx" href="${book.downloads.kfx}" target="_blank">⬇️ KFX</a>` : ''}
      ${book.review_url ? `<a class="dl-btn review" href="${book.review_url}" target="_blank">📖 Review</a>` : ''}
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function closeModalIfOutside(e) {
  if (e.target.id === 'modalOverlay') closeModal();
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let filtered = allBooks;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(b => b.tags && b.tags.includes(currentFilter));
  }
  if (q) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.translator && b.translator.toLowerCase().includes(q))
    );
  }
  renderBooks(filtered);
}

document.getElementById('searchInput').addEventListener('input', applyFilters);

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilters();
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

loadBooks();
