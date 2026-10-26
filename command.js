// ============================================================================
// MODULE 2: js/command.js — Command Pattern Undo/Redo (20-Action History Stack)
// Project: JavaScript Task Management Application | Intern: Muhammad Hasan Sajid (SEP26-FE21-44)
// ============================================================================

export const MAX_HISTORY = 20;

export class CommandManager {
  constructor(onStackChange) {
    this.undoStack = [];
    this.redoStack = [];
    this.onStackChange = onStackChange;
  }

  executeCommand(command) {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > MAX_HISTORY) {
      this.undoStack.shift(); // Enforce strict 20-action cap
    }
    this.redoStack = [];
    this.notify(command.label);
  }

  undo() {
    if (!this.undoStack.length) return null;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
    this.notify(`Undid: ${command.label}`);
    return command;
  }

  redo() {
    if (!this.redoStack.length) return null;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    this.notify(`Redid: ${command.label}`);
    return command;
  }

  notify(lastActionLabel = '') {
    if (this.onStackChange) {
      this.onStackChange({
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
        maxHistory: MAX_HISTORY,
        lastActionLabel
      });
    }
  }
}

export class TaskMutationCommand {
  constructor(label, stateRef, nextTasksSnapshot, commitFn) {
    this.label = label;
    this.stateRef = stateRef;
    this.prevSnapshot = JSON.parse(JSON.stringify(stateRef.tasks));
    this.nextSnapshot = JSON.parse(JSON.stringify(nextTasksSnapshot));
    this.commitFn = commitFn;
  }

  execute() {
    this.stateRef.tasks = JSON.parse(JSON.stringify(this.nextSnapshot));
    this.commitFn();
  }

  undo() {
    this.stateRef.tasks = JSON.parse(JSON.stringify(this.prevSnapshot));
    this.commitFn();
  }
}
