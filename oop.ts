interface Task {
    id: string;
    time: number;
    deps: string[];
}

class TaskNode {
    id: string;
    time: number;
    deps: string[];
    status: 'pending' | 'running' | 'completed';
    startTime: number | null;
    endTime: number | null;

    constructor(task: Task) {
        this.id = task.id;
        this.time = task.time;
        this.deps = task.deps;
        this.status = 'pending';
        this.startTime = null;
        this.endTime = null;
    }
}

class TaskQueue {
    private nodes: Map<string, TaskNode>;
    private currentTime: number;
    private runningTasks: Set<string>;
    private maxConcurrent: number;

    constructor(tasks: Task[], maxConcurrent: number) {
        this.nodes = new Map();
        this.currentTime = 0;
        this.runningTasks = new Set();
        this.maxConcurrent = maxConcurrent;

        // Initialize nodes
        // biome-ignore lint/complexity/noForEach: <explanation>
        tasks.forEach(task => {
            this.nodes.set(task.id, new TaskNode(task));
        });
    }

    private canStartTask(taskId: string): boolean {
        const task = this.nodes.get(taskId);
        if (!task || task.status !== 'pending') return false;

        // Check if all dependencies are completed
        return task.deps.every(depId => {
            const depTask = this.nodes.get(depId);
            return depTask && depTask.status === 'completed';
        });
    }

    private getAvailableTasks(): TaskNode[] {
        const available: TaskNode[] = [];
        // biome-ignore lint/complexity/noForEach: <explanation>
        this.nodes.forEach(node => {
            if (this.canStartTask(node.id)) {
                available.push(node);
            }
        });
        return available;
    }

    public next(): boolean {
        // Update running tasks
        // biome-ignore lint/complexity/noForEach: <explanation>
            this.runningTasks.forEach(taskId => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const task = this.nodes.get(taskId)!;
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            if (task.startTime! + task.time <= this.currentTime) {
                task.status = 'completed';
                task.endTime = this.currentTime;
                this.runningTasks.delete(taskId);
                console.log(`Task ${task.id} completed at time ${this.currentTime}`);
            }
        });

        // Start new tasks if possible
        while (this.runningTasks.size < this.maxConcurrent) {
            const availableTasks = this.getAvailableTasks();
            if (availableTasks.length === 0) break;

            const nextTask = availableTasks[0];
            nextTask.status = 'running';
            nextTask.startTime = this.currentTime;
            this.runningTasks.add(nextTask.id);
            console.log(`Starting task ${nextTask.id} at time ${this.currentTime}`);
        }

        // Increment time if there are still running tasks
        if (this.runningTasks.size > 0) {
            this.currentTime++;
            return true;
        }

        // Check if all tasks are completed
        return Array.from(this.nodes.values()).some(node => node.status !== 'completed');
    }

    public runAll(): void {
        while (this.next()) {
            // Continue until all tasks are completed
        }
        this.printSummary();
    }

    private printSummary(): void {
        console.log('\nWorkflow Summary:');
        console.log('----------------');
        // biome-ignore lint/complexity/noForEach: <explanation>
        this.nodes.forEach(node => {
            console.log(
                `Task ${node.id}: Started at ${node.startTime}, ` +
                `Completed at ${node.endTime}, Duration: ${node.time}`
            );
        });
        console.log(`Total time: ${this.currentTime} units`);
    }
}

// Example usage:
const tasks = [
    { "id": "A", "time": 3, "deps": [] },
    { "id": "Y", "time": 3, "deps": [] },
    { "id": "B", "time": 2, "deps": ["A"] },
    { "id": "C", "time": 1, "deps": ["A"] },
    { "id": "Z", "time": 2, "deps": ["A"]},
    { "id": "D", "time": 4, "deps": ["B", "C"] },
    { "id": "E", "time": 1, "deps": ["D"] }
];

const workflow = new TaskQueue(tasks, 3);
workflow.runAll();