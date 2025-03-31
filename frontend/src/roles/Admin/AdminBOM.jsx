import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import CreateBOMModal from "./Estimation/createBOM";


const AdminBOM = () => {
    const { user } = useUser();
    const [bomList, setBOMList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();


    // 🔹 Redirect if user is not an admin
    useEffect(() => {
        if (!user || user.role.toLowerCase() !== "admin") {
            navigate("/unauthorized");
        }
    }, [user, navigate]);


    useEffect(() => {
        const fetchBOMList = async () => {
            console.log("🔄 Fetching BOM List...");


            try {
                // ✅ Get token from local storage directly
                const token = localStorage.getItem("token");
                if (!token) {
                    console.warn("⚠️ No token found in localStorage!");
                    return;
                }


                const response = await api.get("/bom", {
                    headers: { Authorization: `Bearer ${token}` }, // ✅ Use token
                });


                console.log("✅ BOM List Response:", response.data);
                setBOMList(response.data);
            } catch (error) {
                console.error("❌ Error fetching BOM list:", error);
            }
        };


        fetchBOMList(); // Call the function when the component mounts
    }, []); // Run only once on mount


    // 🔹 Handle BOM selection
const handleBOMClick = (bom) => {
    navigate(`/Estimation/BOMTable/${bom.bom_id}`); // Navigate to the correct path for BOMTable
};


    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Admin Estimation</h2>
            <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white p-2 mb-2 rounded">
                + New BOM
            </button>
            <CreateBOMModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onBOMCreated={() => window.location.reload()} />


            {/* BOM Containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {bomList.length > 0 ? (
                    bomList.map((bom) => (
                        <div
                            key={bom.bom_id}
                            className="border border-gray-300 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => handleBOMClick(bom)}
                        >
                            <h3 className="font-semibold">{bom.project_name}</h3>
                            <p className="text-sm text-gray-600">{bom.location}</p>
                            <p className="text-sm text-gray-500">{bom.subject}</p>
                            <p className="text-sm text-gray-400">Owner: {bom.owner}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No BOM records found.</p>
                )}
            </div>
        </div>
    );
};


export default AdminBOM;



