let tasks = [];

const addTaskEl = document.getElementById("add-task");
const taskInputEl = document.querySelector(".task-input");
const taskTableBodyEl = document.querySelector(".task-table tbody");
const dateHeaderEl = document.getElementById('sort-header-date');
const taskHeaderEl = document.getElementById('sort-header-task');

dateHeaderEl.addEventListener('click', () => {
    sortTable('sort-header-date'); 
    console.log("header clicked")

});

taskHeaderEl.addEventListener('click', () => {
    sortTable('sort-header-task'); 
});

addTaskEl.addEventListener("click", onClickAddButton);

taskInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        onClickAddButton();
    }
});

taskInputEl.focus()

function onClickAddButton(){
    addTask();
}

function addTask() {

    const input = taskInputEl.value.trim();
    if (input){
        //const today = new Date();
        
        // check for duplicates
        for (var task of tasks) {
            if (input == task.text){
                showMessage("The text you entered has already been entered as a task");
                return            
            }
        }

        const newTask = {
            id: Date.now(), // use timestamp for unique id
            text: input,
            status: "Incomplete", // no longer used
            //dateCreated: new Date().toISOString().split('T')[0] // yyyy-mm-dd
            dateCreated: new Date().toISOString().slice(0, 19).replace('T', ' ') // date and time format
        };
        tasks.push(newTask);
        refreshTasklist();
        }

        taskInputEl.value = ""
        taskInputEl.focus()
        resetHeaderText(taskHeaderEl);
        resetHeaderText(dateHeaderEl);

}


function refreshTasklist() {

    taskTableBodyEl.innerHTML = '';

 // for (var task of tasks) {
 //     const row = document.createElement('tr');
 //     row.dataset.id = task.id; // Store ID      

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.dataset.id = task.id; // Store ID 

        row.innerHTML = 
            `<td>
                <span class="task-text">${task.text}</span>
                <input type="text" class="editable-task" value="${task.text}" style="display: none;">
            </td>
            <td>${task.dateCreated}</td>
            <td class="task-actions">
            <button class="task-btn" data-action="undo" style="display: none;">
                Undo
            </button>
            <button class="task-btn" data-action="edit" >
                Edit
            </button>
            <button class="task-btn" data-action="delete">
                Delete
            </button>
            </td>
        `;           

        taskTableBodyEl.appendChild(row);

    });

}

let sortOrder =[];

function sortTable(headerId) { // We only need headerId now

    sortOrder[headerId] = (sortOrder[headerId] === 'asc') ? 'desc' : 'asc';

    tasks.sort((a, b) => {
        //let aValue, bValue; // alternative way of declaring variables (kind of)
        if (headerId === 'sort-header-task') {
            let aValue = a.text;
            let bValue = b.text;
            taskHeaderEl.textContent = (sortOrder[headerId] === 'asc') ? "Task ▼" : "Task ▲"; 
            //dateHeaderEl.textContent = dateHeaderEl.textContent.replace(" ▼", "").replace(" ▲", "");
            resetHeaderText(dateHeaderEl);
            // effective way to sort text. case sensitive and numbers sorted numericlly
            if (sortOrder[headerId] === 'asc') {
                return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
            } else {
                return bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
            }


        } else if (headerId === 'sort-header-date') {
     
            aValue = new Date(a.dateCreated); // Parse date strings into Date objects
            bValue = new Date(b.dateCreated);
            dateHeaderEl.textContent = (sortOrder[headerId] === 'asc') ? "Created ▼" : "Created ▲"; 
            resetHeaderText(taskHeaderEl);
            // Special handling for date column
            if (sortOrder[headerId] === 'asc') {
                return aValue - bValue; 
            } else {
                return bValue - aValue;
            }
        }
    });

    refreshTasklist(); 
}

function resetHeaderText (headerEl) {

    headerEl.textContent = headerEl.textContent.replace(" ▼", "").replace(" ▲", "");
}

// This function took hours and hours to get right!!!
// e is the event object
// e.target is the exact elelement that was clicked
taskTableBodyEl.addEventListener("click", function (e) {
    const actionButton = e.target.closest(".task-btn");

    if (!actionButton) return; // check if button with .task-btn was clicked

    const action = actionButton.dataset.action; // Get current action from data-action attribute 

    const row = e.target.closest("tr"); // find closest ancestor <tr> element (on same table row (check?)) to clicked element
    const taskId = Number(row.dataset.id); // get task ID from data-id attribte of row and convert to num
    const task = tasks.find(t => t.id === taskId); // Find correspponding task object in tasks array with taskID
    const input = row.querySelector(".editable-task");

    if (action === "edit") {
        // First reset any other records in 'edit' mode and undo
        const otherSaveButtons = taskTableBodyEl.querySelectorAll('[data-action="save"]'); // CHANGE
        otherSaveButtons.forEach(btn => {
            const otherRow = btn.closest("tr");
            const spanOther = otherRow.querySelector(".task-text");
            const inputOther = otherRow.querySelector(".editable-task");
            const undoBtnOther = otherRow.querySelector('[data-action="undo"]');
            // Revert to non-edit mode
            spanOther.style.display = "inline";
            inputOther.style.display = "none";
            inputOther.value = spanOther.textContent;
            btn.dataset.action = "edit";
            btn.textContent = "Edit";           
            undoBtnOther.style.display = "none"; 
            
        })

        const span = row.querySelector(".task-text");
        // const input = row.querySelector(".editable-task");
        const undoBtn = row.querySelector('[data-action="undo"]');

        // hide/display boxes
        span.style.display = "none";
        input.style.display = "inline";
        // Change button to "Save" mode
        actionButton.dataset.action = "save"; 
        actionButton.textContent = 'Save';
        // Unhide Undo button
        undoBtn.style.display = "inline";  

        input.focus();
    } else if (action === "save") {
        console.log("save clicked")
        const taskId = Number(row.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        
        const input = row.querySelector(".editable-task");
        const newText = input.value.trim();

        if (newText) {
            task.text = newText;
        }

        // Change button back to Edit 
        actionButton.dataset.action = "edit";
        actionButton.textContent = 'Edit';
        refreshTasklist();

    } else if (action === "delete") {

        const confirmDelete = window.confirm(  `Delete this task?\n\n"${String(task?.text || '')}"`);
        if (confirmDelete) {
            const taskId = Number(row.dataset.id);
            const index = tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                tasks.splice(index, 1);
                refreshTasklist();
            }
        }
    } else if (action === "undo") {
        const span = row.querySelector(".task-text");
        const input = row.querySelector(".editable-task");
        const editBtn = row.querySelector('[data-action="save"]');
        // hide/display boxes
        span.style.display = "inline";
        input.style.display = "none";
        editBtn.dataset.action = "edit";
        editBtn.textContent = "Edit";
        actionButton.style.display = "none";
        // reset the content of the input box
        input.value = span.textContent;
    }

});

// show message function nicked off the internet
function showMessage(text) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.classList.remove("hidden");

    // Automatically hide after 3 seconds
    setTimeout(() => {
        msg.classList.add("hidden");
    }, 3000);
}

