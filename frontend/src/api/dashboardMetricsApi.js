import { API_URL } from "./api";

/**
 * Fetches all dashboard metrics with a single API call.
 * This function makes parallel requests to the various backend
 * endpoints and aggregates the results.
 * @returns {Promise<object>} An object containing the counts for
 * material requests, daily site reports, and projects.
 * @throws {Error} Throws an error if any of the fetch operations fail.
 */
export const fetchDashboardMetrics = async () => {
    try {
        // Define the API endpoints for each metric
        const materialRequestsUrl = `${API_URL}/dashboard-metrics/material-requests/count`;
        const dailySiteReportsUrl = `${API_URL}/dashboard-metrics/daily-site-reports/count`;
        const projectCountsUrl = `${API_URL}/dashboard-metrics/projects/counts`;

        // Use Promise.all to make parallel API calls for better performance
        const [
            materialRequestsResponse,
            dailySiteReportsResponse,
            projectCountsResponse
        ] = await Promise.all([
            fetch(materialRequestsUrl),
            fetch(dailySiteReportsUrl),
            fetch(projectCountsUrl),
        ]);

        // Check if all responses were successful
        if (!materialRequestsResponse.ok) {
            throw new Error(`HTTP error! Status: ${materialRequestsResponse.status} for material requests.`);
        }
        if (!dailySiteReportsResponse.ok) {
            throw new Error(`HTTP error! Status: ${dailySiteReportsResponse.status} for daily site reports.`);
        }
        if (!projectCountsResponse.ok) {
            throw new Error(`HTTP error! Status: ${projectCountsResponse.status} for project counts.`);
        }

        // Parse JSON from each response
        const materialRequestsData = await materialRequestsResponse.json();
        const dailySiteReportsData = await dailySiteReportsResponse.json();
        const projectCountsData = await projectCountsResponse.json();

        // Combine all data into a single object and return it
        const combinedMetrics = {
            ...materialRequestsData,
            ...dailySiteReportsData,
            ...projectCountsData,
        };

        return combinedMetrics;
    } catch (error) {
        console.error('API Error: Failed to fetch dashboard metrics:', error);
        throw new Error('Failed to fetch dashboard metrics. Please check your network and the API server.');
    }
};
