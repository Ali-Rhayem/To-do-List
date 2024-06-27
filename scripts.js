// document.addEventListener('DOMContentLoaded', () => {
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskDateTime = document.getElementById('taskDateTime');
const taskAssignee = document.getElementById('taskAssignee');
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');
const pastDueTasks = document.getElementById('pastDueTasks');

// Event listener to add task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value, taskDateTime.value, taskAssignee.value);
    taskForm.reset();
});


// Function to add a task
function addTask(name, dateTime, assignee) {
    const task = document.createElement('div');
    task.classList.add('task');

    const taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');
    taskInfo.innerHTML = `
            <p class="task-name">${name}</p>
            <p class="task-date">Due: ${new Date(dateTime).toLocaleString()}</p>
            <p class="task-assignee">Assignee: ${assignee}</p>
        `;

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');
    const completeButton = document.createElement('button');
    completeButton.classList.add('task-action', 'complete');
    completeButton.innerText = 'Complete';
    completeButton.addEventListener('click', () => completeTask(task));

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('task-action', 'delete');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task));

    taskActions.appendChild(completeButton);
    taskActions.appendChild(deleteButton);

    task.appendChild(taskInfo);
    task.appendChild(taskActions);

    const now = new Date();
    const taskDueDate = new Date(dateTime);
    if (taskDueDate < now) {
        pastDueTasks.appendChild(task);
    } else {
        pendingTasks.appendChild(task);
    }
}

// Function to complete a task
function completeTask(task) {
    completedTasks.appendChild(task);
}

// Function to delete a task
function deleteTask(task) {
    task.remove();
}

// Function to update tasks statuses
function updateTaskStatuses() {
    const tasks = pendingTasks.querySelectorAll('.task');
    const now = new Date();
    tasks.forEach(task => {
        const taskDateElement = task.querySelector('.task-date');
        const taskDate = new Date(taskDateElement.innerText.replace('Due: ', ''));
        if (taskDate < now) {
            pastDueTasks.appendChild(task);
        }
    });
}

// Periodically update task statuses
setInterval(updateTaskStatuses, 60000); // Update every minute
// });
