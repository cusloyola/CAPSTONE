import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import AdminReports from "./roles/Admin/Reports.jsx";
import MaterialRequestManagement from "./roles/Admin/MaterialRequestManagemet.jsx";
import EmployeeManagement from "./roles/Admin/EmployeeManagement.jsx";
import ViewSafetyReportAdmin from "./roles/Admin/Safety Report/SafetyReportsManagement.jsx";
import ViewIncidentReportAdmin from "./roles/Admin/Incident Report/ViewIncidentReportAdmin.jsx";

import ResoureManagement from "./roles/Admin/Resource Management/ResourceManagement.jsx";

// site
import SiteEngineerDashboard from "./roles/SiteEngineer/Site Engineer Dashboard/SiteEngineerDashboard.jsx";
import DailySiteReport from "./roles/SiteEngineer/Site Progress Tracking/DailySiteReport.jsx";
import RequestMaterial from "./roles/SiteEngineer/RequestMaterial.jsx";
import MaterialRequestHistory from "./roles/SiteEngineer/ViewRequestHistory.jsx";

// safety
import SafetyReport from "./roles/SafetyEngineer/Safety Reports/SafetyReport.jsx";
import ViewSafetyHistory from "./roles/SafetyEngineer/ViewHistorySafetyReport.jsx";
import IncidentReport from "./roles/SafetyEngineer/Incident Report/IncidentReport.jsx";
import ViewHistoryIncidentReport from "./roles/SafetyEngineer/Incident Report/ViewHistoryIncidentReport.jsx";
import InspectionChecklistReport from "./roles/SafetyEngineer/Inspection Checklist Report/InspectionChecklistReport.jsx";

import LowStockInventory from "./roles/Admin/InventoryMonitoring.jsx";
import UserManagement from "./roles/Admin/UserManagement.jsx";

// toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import LeaveContract from "./roles/Admin/Contract Management/LeaveContract.jsx";
import EmploymentContract from "./roles/Admin/Contract Management/EmploymentContract.jsx";
import BOMTable from "./roles/Admin/Estimation/BOMTable.jsx";

// Projects CRUD
import ProjectsCRUD from "./roles/Admin/Project Management/ProjectsCRUD.jsx";
import ProjectProfile from "./roles/Admin/Project Management/ProjectProfile.jsx";
import ProjectLayout from "./roles/Admin/Project Management/ProjectLayout.jsx";

//estimation (proposal)
import ScopeOfWorks from "./roles/Admin/ProjectEstimation/ScopeOfWorkProposal/ScopeOfWorks.jsx";
import SowItems from "./roles/Admin/ProjectEstimation/ScopeOfWorksTables/sowItems.jsx";
import SowTypes from "./roles/Admin/ProjectEstimation/ScopeOfWorksTables/sowTypes.jsx";
import SOWTables from "./roles/Admin/ProjectEstimation/ScopeOfWorksTables/SOWTables.jsx";

import QuantityTakeOffTable from "./roles/Admin/ProjectEstimation/QuantityTakeOff/QTOCrud/QuantityTakeOff.jsx";
import MaterialUnitCost from "./roles/Admin/ProjectEstimation/MaterialUnitCost/MUCCrud/MaterialUnitCost.jsx";
import LaborUnitCost from "./roles/Admin/ProjectEstimation/LaborUnitCost/LUCCrud/LaborUnitCost.jsx";

import FinalCostEstimation from "./roles/Admin/ProjectEstimation/FinalCostEstimation/FinalCostEstimation.jsx";

import AllPendingProjects from "./roles/Admin/Project Management/ProjectTable/AllPendingProjects.jsx";
import ProposalTable from "./roles/Admin/Project Management/ProjectProposal/ProposalTable/ProposalTable.jsx";
import ProposalDetails from "./roles/Admin/Project Management/ProjectProposal/ProposalDetails.jsx";
import ProjectInfo from "./roles/Admin/Project Management/ProjectInfo.jsx";

import InProgressProjectTable from "./roles/Admin/Project Management/InProgressProjects/InProgressProjectTable/InProgressProjectTable.jsx";

import ProgressCharts from "./roles/Admin/Progress Billing/Progress Billing Charts/ProgressCharts.jsx";
import ProgressBillingTable from "./roles/Admin/Progress Billing/Progress Billing Table/ProgressBillingTable.jsx";
import ProgressBillingActual from "./roles/Admin/Progress Billing/Progress Billing Actual/ProgressBillingActual.jsx";

import ProgressBillingPage from "./roles/Admin/Progress Billing/ProgressBillingPage.jsx";
import BillingDetails from "./roles/Admin/Progress Billing/BillingDetails.jsx";



//Admin Site Report
import AdminDailySiteReport from "./roles/Admin/Site Report/Admin Daily Site Report/AdminDailySiteReport.jsx";






import WeeklySafetyReport from "./roles/Admin/Safety Report/Weekly Safety Report/WeeklySafetyReport.jsx";
import MonthlySafetyReport from "./roles/Admin/Safety Report/Monthly Safety Report/MonthlySafetyReport.jsx";

import AdminSiteReport from "./roles/Admin/AdminSiteReports.jsx";
import AdminFileManagement from "./roles/Admin/AdminFileManagement.jsx";
import ClientManagement from "./roles/Admin/ClientManagement.jsx";
import FilePage from "./roles/Admin/File Management/FilePage.jsx";
import FolderPage from "./roles/Admin/File Management/FolderPage.jsx";
import UploadDocument from "./roles/Admin/File Management/UploadDocument.jsx";
import SubFolderPage from "./roles/Admin/File Management/SubFolderPage.jsx";
import Task from "./roles/Admin/Task Management/TaskSchedule.jsx";


export default function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Redirect root to /signin */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Public Route: Sign In */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            {/* Admin Protected */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="/AdminBOM" element={<AdminBOM />} />
              <Route path="/AdminBOQ" element={<AdminBOQ />} />
              <Route path="/InventoryManagement" element={<InventortManagement />} />
              <Route path="/InventoryMonitoring" element={<LowStockInventory />} />
              <Route path="/LeaveContract" element={<LeaveContract />} />
              <Route path="/EmploymentContract" element={<EmploymentContract />} />
              <Route path="/UserManagement" element={<UserManagement />} />
              <Route path="/AdminCalendar" element={<Calendar />} />
              <Route path="/SafetyReportsManagement" element={<ViewSafetyReportAdmin />} />
              <Route path="/AddProject" element={<ProjectsCRUD />} />
              <Route path="/ViewIncidentReportAdmin" element={<ViewIncidentReportAdmin />} />
              <Route path="/AllPendingProjects" element={<AllPendingProjects />} />
              <Route path="/InProgressProjectTable" element={<InProgressProjectTable />} />
              <Route path="/ResourceManagement" element={<ResoureManagement />} />

              <Route path="/AllPendingProjects/:project_id/profile" element={<ProjectLayout />}>
                <Route element={<ProjectProfile />}>
                  <Route index element={<ProjectInfo />} />
                  <Route path="info" element={<ProjectInfo />} />
                  <Route path="proposals" element={<ProposalTable />} />
                  <Route path="proposals/:proposal_id" element={<ProposalDetails />}>
                    <Route path="scope-of-work" element={<ScopeOfWorks />} />
                    <Route path="quantity-take-off" element={<QuantityTakeOffTable />} />
                    <Route path="material-unit-cost" element={<MaterialUnitCost />} />
                    <Route path="labor-unit-cost" element={<LaborUnitCost />} />
                    <Route path="final-cost-estimation" element={<FinalCostEstimation />} />
                  </Route>
                </Route>
              </Route>


              <Route path="/InProgressProjectTable/:project_id/profile" element={<ProjectLayout />}>
                <Route element={<ProjectProfile />}>

                  <Route index element={<ProjectInfo />} />
                  <Route path="info" element={<ProjectInfo />} />

                  {/* Proposals */}
                  <Route path="proposals" element={<ProposalTable />} />
                  <Route path="proposals/:proposal_id" element={<ProposalDetails />}>
                    <Route path="scope-of-work" element={<ScopeOfWorks />} />
                    <Route path="quantity-take-off" element={<QuantityTakeOffTable />} />
                    <Route path="material-unit-cost" element={<MaterialUnitCost />} />
                    <Route path="labor-unit-cost" element={<LaborUnitCost />} />
                    <Route path="final-cost-estimation" element={<FinalCostEstimation />} />
                  </Route>

                  <Route path="billing" element={<ProgressBillingPage />} />

                  <Route path="billing/:billing_id" element={<BillingDetails />}>
                    <Route index element={<Navigate to="table" replace />} />  {/* 👈 Default tab */}
                    <Route path="table" element={<ProgressBillingActual />} /> {/* ← Replace with your actual component */}
                    <Route path="chart" element={<ProgressCharts />} />
                  </Route>


                  <Route path="site-reports/daily" element={<AdminDailySiteReport />} />
                  <Route path="safety-reports/monthly-safety" element={<MonthlySafetyReport />} />

                  <Route path="safety-reports/weekly-safety" element={<WeeklySafetyReport />} />
                  <Route path="safety-reports/monthly-safety" element={<MonthlySafetyReport />} />
                </Route>
              </Route>


              <Route path="/AllPendingProjects/:project_id/estimation/scope-of-work" element={<ScopeOfWorks />} />
              <Route path="/AllPendingProjects/:project_id/estimation/scope-of-work/tables" element={<SOWTables />} />
              <Route path="/AllPendingProjects/:project_id/estimation/scope-of-work/tables/sowItems" element={<SowItems />} />
              <Route path="/AllPendingProjects/:project_id/estimation/scope-of-work/tables/sowTypes" element={<SowTypes />} />

              <Route path="/Estimation/BOMTable/:bomId" element={<BOMTable />} />
              <Route path="/Reports" element={<AdminReports />} />
              <Route path="/MaterialRequestManagement" element={<MaterialRequestManagement />} />
              <Route path="/EmployeeManagement" element={<EmployeeManagement />} />

              <Route path="/AdminSiteReports" element={<AdminSiteReport />} />
              <Route path="/AdminFileManagement" element={<AdminFileManagement />} />
              <Route path="/ClientManagement" element={<ClientManagement />} />

              <Route path="/TaskManagement" element={<Task />} />

              <Route path="/clients/:clientId/folders" element={<FolderPage />} />
              <Route path="/clients/:clientId/folders/:folderId" element={<SubFolderPage />} />
              <Route path="/clients/:clientId/folders/:folderId/upload" element={<UploadDocument />} />
              <Route path="/file-page" element={<FilePage />} />
            </Route>

            {/* Site Engineer Protected */}
            <Route element={<ProtectedRoute allowedRoles={["site engineer"]} />}>
             <Route path="/SiteEngineerDashboard" element={<SiteEngineerDashboard />} />
              <Route path= "/DailySiteReport" element={<DailySiteReport/>} />
              <Route path="/RequestMaterial" element={<RequestMaterial />} />
              <Route path="/ViewRequestHistory" element={<MaterialRequestHistory />} />
            </Route>

            {/* Safety Engineer Protected */}
            <Route element={<ProtectedRoute allowedRoles={["safety engineer"]} />}>
              <Route path="/SafetyEngineerDashboard" element={<SafetyEngineerDashboard />} />
              <Route path="/SafetyReport" element={<SafetyReport />} />
              <Route path="/ViewHistorySafetyReport" element={<ViewSafetyHistory />} />

              <Route path="/IncidentReport" element={<IncidentReport />} />
              <Route path="/ViewHistoryIncidentReport" element={<ViewHistoryIncidentReport />} />
              <Route path="/InspectionChecklistReport" element={<InspectionChecklistReport />} />
            </Route>

            {/* Other Pages (if you want these protected, wrap in ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<UserProfiles />} />
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
          </Route>

          {/* 404 Not Found: redirect to /signin */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
      {/*TOAST*/}
      <ToastContainer position="top-right" autoClose={3000} />
    </UserProvider>
  );
}
