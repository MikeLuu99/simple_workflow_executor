// Types
type TaskId = string;

interface Task {
    id: TaskId;
    time: number;
    deps: TaskId[];
}

interface TaskState {
    id: TaskId;
    time: number;
    deps: TaskId[];
    status: 'pending' | 'running' | 'completed';
    startTime: number | null;
    endTime: number | null;
}

interface WorkflowState {
    tasks: Map<TaskId, TaskState>;
    currentTime: number;
    runningTasks: Set<TaskId>;
    maxConcurrent: number;
}

// Pure functions for task management
const createTaskState = (task: Task): TaskState => ({
    ...task,
    status: 'pending',
    startTime: null,
    endTime: null
});

const initializeWorkflow = (tasks: Task[], maxConcurrent: number): WorkflowState => ({
    tasks: new Map(tasks.map(task => [task.id, createTaskState(task)])),
    currentTime: 0,
    runningTasks: new Set<TaskId>(),
    maxConcurrent
});

const isDependencyCompleted = (
    dependency: TaskId,
    tasks: Map<TaskId, TaskState>
): boolean => {
    const task = tasks.get(dependency);
    return task?.status === 'completed';
};

const canStartTask = (
    taskId: TaskId,
    { tasks }: WorkflowState
): boolean => {
    const task = tasks.get(taskId);
    return task?.status === 'pending' &&
        task.deps.every(depId => isDependencyCompleted(depId, tasks));
};

const getAvailableTasks = (state: WorkflowState): TaskState[] =>
    Array.from(state.tasks.values())
        .filter(task => canStartTask(task.id, state));

const updateRunningTasks = (state: WorkflowState): WorkflowState => {
    const newTasks = new Map(state.tasks);
    const newRunningTasks = new Set(state.runningTasks);

    // biome-ignore lint/complexity/noForEach: <explanation>
    state.runningTasks.forEach(taskId => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const task = newTasks.get(taskId)!;
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        if (task.startTime! + task.time <= state.currentTime) {
            newTasks.set(taskId, {
                ...task,
                status: 'completed',
                endTime: state.currentTime
            });
            newRunningTasks.delete(taskId);
            console.log(`Task ${task.id} completed at time ${state.currentTime}`);
        }
    });

    return {
        ...state,
        tasks: newTasks,
        runningTasks: newRunningTasks
    };
};

const startNewTasks = (state: WorkflowState): WorkflowState => {
    let newState = { ...state };
    
    while (newState.runningTasks.size < newState.maxConcurrent) {
        const availableTasks = getAvailableTasks(newState);
        if (availableTasks.length === 0) break;

        const taskToStart = availableTasks[0];
        const newTasks = new Map(newState.tasks);
        
        newTasks.set(taskToStart.id, {
            ...taskToStart,
            status: 'running',
            startTime: newState.currentTime
        });

        const newRunningTasks = new Set(newState.runningTasks);
        newRunningTasks.add(taskToStart.id);

        console.log(`Starting task ${taskToStart.id} at time ${newState.currentTime}`);

        newState = {
            ...newState,
            tasks: newTasks,
            runningTasks: newRunningTasks
        };
    }

    return newState;
};

const hasUnfinishedTasks = (state: WorkflowState): boolean =>
    Array.from(state.tasks.values()).some(task => task.status !== 'completed');

const next = (state: WorkflowState): [WorkflowState, boolean] => {
    let newState = updateRunningTasks(state);
    newState = startNewTasks(newState);

    if (newState.runningTasks.size > 0) {
        newState = {
            ...newState,
            currentTime: newState.currentTime + 1
        };
        return [newState, true];
    }

    return [newState, hasUnfinishedTasks(newState)];
};

const printWorkflowSummary = (state: WorkflowState): void => {
    console.log('\nWorkflow Summary:');
    console.log('----------------');
    // biome-ignore lint/complexity/noForEach: <explanation>
    state.tasks.forEach(task => {
        console.log(
            `Task ${task.id}: Started at ${task.startTime}, ` +
            `Completed at ${task.endTime}, Duration: ${task.time}`
        );
    });
    console.log(`Total time: ${state.currentTime} units`);
};

const runAll = (initialState: WorkflowState): WorkflowState => {
    let state = initialState;
    let shouldContinue: boolean;

    do {
        [state, shouldContinue] = next(state);
    } while (shouldContinue);

    printWorkflowSummary(state);
    return state;
};

// Example usage
const tasks_2 = [
    { "id": "A", "time": 3, "deps": [] },
    { "id": "B", "time": 2, "deps": ["A"] },
    { "id": "C", "time": 1, "deps": ["A"] },
    { "id": "D", "time": 4, "deps": ["B", "C"] },
    { "id": "E", "time": 1, "deps": ["D"] }
];

const initialState = initializeWorkflow(tasks_2, 2);
const finalState = runAll(initialState);