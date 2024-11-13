# Functional Programming Test

## **Problem Statement**

You are given a directed acyclic graph (DAG) representing a set of tasks and their dependencies. Each node in the graph represents a task, and each edge represents a dependency between tasks. Your goal is to implement a task executor that processes these tasks in a valid order while maximizing parallelism.

## Input Format

The input is an array of task objects, where each task has:

- `id`: A unique string identifier
- `time`: The time units required to complete the task
- `deps`: An array of task IDs that must be completed before this task can start

Example input:

```json
[
  {"id": "A", "time": 3, "deps": []},
  {"id": "B", "time": 2, "deps": ["A"]},
  {"id": "C", "time": 1, "deps": ["A"]},
  {"id": "D", "time": 4, "deps": ["B", "C"]},
  {"id": "E", "time": 1, "deps": ["D"]}
]
```

## Requirements

1. Implement the solution using two different approaches:
    - Object-Oriented Programming with State Pattern
    - Functional Programming (hint: using JavaScript, TypeScript, Effect.ts, Rust, Haskell are preferred but any programming language of your choice is acceptable)
2. The executor should:
    - Respect all task dependencies
    - Maximize parallel execution where possible
    - Track and report execution time
    - Handle error cases (invalid dependencies, cycles, etc.)

## Example Outputs

### Sequential Execution (Non-Optimal)

```
Time 0-3:   [A]
Time 3-5:   [B]
Time 5-6:   [C]
Time 6-10:  [D]
Time 10-11: [E]
Total Time: 11 units
```

### Parallel Execution (Optimal)

```
Time 0-3:   [A]
Time 3-5:   [B, C]  // B and C can run in parallel after A
Time 5-9:   [D]
Time 9-10:  [E]
Total Time: 10 units
```

### Error Case Example

```json
// Input with circular dependency
[
  {"id": "A", "time": 1, "deps": ["B"]},
  {"id": "B", "time": 1, "deps": ["A"]}
]

// Expected Output
Error: Circular dependency detected between tasks A and B

```

## Expected Solution Features

### OOP State Pattern Implementation

Should demonstrate:

- Clear separation of task states (Pending, Running, Completed, Failed)
- State transitions handling
- Observer pattern for task completion events
- Clean dependency management

Example output:

```
TaskExecutor: Starting execution...
State change: Task A -> RUNNING
State change: Task A -> COMPLETED
State change: Task B,C -> RUNNING
State change: Task B -> COMPLETED
State change: Task C -> COMPLETED
State change: Task D -> RUNNING
State change: Task D -> COMPLETED
State change: Task E -> RUNNING
State change: Task E -> COMPLETED
Execution completed in 10 time units

```

### Functional Implementation

Should demonstrate:

- Pure functions for task scheduling
- Immutable state management
- Effect handling for parallel execution
- Composable error handling

Example output:

```
ExecutionPlan {
  parallel: [
    Chain(A -> [B, C] -> D -> E)
  ],
  totalTime: 10,
  executionLog: [
    (0, [(A, Started)]),
    (3, [(A, Completed), (B, Started), (C, Started)]),
    (5, [(B, Completed), (C, Completed), (D, Started)]),
    (9, [(D, Completed), (E, Started)]),
    (10, [(E, Completed)])
  ]
}

```