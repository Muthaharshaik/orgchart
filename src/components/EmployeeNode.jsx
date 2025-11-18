//This is the visual card for each employee
import React, {createElement} from "react";

export default function EmployeeNode({employee, showImages, showDepartment, onClick, isHighlighted = false, nodeRef, isCollapsed = false, hasChildren = false, onToggleCollapse }) {
    const directReports = employee.children?.length || 0;

    const handleClick = () => {
        if(onClick) {
            onClick(employee)
        }
    }

    const handleCollapseClick = (e) => {
        e.stopPropagation(); // Prevent node click
        if (onToggleCollapse) {
            onToggleCollapse(employee.id, e);
        }
    }

    return(
        <div
           ref={nodeRef}
           className={`org-chart-node ${isHighlighted ? 'highlighted' : ''} ${showImages ? 'with-image' : 'no-image'} ${isCollapsed ? 'collapsed' : ''}`}
           onClick={handleClick}
           role="button"
           tabIndex={0}
        >
            {/* Horizontal layout: Image + Content side by side */}
            <div className="node-inner">
                {/**Profile Image - Left side*/}
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
                                {employee?.name?.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0,2).join('')}
                             </div>
                            )
                        }
                    </div>
                )}

                {/**Employee Info - Right side */}
                <div className="node-content">
                    <div className="node-name">{employee.name}</div>
                    {employee.title && (
                        <div className="node-title">{employee.title}</div>
                    )}
                    {showDepartment && employee.department && (
                        <div className="node-department">{employee.department}</div>
                    )}
                    
                    {/** Show badge only When collapsed */}
                    {hasChildren && directReports > 0 && (
                        <div className="node-badge" onClick={handleCollapseClick} style={{cursor: "pointer"}} title={isCollapsed ? `Expand ${directReports} reports` : `Hide reports`}>
                            {isCollapsed
                             ? `Show ${directReports} ${directReports === 1 ? 'Report' : 'Reports'}`
                             : `Hide ${directReports} ${directReports === 1 ? 'Report' : 'Reports'}`}                            </div>
                    )}
                </div>
            </div>
        </div>
    )
}