
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";

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
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';
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

            row.innerHTML = `
                <td><span class="priority-badge ${pClass}">P${pLabel}</span></td>
                <td style="font-weight: 500;">${title}</td>
                <td style="color: #94a3b8; font-size: 0.9em;">${desc}</td>
                <td style="font-size: 0.9em;">${author}</td>
                <td>${statusHtml}</td>
            `;
            tableBody.appendChild(row);
        });
    });
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
        e.preventDefault(); // Prevent default dialog submission
        if (!currentUser) return;

        const title = titleInput.value.trim();
        const content = descInput.value.trim();
        const priority = parseInt(priorityInput.value, 10);

        if (!title || !content) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            await addDoc(collection(db, "dev_task"), {
                title: title,
                content: content,
                priority: priority,
                completed: false,
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
            alert("Failed to create task");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Task';
        }
    });
}
