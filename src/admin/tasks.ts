
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, onSnapshot, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
    authDomain: "wise-catty.cc",
    projectId: "wisecat-8df8d",
    storageBucket: "wisecat-8df8d.firebasestorage.app",
    messagingSenderId: "1078479155773",
    appId: "1:1078479155773:web:cd62907516951aa47db054",
    measurementId: "G-30M228G3VP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "reservation");
const storage = getStorage(app);

// Elements
const authCheckEl = document.getElementById('authCheck');
const mainContentEl = document.getElementById('mainContent');
const loginContentEl = document.getElementById('loginContent');
const tableBody = document.getElementById('taskTableBody');

const modal = document.getElementById('taskModal') as HTMLDialogElement;
const newTaskBtn = document.getElementById('newTaskBtn');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm') as HTMLFormElement;

const titleInput = document.getElementById('titleInput') as HTMLInputElement;
const priorityInput = document.getElementById('priorityInput') as HTMLSelectElement;
const descInput = document.getElementById('descInput') as HTMLTextAreaElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const modalTitle = document.querySelector('#taskModal h2');

let editingTaskId: string | null = null;

let currentUser: any = null;
let allTasks: any[] = [];
let currentSort: { field: string, dir: 'asc' | 'desc' } = { field: 'priority', dir: 'desc' };
let currentPage = 1;
const itemsPerPage = 10;

// --- Auth & Init ---

// --- Auth & Init ---

onAuthStateChanged(auth, (user) => {
    if (authCheckEl) authCheckEl.hidden = true;

    if (user) {
        currentUser = user;
        if (mainContentEl) mainContentEl.hidden = false;
        if (loginContentEl) loginContentEl.hidden = true;

        // Update Profile Display
        const profileEl = document.getElementById('userProfileDisplay');
        if (profileEl) {
            const name = user.displayName || user.email || 'Admin';
            const email = user.email || '';
            const photo = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

            profileEl.className = 'user-profile';
            profileEl.innerHTML = `
                <img class="user-avatar" src="${photo}" alt="User">
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-email">${email}</div>
                </div>
                <button onclick="(window as any).firebase.auth().signOut()" class="logout-btn">Logout</button>
            `;
        }

        loadTasks();
    } else {
        currentUser = null;
        if (mainContentEl) mainContentEl.hidden = true;
        if (loginContentEl) loginContentEl.hidden = false;
    }
});

// ... inside renderTable loop ...

// (Removed broken code block)

// --- Tasks Logic ---

function loadTasks() {
    const q = query(collection(db, "dev_task"));

    onSnapshot(q, (snapshot) => {
        allTasks = [];
        snapshot.forEach((doc) => {
            allTasks.push({ id: doc.id, ...doc.data() });
        });
        renderTable();
    });
}

function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (allTasks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';
        return;
    }

    // Sort
    allTasks.sort((a, b) => {
        let valA = a[currentSort.field];
        let valB = b[currentSort.field];

        // Handle specific fields
        if (currentSort.field === 'createdBy') {
            valA = a.createdBy?.name || '';
            valB = b.createdBy?.name || '';
        }

        if (currentSort.field === 'createdAt') {
            // Handle Timestamp objects for comparison
            valA = valA?.toMillis ? valA.toMillis() : (new Date(valA).getTime() || 0);
            valB = valB?.toMillis ? valB.toMillis() : (new Date(valB).getTime() || 0);
        }

        if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
        if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(allTasks.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = allTasks.slice(startIndex, endIndex);

    // Render Rows
    paginatedTasks.forEach((data, index) => {
        const row = document.createElement('tr');
        const rowNumber = startIndex + index + 1; // Continuous numbering

        // Priority
        const pClass = `p-${data.priority || 3}`;
        const pLabel = data.priority || 3;

        // Status
        const isDone = data.completed === true;
        const statusHtml = isDone
            ? '<span class="status-badge status-done">● Done</span>'
            : '<span class="status-badge status-pending">○ Pending</span>';

        // Safe content
        const title = escapeHtml(data.title || '(No Title)');
        const descFull = escapeHtml(data.content || '');
        const author = escapeHtml(data.createdBy?.name || data.createdBy?.email || 'Unknown');

        // Date
        let dateHtml = '-';
        if (data.createdAt) {
            // Handle Firestore Timestamp or Date object
            const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            dateHtml = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Attachment Link
        let attachmentHtml = '';
        if (data.attachment_url) {
            attachmentHtml = `<br><a href="${data.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`;
        }

        row.innerHTML = `
            <td style="color: var(--text-secondary); font-size: 0.8em;">${rowNumber}</td>
            <td><span class="priority-badge ${pClass}">P${pLabel}</span></td>
            <td style="font-weight: 500;">
                ${title}
                ${attachmentHtml}
            </td>
            <td style="color: #94a3b8; font-size: 0.9em; max-width: 300px;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" 
                     onclick="this.style.whiteSpace=this.style.whiteSpace==='nowrap'?'pre-wrap':'nowrap'"
                     title="Click to expand/collapse">
                    ${descFull}
                </div>
            </td>
            <td style="font-size: 0.85em; color: #ccc;">${dateHtml}</td>
            <td style="font-size: 0.9em;">${author}</td>
            <td>${statusHtml}</td>
            <td class="action-cell"></td>
        `;

        // Add delete and edit buttons only for pending tasks created by the current user
        const isOwner = currentUser && data.createdBy && currentUser.uid === data.createdBy.uid;

        if (!isDone && isOwner) {
            const actionCell = row.querySelector('.action-cell');
            if (actionCell) {
                // Edit Button
                const editBtn = document.createElement('button');
                editBtn.textContent = '✏️';
                editBtn.style.background = 'transparent';
                editBtn.style.border = 'none';
                editBtn.style.cursor = 'pointer';
                editBtn.style.fontSize = '1.2rem';
                editBtn.style.marginRight = '8px';
                editBtn.title = 'Edit Task';
                editBtn.onclick = () => openEditModal(data);
                actionCell.appendChild(editBtn);

                // Delete Button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️';
                deleteBtn.style.background = 'transparent';
                deleteBtn.style.border = 'none';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '1.2rem';
                deleteBtn.title = 'Delete Task';
                deleteBtn.onclick = () => deleteTask(data.id);
                actionCell.appendChild(deleteBtn);
            }
        }

        tableBody.appendChild(row);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages: number) {
    const prevBtn = document.getElementById('prevPageBtn') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextPageBtn') as HTMLButtonElement;
    const indicator = document.getElementById('pageIndicator');

    if (indicator) indicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        };
    }
}

// Bind Sort Headers
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (!field) return;

        if (currentSort.field === field) {
            currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.field = field;
            currentSort.dir = 'desc'; // Default new sort to desc
        }
        renderTable();
        updateHeaderIcons();
    });
});

function updateHeaderIcons() {
    document.querySelectorAll('th[data-sort]').forEach((th: any) => {
        const field = th.getAttribute('data-sort');
        let text = th.textContent?.replace(/[↕↑↓]/g, '').trim() || '';

        if (currentSort.field === field) {
            th.textContent = `${text} ${currentSort.dir === 'asc' ? '↑' : '↓'}`;
            th.style.color = 'var(--accent)';
        } else {
            th.textContent = `${text} ↕`;
            th.style.color = '';
        }
    });
}

async function deleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) return;

    try {
        await deleteDoc(doc(db, "dev_task", taskId));
        // No need to manually refresh - onSnapshot triggers update.
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Check console for details.");
    }
}

function escapeHtml(text: string) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- Modal Logic ---

// --- Modal Logic ---

function openEditModal(data: any) {
    editingTaskId = data.id;
    if (modalTitle) modalTitle.textContent = "Edit Task";
    if (submitBtn) submitBtn.textContent = "Update Task";

    // Fill Form
    titleInput.value = data.title || '';
    descInput.value = data.content || '';
    priorityInput.value = (data.priority || 3).toString();
    // File input cannot be pre-filled securely

    modal.showModal();
}

if (newTaskBtn) {
    newTaskBtn.addEventListener('click', () => {
        editingTaskId = null; // Reset to create mode
        if (modalTitle) modalTitle.textContent = "New Task";
        if (submitBtn) submitBtn.textContent = "Create Task";
        taskForm.reset();
        modal.showModal();
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        modal.close();
        taskForm.reset();
    });
}

if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default submission
        if (!currentUser) return;

        const title = titleInput.value.trim();
        const content = descInput.value.trim();
        const priority = parseInt(priorityInput.value, 10);
        const file = fileInput.files ? fileInput.files[0] : null;

        if (!title || !content) return;

        submitBtn.disabled = true;

        try {
            let attachmentUrl = null;

            // 1. Upload File (if exists)
            if (file) {
                submitBtn.textContent = 'Uploading...';
                const timestamp = Date.now();
                const storageRef = ref(storage, `task_attachments/${timestamp}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                attachmentUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Save/Update to Firestore
            if (editingTaskId) {
                submitBtn.textContent = 'Updating...';
                const updateData: any = {
                    title,
                    content,
                    priority,
                    updatedAt: serverTimestamp()
                };
                if (attachmentUrl) updateData.attachment_url = attachmentUrl;

                await updateDoc(doc(db, "dev_task", editingTaskId), updateData);
            } else {
                submitBtn.textContent = 'Saving...';
                const docData = {
                    title,
                    content,
                    priority,
                    attachment_url: attachmentUrl,
                    completed: false,
                    createdAt: serverTimestamp(),
                    createdBy: {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        name: currentUser.displayName || currentUser.email
                    }
                };
                await addDoc(collection(db, "dev_task"), docData);
            }

            modal.close();
            taskForm.reset();
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Error: " + (error as any).message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = editingTaskId ? 'Update Task' : 'Create Task';
        }
    });
}
