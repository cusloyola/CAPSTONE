import { useParams } from "react-router-dom";
import ProgressBillingTable from "../Progress Billing/Progress Billing Table/ProgressBillingTable";

const ProgressBillingPage = () => {
  const { project_id } = useParams();
  return <ProgressBillingTable key={project_id} project_id={project_id} />;
};

export default ProgressBillingPage;
