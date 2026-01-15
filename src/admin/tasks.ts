
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
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

let currentUser: any = null;

// --- Auth & Init ---

onAuthStateChanged(auth, (user) => {
    if (authCheckEl) authCheckEl.hidden = true;

    if (user) {
        currentUser = user;
        if (mainContentEl) mainContentEl.hidden = false;
        if (loginContentEl) loginContentEl.hidden = true;
        loadTasks();
    } else {
        currentUser = null;
        if (mainContentEl) mainContentEl.hidden = true;
        if (loginContentEl) loginContentEl.hidden = false;
    }
});

// --- Tasks Logic ---

function loadTasks() {
    const q = query(collection(db, "dev_task"), orderBy("completed"), orderBy("priority", "desc"));

    onSnapshot(q, (snapshot) => {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');

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
            const desc = escapeHtml((data.content || '').substring(0, 60) + (data.content?.length > 60 ? '...' : ''));
            const author = escapeHtml(data.createdBy?.name || data.createdBy?.email || 'Unknown');

            // Attachment Link
            let attachmentHtml = '';
            if (data.attachment_url) {
                attachmentHtml = `<br><a href="${data.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`;
            }

            row.innerHTML = `
                <td><span class="priority-badge ${pClass}">P${pLabel}</span></td>
                <td style="font-weight: 500;">
                    ${title}
                    ${attachmentHtml}
                </td>
                <td style="color: #94a3b8; font-size: 0.9em;">${desc}</td>
                <td style="font-size: 0.9em;">${author}</td>
                <td>${statusHtml}</td>
                <td class="action-cell"></td>
            `;

            // Add delete button only for pending tasks
            if (!isDone) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️';
                deleteBtn.style.background = 'transparent';
                deleteBtn.style.border = 'none';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '1.2rem';
                deleteBtn.title = 'Delete Task';
                deleteBtn.onclick = () => deleteTask(doc.id);
                row.querySelector('.action-cell')?.appendChild(deleteBtn);
            }

            tableBody.appendChild(row);
        });
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

if (newTaskBtn) {
    newTaskBtn.addEventListener('click', () => {
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
        submitBtn.textContent = 'Uploading...';

        try {
            let attachmentUrl = null;

            // 1. Upload File (if exists)
            if (file) {
                const timestamp = Date.now();
                const storageRef = ref(storage, `task_attachments/${timestamp}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                attachmentUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Write to Firestore
            await addDoc(collection(db, "dev_task"), {
                title: title,
                content: content,
                priority: priority,
                completed: false,
                attachment_url: attachmentUrl, // Save URL or null
                createdAt: serverTimestamp(),
                createdBy: {
                    uid: currentUser.uid,
                    email: currentUser.email || 'Anonymous',
                    name: currentUser.displayName || 'Unknown'
                }
            });

            modal.close();
            taskForm.reset();
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task (Check console for permission details)");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Task';
        }
    });
}
