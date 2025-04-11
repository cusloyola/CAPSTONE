import React, { useState, useEffect } from 'react';
import { FaEye, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const inputStyle = {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
};

const errorStyle = {
    color: "red",
    fontSize: "0.8em",
    marginTop: "2px",
};

const submitButtonStyle = {
    padding: "10px 15px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1em",
};

const closeButtonStyle = {
    padding: "8px 12px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "0.9em",
};

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        first_name: '',
        last_name: '',
        role: '',
        contact_details: '',
        hire_date: null, // Initialize as null for DatePicker
    });
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewedEmployeeDetails, setViewedEmployeeDetails] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [formErrors, setFormErrors] = useState({});


    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/employee-accounts');
            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }
            const data = await response.json();
            setEmployees(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prevState => ({
            ...prevState,
            [name]: value
        }));
        setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Clear error on change
    };

    const handleDateChange = (date) => {
        setNewEmployee(prevState => ({
            ...prevState,
            hire_date: date
        }));
        setFormErrors(prevErrors => ({ ...prevErrors, 'hire_date': '' }));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const errors = {};

        if (!newEmployee.first_name?.trim()) {
            errors.first_name = 'First Name is required';
        }
        if (!newEmployee.last_name?.trim()) {
            errors.last_name = 'Last Name is required';
        }
        if (!newEmployee.role?.trim()) {
            errors.role = 'Role is required';
        }
        if (!newEmployee.hire_date) {
            errors.hire_date = 'Hire Date is required';
        }

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await fetch('http://localhost:5000/api/employee-accounts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: newEmployee.first_name,
                        last_name: newEmployee.last_name,
                        role: newEmployee.role,
                        contact_details: newEmployee.contact_details,
                        hire_date: newEmployee.hire_date.toISOString().split('T')[0], // Send as YYYY-MM-DD
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to add employee');
                }
                setShowAddModal(false);
                setSuccessMessage('Employee added successfully!');
                setShowSuccessModal(true);
                fetchEmployees();
                setNewEmployee({
                    first_name: '',
                    last_name: '',
                    contact_details: '',
                    role: '',
                    hire_date: null,
                });
                setFormErrors({});
            } catch (err) {
                setError(err.message);
            }
        } else {
            console.log('Validation errors:', errors);
        }
    };

    const handleViewEmployeeInfo = async (employee) => {
        try {
            const response = await fetch(`http://localhost:5000/api/employee-accounts/${employee.worker_id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch employee details');
            }
            const data = await response.json();
            setViewedEmployeeDetails(data);
            setShowViewModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewedEmployeeDetails(null);
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/employee-accounts/${employeeToDelete.worker_id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete employee');
            }
            setIsDeleteModalOpen(false);
            setSuccessMessage('Employee deleted successfully!');
            setShowSuccessModal(true);
            fetchEmployees();
        } catch (err) {
            setError(err.message);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    const handleEdit = (employee) => {
        setEditEmployee({ ...employee, hire_date: employee.hire_date ? new Date(employee.hire_date) : null });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setEditEmployee({ ...editEmployee, [e.target.name]: e.target.value });
    };

    const handleEditDateChange = (date) => {
        setEditEmployee({ ...editEmployee, hire_date: date });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/employee-accounts/${editEmployee.worker_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editEmployee,
                    hire_date: editEmployee.hire_date ? editEmployee.hire_date.toISOString().split('T')[0] : null,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update employee');
            }
            setIsEditModalOpen(false);
            setSuccessMessage('Employee updated successfully!');
            setShowSuccessModal(true);
            fetchEmployees();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            (employee.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.contact_details || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div>
            <h1>
                <span style={{ marginLeft: "25px", fontSize: '1.75em' }}><strong>Worker Management</strong></span>
            </h1>

            <br />
            {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

            <button
                onClick={() => setShowAddModal(true)}
                style={{ padding: "10px", marginLeft: "20px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
                + Add Employee
            </button>

            <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px", margin: "10px 0", marginLeft: "10px", width: "750px", borderRadius: "10px" }}
            />

            {showAddModal && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "5px",
                            width: "400px",
                        }}
                    >
                        <h3>Add New Worker</h3>
                        <form onSubmit={handleAddSubmit}>
                            <div>
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={newEmployee.first_name}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                                {formErrors.first_name && <p style={errorStyle}>{formErrors.first_name}</p>}
                            </div>
                            <div>
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={newEmployee.last_name}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                                {formErrors.last_name && <p style={errorStyle}>{formErrors.last_name}</p>}
                            </div>
                            <div>
                                <label htmlFor="role">Role</label>
                                <input
                                    type="text"
                                    id="role"
                                    name="role"
                                    value={newEmployee.role}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                                {formErrors.role && <p style={errorStyle}>{formErrors.role}</p>}
                            </div>
                            <div>
                                <label htmlFor="contact_details">Contact Details</label>
                                <input
                                    type="text"
                                    id="contact_details"
                                    name="contact_details"
                                    value={newEmployee.contact_details}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                />
                                {formErrors.contact_details && <p style={errorStyle}>{formErrors.contact_details}</p>}
                            </div>
                            <div>
                                <label htmlFor="hire_date">Hire Date</label>
                                <br></br>
                                <DatePicker
                                    id="hire_date"
                                    name="hire_date"
                                    selected={newEmployee.hire_date}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    style={inputStyle}
                                />
                                {formErrors.hire_date && <p style={errorStyle}>{formErrors.hire_date}</p>}
                            </div>
                            <div>
                                <br></br>
                                <button type="submit" style={submitButtonStyle}>
                                    Add Employee
                                </button>
                            </div>
                        </form>
                        <button onClick={() => setShowAddModal(false)} style={closeButtonStyle}>
                            Close
                        </button>
                    </div>
                </div>
            )}
            {loading ? (
                <p>⏳ Loading employees...</p>
            ) : filteredEmployees.length > 0 ? (
                <table style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#e0e0e0", textAlign: "left" }}>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "10%" }}>ID</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "30%" }}>Full Name</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "20%" }}>Role</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "25%" }}>Contact Details</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "15%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.worker_id} style={{ borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                                <td style={{ padding: "12px 15px", color: "black", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.worker_id}</td>
                                {/* <td style={{ padding: "12px 15px", color: "black", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{`${employee.first_name} ${employee.last_name}`}</td> */}
                                <td style={{ padding: "12px 15px", color: "black", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.full_name}</td>
                                <td style={{ padding: "12px 15px", color: "black", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.role}</td>
                                <td style={{ padding: "12px 15px", color: "black", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.contact_details}</td>
                                <td style={{ padding: "12px 15px", width: "20%" }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <button
                                            onClick={() => handleViewEmployeeInfo(employee)}
                                            style={{
                                                width: "auto",
                                                padding: "8px 10px",
                                                backgroundColor: "#3498db",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                marginRight: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <FaEye style={{ marginRight: '5px' }} /> View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(employee)}
                                            style={{
                                                width: "auto",
                                                padding: "8px 10px",
                                                backgroundColor: "#f1c40f",
                                                color: "black",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                marginRight: '5px',display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        ><FaPencilAlt style={{ marginRight: '5px' }} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(employee)}
                                            style={{
                                                width: "auto",
                                                padding: "8px 10px",
                                                backgroundColor: "#e74c3c",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <FaTrashAlt style={{ marginRight: '5px' }} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{
                    textAlign: 'center',
                    fontSize: '1.2em',
                    fontWeight: 'bold',
                    color: 'red',
                    padding: '20px',
                    margin: '20px auto',
                    width: '80%',
                    maxWidth: '600px',
                }}>
                    📭 No matching employees found!
                </p>
            )}

            {isDeleteModalOpen && employeeToDelete && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "8px",
                            width: "350px",
                            textAlign: "center",
                            boxShadow: "0 4px 8px rgba0, 0, 0, 0.2)",
                        }}
                    >
                        <h3>Confirm Delete</h3>
                        <p style={{ marginBottom: '20px' }}>Are you sure you want to delete {employeeToDelete.full_name}?</p>
                        <div>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#e74c3c",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginRight: "10px",
                                    fontSize: '16px',
                                }}
                            >
                                Confirm Delete
                            </button>
                            <button
                                onClick={closeDeleteModal}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor:"#3498db",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: '16px',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '300px', textAlign: 'center' }}>
                        <p>{successMessage}</p>
                        <button onClick={() => setShowSuccessModal(false)} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>OK</button>
                    </div>
                </div>
            )}
            {showViewModal && viewedEmployeeDetails && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "400px",
                            textAlign: "left",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <h3 style={{ marginBottom: "15px", textAlign: "center" }}>Employee Information</h3>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>ID:</strong> {viewedEmployeeDetails?.worker_id}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            {/* <strong>Full Name:</strong> {`${viewedEmployeeDetails?.first_name} ${viewedEmployeeDetails?.last_name}`} */}
                            <strong>Full Name:</strong> {viewedEmployeeDetails?.full_name}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Contact Details:</strong> {viewedEmployeeDetails?.contact_details}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Role:</strong> {viewedEmployeeDetails?.role}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Hire Date:</strong> {viewedEmployeeDetails?.hire_date?.split('T')[0]}
                        </p>
                        <div style={{ textAlign: "center" }}>
                            <button
                                onClick={closeViewModal}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isEditModalOpen && editEmployee && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "5px",
                            width: "400px",
                        }}
                    >
                        <h3>Edit Employee</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div>
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={editEmployee.first_name || ''}
                                    onChange={handleEditChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={editEmployee.last_name || ''}
                                    onChange={handleEditChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Contact Details</label>
                                <input
                                    type="text"
                                    name="contact_details"
                                    value={editEmployee.contact_details || ''}
                                    onChange={handleEditChange}
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                            </div>
                            <div>
                                <label>Hire Date</label>
                                <DatePicker
                                    name="hire_date"
                                    selected={editEmployee.hire_date}
                                    onChange={handleEditDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
                                    Update Employee</button>
                            </div>
                        </form>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "10px",
                                fontSize: "0.9em",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;