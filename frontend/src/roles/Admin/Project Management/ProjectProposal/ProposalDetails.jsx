import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

const ProposalDetails = () => {
    const steps = [
        { to: "scope-of-work", label: "Scope of Works", number: 1 },
        { to: "quantity-take-off", label: "Quantity Take-Off", number: 2 },
        { to: "bill-of-quantities", label: "Bill of Quantities", number: 3 },
        { to: "bill-of-materials", label: "Bill of Materials", number: 4 },
        { to: "final-cost-estimation", label: "Final Cost Estimation", number: 5 },
    ];

    return (
        <div className="space-y-4 p-4">
            <ol className="flex items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm sm:text-base sm:p-4 sm:space-x-4 rtl:space-x-reverse">
                {steps.map(({ to, label, number }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center group ${
                                    isActive ? "text-blue-600" : "text-gray-500"
                                } no-underline`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`flex items-center justify-center w-5 h-5 me-2 text-xs rounded-full shrink-0 border ${
                                            isActive
                                                ? "border-blue-600 text-blue-600"
                                                : "border-gray-500"
                                        }`}
                                    >
                                        {number}
                                    </span>
                                    {label}
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ol>

            <div className="bg-white p-4 shadow rounded">
                <Outlet />
            </div>
        </div>
    );
};

export default ProposalDetails;
