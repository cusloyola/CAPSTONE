import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./pages/AuthPages/ProtectedRoute.jsx";

// Layouts
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// admin
import AdminDashboard from "./roles/Admin/AdminDashboard.jsx";
import AdminBOM from "./roles/Admin/AdminBOM.jsx";
import AdminBOQ from "./roles/Admin/AdminBOQ.jsx";
import InventortManagement from "./roles/Admin/InventoryManagement.jsx"




// site
import SiteEngineerDashboard from "./roles/SiteEngineer/SiteEngineerDashboard.jsx";
import SiteProgressTracking from "./roles/SiteEngineer/SiteProgressTacking.jsx"

import SafetyEngineerDashboard from "./roles/SafetyEngineer/SafetyEngineerDashboard.jsx";

// Other Pages
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";

// UI Elements
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";

// Charts
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

// Tables & Forms
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
// import ContractTemplate from "./roles/Admin/Contact Management/ContactTemplate.jsx";
// import LeaveContract from "./roles/Admin/Contact Management/LeaveContract.jsx";
// import EmploymentContract from "./roles/Admin/Contact Management/EmploymentContract.jsx";
// import ContractTemplate from "./roles/Admin/Contract Management/ContractTemplate.jsx";
import LeaveContract from "./roles/Admin/Contract Management/LeaveContract.jsx";
import EmploymentContract from "./roles/Admin/Contract Management/EmploymentContract.jsx";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />



            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="/AdminBOM" element={<AdminBOM />} />
              <Route path="/AdminBOQ" element={<AdminBOQ />} />
              <Route path="/InventoryManagement" element={<InventortManagement />} />
              <Route path="/LeaveContract" element={<LeaveContract />} />
              <Route path="/EmploymentContract" element={<EmploymentContract />} />
            </Route>



            <Route element={<ProtectedRoute allowedRoles={["site engineer"]} />}>
              <Route path="/SiteEngineerDashboard" element={<SiteEngineerDashboard />} />
              <Route path="/SiteProgressTracking" element={<SiteProgressTracking />} />
              
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["safetyengineer"]} />}>
              <Route path="/SafetyEngineerDashboard" element={<SafetyEngineerDashboard />} />
            </Route>

            {/* Other Pages */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* UI Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* Tables & Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
