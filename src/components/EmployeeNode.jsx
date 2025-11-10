//This is the visual card for each employee

// import React from "react";

export default function EmployeeNode({employee, showImages, showDepartment, onClick}) {
    const directReports = employee.children?.length || 0;

    const handleClick = () => {
        if(onClick) {
            onClick(employee)
        }
    }

    return(
        <div
           className="org-chart-node"
           onClick={handleClick}
           role="button"
           tabIndex={0}
        >
            {/**Profile Image*/}
            {showImages && (
                <div className="node-image-container">
                    {employee.profileImage ? (
                        <img 
                           src={employee.profileImage}
                           alt={employee.name}
                           className="node-image"
                        />
                    ) : (
                         <div className="node-image-placeholder">
                            {employee.name.charAt(0).toUpperCase()}
                         </div>
                        )
                    }
                </div>
            )}

            {/**Employee Info */}
            <div className="node-content">
                <div className="node-name">{employee.name}</div>
                {employee.title && (
                    <div className="node-title">{employee.title}</div>
                )}
                {showDepartment && employee.department && (
                    <div className="node-department">{employee.department}</div>
                )}
            </div>

            {/** Direct Reports badge*/}
            {directReports > 0 && (
                <div className="node-badge">
                    {directReports} {directReports === 1 ? 'Report' : 'Reports'}
                </div>
            )}

        </div>
    )

}