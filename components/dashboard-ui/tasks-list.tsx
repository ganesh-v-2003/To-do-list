"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(
        parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
      );
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      completed: false,
      priority: newTaskPriority,
      createdAt: new Date(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
  };

  const saveEdit = () => {
    if (!editTitle.trim() || !editingId) return;

    setTasks(
      tasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              title: editTitle.trim(),
              description: editDescription.trim() || undefined,
              priority: editPriority,
            }
          : task
      )
    );

    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("medium");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("medium");
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Add Task Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTask();
                }
              }}
            />
            <Input
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTask();
                }
              }}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  Priority:
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(
                      e.target.value as "low" | "medium" | "high"
                    )
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Button onClick={addTask} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed ({completedCount})
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {activeCount} active, {completedCount} completed
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === "all"
                ? "No tasks yet. Add one above to get started!"
                : filter === "active"
                ? "No active tasks. Great job!"
                : "No completed tasks yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className={task.completed ? "opacity-75" : ""}>
              <CardContent className="p-4">
                {editingId === task.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task title..."
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">
                          Priority:
                        </label>
                        <select
                          value={editPriority}
                          onChange={(e) =>
                            setEditPriority(
                              e.target.value as "low" | "medium" | "high"
                            )
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="flex gap-2 ml-auto">
                        <Button size="sm" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p
                              className={`text-sm mt-1 ${
                                task.completed
                                  ? "text-muted-foreground line-through"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={`${
                                priorityColors[task.priority]
                              } text-white border-0`}
                            >
                              {priorityLabels[task.priority]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(task)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
// kjfklasjdflkasjdf
// kjfklasjdflkasjdf
