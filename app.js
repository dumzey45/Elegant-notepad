document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notesContainer = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const emptyNewNoteBtn = document.getElementById('emptyNewNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const lastSaved = document.getElementById('lastSaved');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // State
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;
    let colors = [
        'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200',
        'bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200',
        'bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200',
        'bg-gradient-to-br from-green-100 to-green-50 border-green-200',
        'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200'
    ];

    // Initialize
    renderNotes();
    updateEmptyState();

    // Event Listeners
    newNoteBtn.addEventListener('click', createNewNote);
    emptyNewNoteBtn.addEventListener('click', createNewNote);
    closeModalBtn.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
    deleteNoteBtn.addEventListener('click', deleteNote);

    // Modal backdrop click
    noteModal.addEventListener('click', function(e) {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    // Functions
    function renderNotes() {
        notesContainer.innerHTML = '';
        
        notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = `note-transition fade-in bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border-l-4 ${note.color} cursor-pointer transform hover:-translate-y-1 transition-all duration-300`;
            noteEl.innerHTML = `
                <div class="p-5 h-full" data-id="${note.id}">
                    <h3 class="font-bold text-lg mb-2 truncate">${note.title || 'Untitled Note'}</h3>
                    <p class="text-gray-600 mb-4 line-clamp-3">${note.content || 'No content yet...'}</p>
                    <div class="text-xs text-gray-400 flex justify-between items-center">
                        <span>${formatDate(note.updatedAt)}</span>
                        <button class="edit-btn p-1 text-gray-500 hover:text-purple-600 transition-colors">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            notesContainer.appendChild(noteEl);
            
            // Add click event to open note
            noteEl.addEventListener('click', function(e) {
                if (!e.target.classList.contains('edit-btn') && !e.target.closest('.edit-btn')) {
                    openNote(note.id);
                }
            });
            
            // Add click event to edit button
            const editBtn = noteEl.querySelector('.edit-btn');
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openNote(note.id);
            });
        });
    }

    function updateEmptyState() {
        if (notes.length === 0) {
            emptyState.classList.remove('hidden');
            notesContainer.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            notesContainer.classList.remove('hidden');
        }
    }

    function createNewNote() {
        currentNoteId = Date.now().toString();
        noteTitle.value = '';
        noteContent.value = '';
        lastSaved.textContent = 'Just now';
        
        openModal();
    }

    function openNote(id) {
        const note = notes.find(note => note.id === id);
        if (note) {
            currentNoteId = id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            lastSaved.textContent = formatDate(note.updatedAt);
            
            openModal();
        }
    }

    function openModal() {
        noteModal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    function closeModal() {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            noteModal.classList.add('hidden');
        }, 300);
    }

    function saveNote() {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        const now = new Date();
        
        const existingNoteIndex = notes.findIndex(note => note.id === currentNoteId);
        
        if (existingNoteIndex !== -1) {
            // Update existing note
            notes[existingNoteIndex] = {
                ...notes[existingNoteIndex],
                title,
                content,
                updatedAt: now
            };
        } else {
            // Create new note
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            notes.push({
                id: currentNoteId,
                title,
                content,
                color: randomColor,
                createdAt: now,
                updatedAt: now
            });
        }
        
        // Save to localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Update UI
        renderNotes();
        updateEmptyState();
        lastSaved.textContent = formatDate(now);
        
        // Show toast
        showToast('Note saved successfully!');
    }

    function deleteNote() {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== currentNoteId);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            renderNotes();
            updateEmptyState();
            closeModal();
            
            showToast('Note deleted', 'bg-red-500');
        }
    }

    function formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diffInHours = Math.abs(now - d) / 36e5;
        
        if (diffInHours < 24) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return d.toLocaleDateString();
        }
    }

    function showToast(message, bgColor = 'bg-green-500') {
        toastMessage.textContent = message;
        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-10 opacity-0 transition-all duration-300 flex items-center`;
        
        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-10', 'opacity-0');
        }, 3000);
    }
});