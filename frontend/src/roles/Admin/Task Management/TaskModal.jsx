import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TaskModal({ task, onClose }) {
  const [form, setForm] = useState({
    task_name: "",
    task_description: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (task) {
      setForm(task);
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = task ? "PUT" : "POST";
    const url = task ? `/api/tasks/${task.id}` : "/api/tasks";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

      <div className="bg-white p-6 rounded-xl z-50 w-full max-w-md">
        <Dialog.Title className="text-lg font-medium mb-4">
          {task ? "Edit Task" : "Add New Task"}
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="task_name"
            placeholder="Task Name"
            value={form.task_name}
            onChange={handleChange}
            required
          />

          <Textarea
            name="task_description"
            placeholder="Task Description"
            value={form.task_description}
            onChange={handleChange}
          />

          <Input
            name="status"
            placeholder="Status (e.g., pending, in progress, done)"
            value={form.status}
            onChange={handleChange}
          />

          <Input
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
          />

          <Input
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
