//This is the visual card for each employee
import React, {createElement} from "react";

export default function EmployeeNode({
    employee, 
    showImages, 
    showDepartment, 
    onClick, 
    isHighlighted = false, 
    nodeRef,
    // NEW: Collapse props
    isCollapsed = false,
    hasChildren = false,
    onToggleCollapse,
    hiddenCount = 0
}) {
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
                    
                    {/** Direct Reports badge - Shows when expanded */}
                    {!isCollapsed && directReports > 0 && (
                        <div className="node-badge">
                            {directReports} {directReports === 1 ? 'Report' : 'Reports'}
                        </div>
                    )}

                    {/** NEW: Hidden count badge - Shows when collapsed */}
                    {isCollapsed && hiddenCount > 0 && (
                        <div className="node-badge collapsed-badge">
                            +{hiddenCount} {hiddenCount === 1 ? 'hidden' : 'hidden'}
                        </div>
                    )}
                </div>
            </div>

            {/** NEW: Collapse/Expand button */}
            {hasChildren && (
                <button
                    className="node-collapse-button"
                    onClick={handleCollapseClick}
                    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    title={isCollapsed ? `Show ${hiddenCount} employees` : 'Hide reports'}
                >
                    <span className="collapse-icon">
                        {isCollapsed ? '⊕' : '⊖'}
                    </span>
                </button>
            )}
        </div>
    )
}