import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

function ClientViewModal({ isOpen, onClose, onSubmit, client, isEdit }) {
  const [formData, setFormData] = useState({
    client_name: client?.client_name || "",
    email: client?.email || "",
    phone_number: client?.phone_number || "",
    website: client?.website || "",
    industry: client?.industry || "",
    client_id: client?.client_id || null,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        client_name: client.client_name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        website: client.website || "",
        industry: client.industry || "",
        client_id: client.client_id || null,
      });
    } else {
      setFormData({
        client_name: "",
        email: "",
        phone_number: "",
        website: "",
        industry: "",
        client_id: null,
      });
    }
  }, [client, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} as={Fragment}>
      <DialogPanel className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <DialogPanel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800">
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
            >
              {isEdit ? "Edit Client" : "Create New Client"}
            </DialogTitle>
            <div className="mt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="client_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    id="client_name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                    value={formData.client_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    id="phone_number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    id="website"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    id="industry"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-indigo-500"
                  >
                    {isEdit ? "Update Client" : "Create Client"}
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default ClientViewModal;