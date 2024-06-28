//we use DOMContentLoaded wait for DOM content to fully load 

document.addEventListener('DOMContentLoaded', (event) => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskDateTime = document.getElementById('taskDateTime');
    const taskAssignee = document.getElementById('taskAssignee');
    const pendingTasks = document.getElementById('pendingTasks');
    const completedTasks = document.getElementById('completedTasks');
    const pastDueTasks = document.getElementById('pastDueTasks');

    // we load tasks from local storage
    loadTasks();

    // we set the interval to load tasks every second in order to check if there is tasks that passed the due
    setInterval(loadTasks, 1000);

    // Function to add a task whenever we press submit
    taskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTask();
    });


    function addTask() {
        // Create a task object from form input values
        const task = {
            id: Date.now(),
            title: taskInput.value,
            dateTime: new Date(taskDateTime.value).toISOString(),
            assignee: taskAssignee.value,
            status: 'pending'
        };
        saveTask(task); // Save task to local storage
        renderTasks(); //render the tasks on the screen
        taskForm.reset(); // reset the form after adding the task
    }

    function saveTask(task) {
        // Get existing tasks or initialize an empty array
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        // add the task into the array(tasks)
        tasks.push(task);
        //save the tasks back into local storage
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        renderTasks();
    }

    function renderTasks() {
        // Clear existing tasks from UI
        clearTasks();
        // Get all the tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            // Render each task to display it on screen
            renderTask(task);
        });
    }

    function renderTask(task) {
        // Create task element 
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task');
        taskDiv.setAttribute('draggable', 'true');
        taskDiv.setAttribute('data-id', task.id);

        // create and add task information into the div of class task above
        const taskInfo = document.createElement('div');
        taskInfo.classList.add('task-info');
        taskInfo.innerHTML = `
            <p><strong>Task:</strong> ${task.title}</p>
            <p><strong>Due:</strong> ${new Date(task.dateTime).toLocaleString()}</p>
            <p><strong>Assignee:</strong> ${task.assignee}</p>
        `;
        taskDiv.appendChild(taskInfo);

        // Create task buttons (complete and delete buttons) and add them to the div of class task
        const taskActions = document.createElement('div');
        taskActions.classList.add('task-actions');

        const completeButton = document.createElement('button');
        completeButton.classList.add('task-action', 'complete');
        completeButton.textContent = 'Complete';
        // mark task as completed by the function(markTaskCompleted) when the complete button is clicked
        completeButton.addEventListener('click', () => markTaskCompleted(task.id));

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('task-action', 'delete');
        deleteButton.textContent = 'Delete';
        // delete the task by the function(deleteTask) when the delete button is clicked
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        taskActions.appendChild(completeButton);
        taskActions.appendChild(deleteButton);
        taskDiv.appendChild(taskActions);

        // Add drag-and-drop functionality
        taskDiv.addEventListener('dragstart', handleDragStart);
        taskDiv.addEventListener('dragend', handleDragEnd);

        // Determine which column the task should be added to
        const now = new Date();
        const taskDate = new Date(task.dateTime);
        if (task.status === 'completed') {
            completedTasks.appendChild(taskDiv);
        } else if (task.status === 'pastDue' || now > taskDate) {
            pastDueTasks.appendChild(taskDiv);
            task.status = 'pastDue';
            updateTaskStatus(task.id, 'pastDue');
        } else {
            pendingTasks.appendChild(taskDiv);
        }
    }

    function markTaskCompleted(taskId) {
        // Get tasks from local storage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
            // Mark task as completed if the task id matches
            if (task.id === taskId) {
                task.status = 'completed';
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function deleteTask(taskId) {
        // Get tasks from local storage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        // remove the task to be deleted
        tasks = tasks.filter(task => task.id !== taskId);
        // Save the remaining tasks back to local storage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // Clear tasks from UI
    function clearTasks() {
        pendingTasks.innerHTML = '';
        completedTasks.innerHTML = '';
        pastDueTasks.innerHTML = '';
    }

    function handleDragStart(event) {
        event.target.classList.add('dragging');
        // Set the data to be transferred when dragging
        event.dataTransfer.setData('text/plain', event.target.getAttribute('data-id'));
    }

    function handleDragEnd(event) {
        // Remove the dragging class when dragging ends
        event.target.classList.remove('dragging');
    }

    // Handle drop events on columns
    const columns = document.querySelectorAll('.Column');
    // Loop through each column and add event listeners for dragover and drop events
    columns.forEach(column => {
        column.addEventListener('dragover', event => {
            event.preventDefault();
            const afterElement = getDragAfterElement(column, event.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement == null) {
                column.querySelector('.task-list').appendChild(dragging);
            } else {
                column.querySelector('.task-list').insertBefore(dragging, afterElement);
            }
        });

        // Handle drop event on column to update task status
        column.addEventListener('drop', event => {
            event.preventDefault();
            const columnId = column.querySelector('.task-list').getAttribute('id');
            const taskId = event.dataTransfer.getData('text/plain');
            updateTaskStatus(taskId, columnId);
            renderTasks();
        });

        // Handle click events on complete and delete buttons
        column.addEventListener('click', event => {
            if (event.target.classList.contains('complete')) {
                const taskId = event.target.closest('.task').getAttribute('data-id');
                markTaskCompleted(taskId);
            } else if (event.target.classList.contains('delete')) {
                const taskId = event.target.closest('.task').getAttribute('data-id');
                deleteTask(taskId);
            }
        });
    });

    // Get the element to insert the dragged element after
    function getDragAfterElement(container, y) {
        // Get all draggable elements except the one being dragged (with class dragging)
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

        // Find the closest element to the dragged element
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, {// Set the initial closest element to the first element
            offset: Number.NEGATIVE_INFINITY
        }).element;
    }

    function updateTaskStatus(taskId, columnId) {
        // Get tasks from local storage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        // Update the status of the task based on the column it was dropped into
        tasks = tasks.map(task => {
            if (task.id === parseInt(taskId)) {
                if (columnId === 'completedTasks') {
                    task.status = 'completed';
                } else if (columnId === 'pastDueTasks') {
                    task.status = 'pastDue';
                } else if (columnId === 'pendingTasks') {
                    task.status = 'pending';
                }
            }
            return task;
        });
        // Save the updated tasks back to local storage
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
