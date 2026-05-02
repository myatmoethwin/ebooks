let allBooks = [];
let currentFilter = 'all';

async function loadBooks() {
  try {
    const res = await fetch('books.json?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to load books.json');
    allBooks = await res.json();
    updateStats();
    renderBooks(allBooks);
  } catch (err) {
    document.getElementById('bookGrid').innerHTML = 
      `<p class="empty-msg">⚠️ Error loading library: ${err.message}</p>`;
  }
}

function updateStats() {
  document.getElementById('statTotal').textContent = allBooks.length;
  const genres = new Set();
  allBooks.forEach(b => {
    if (b.tags) b.tags.forEach(t => genres.add(t));
  });
  document.getElementById('statGenres').textContent = genres.size;
}

function getAvailableFormats(book) {
  const formats = [];
  if (book.downloads.epub) formats.push('EPUB');
  if (book.downloads.pdf) formats.push('PDF');
  if (book.downloads.kfx) formats.push('KFX');
  return formats;
}

function renderBooks(books) {
  const grid = document.getElementById('bookGrid');
  const counter = document.getElementById('resultCount');
  
  counter.textContent = books.length === allBooks.length 
    ? `${books.length} books` 
    : `${books.length} of ${allBooks.length} books`;
  
  if (books.length === 0) {
    grid.innerHTML = '<p class="empty-msg">📭 No books found matching your search.</p>';
    return;
  }
  
  grid.innerHTML = books.map(book => {
    const formats = getAvailableFormats(book);
    const tags = (book.tags || []).slice(0, 2);
    
    return `
      <div class="book-card" onclick="openBookModal('${book.id}')">
        <div class="book-cover-wrapper">
          <div class="book-spine"></div>
          <img src="${book.cover || 'https://via.placeholder.com/200x300/2d2218/c9a961?text=No+Cover'}" 
               alt="${escapeHtml(book.title)}" loading="lazy"
               onerror="this.src='https://via.placeholder.com/200x300/2d2218/c9a961?text=No+Cover'">
          ${formats.length > 0 ? `
            <div class="book-formats">
              ${formats.map(f => `<span class="format-badge">${f}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="book-info">
          <div class="book-title">${escapeHtml(book.title)}</div>
          <div class="book-author">${escapeHtml(book.author)}${book.translator ? ' — ' + escapeHtml(book.translator) : ''}</div>
          ${tags.length > 0 ? `
            <div class="book-tags">
              ${tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function openBookModal(id) {
  const book = allBooks.find(b => b.id === id);
  if (!book) return;
  
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-detail-content">
      <div>
        <img class="modal-cover" 
             src="${book.cover || 'https://via.placeholder.com/200x300/2d2218/c9a961?text=No+Cover'}" 
             alt="${escapeHtml(book.title)}"
             onerror="this.src='https://via.placeholder.com/200x300/2d2218/c9a961?text=No+Cover'">
      </div>
      <div class="modal-info">
        <h2>${escapeHtml(book.title)}</h2>
        <p class="modal-meta"><strong>Author:</strong> ${escapeHtml(book.author)}</p>
        ${book.translator ? `<p class="modal-meta"><strong>ဘာသာပြန်:</strong> ${escapeHtml(book.translator)}</p>` : ''}
        ${book.genre ? `<p class="modal-meta"><strong>Genre:</strong> ${escapeHtml(book.genre)}</p>` : ''}
        ${book.language ? `<p class="modal-meta"><strong>Language:</strong> ${escapeHtml(book.language)}</p>` : ''}
        ${book.added_date ? `<p class="modal-meta"><strong>Added:</strong> ${escapeHtml(book.added_date)}</p>` : ''}
        
        <p class="modal-desc">${escapeHtml(book.description || 'No description available.')}</p>
        
        <div class="action-btns">
          ${book.downloads.epub ? `<a class="btn read" href="reader.html?id=${book.id}">📖 Read Online</a>` : ''}
          ${book.downloads.epub ? `<a class="btn epub" href="${book.downloads.epub}" target="_blank" download>⬇ EPUB</a>` : ''}
          ${book.downloads.pdf ? `<a class="btn pdf" href="${book.downloads.pdf}" target="_blank">⬇ PDF</a>` : ''}
          ${book.downloads.kfx ? `<a class="btn kfx" href="${book.downloads.kfx}" target="_blank">⬇ KFX</a>` : ''}
          ${book.review_url ? `<button class="btn review" onclick="openReview('${book.review_url}', '${escapeHtml(book.title).replace(/'/g, "\\'")}')">📰 Review</button>` : ''}
        </div>
      </div>
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

function openReview(url, title) {
  document.getElementById('reviewTitle').textContent = title;
  document.getElementById('reviewFrame').src = url;
  document.getElementById('reviewModal').classList.add('active');
  closeModal();
}

function closeReview() {
  document.getElementById('reviewModal').classList.remove('active');
  document.getElementById('reviewFrame').src = '';
}

function closeReviewIfOutside(e) {
  if (e.target.id === 'reviewModal') closeReview();
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  let filtered = allBooks;
  
  if (currentFilter !== 'all') {
    filtered = filtered.filter(b => b.tags && b.tags.includes(currentFilter));
  }
  
  if (q) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.translator && b.translator.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
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
  if (e.key === 'Escape') {
    closeReview();
    closeModal();
  }
});

loadBooks();
