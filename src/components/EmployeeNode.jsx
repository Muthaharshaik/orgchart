import React, {createElement, memo } from "react";

/**
 * EmployeeNode Component (Profile removed)
 */
const EmployeeNode = memo(function EmployeeNode({
    employee,
    showDepartment,
    onClick,
    isHighlighted = false,
    nodeRef,
    isCollapsed = false,
    hasChildren = false,
    onToggleCollapse
}) {
    const directReports = employee.children?.length || 0;

    /** Handle node click */
    const handleClick = () => onClick && onClick(employee);

    /** Keyboard navigation */
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
        }
    };

    /** Toggle collapse */
    const toggleCollapse = (e) => {
        e.stopPropagation();
        onToggleCollapse && onToggleCollapse(employee.id, e);
    };

    /** Get initials for avatar placeholder */
    const getInitials = () => {
        if (!employee?.name) return "?";
        return employee.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join("");
    };

    return (
        <div
            ref={nodeRef}
            className={`org-chart-node ${isHighlighted ? "highlighted" : ""}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="treeitem"
            tabIndex={0}
            aria-expanded={hasChildren ? !isCollapsed : undefined}
            aria-label={`${employee.name}${employee.title ? `, ${employee.title}` : ""}${hasChildren ? `, ${directReports} direct reports` : ""}`}
        >
            <div className="node-inner">
                
                {/* 👇 Always show placeholder initials */}
                <div className="node-image-placeholder" aria-hidden="true">
                    {getInitials()}
                </div>

                {/* Employee details */}
                <div className="node-content">
                    <div className="node-name">{employee.name || "Unknown"}</div>
                    {employee.title && <div className="node-title">{employee.title}</div>}
                    {showDepartment && employee.department && (
                        <div className="node-department">{employee.department}</div>
                    )}

                    {/* Manage expand/collapse */}
                    {hasChildren && directReports > 0 && (
                        <div
                            className="node-badge"
                            onClick={toggleCollapse}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleCollapse(e)}
                            role="button"
                            tabIndex={0}
                            title={isCollapsed ? `Expand ${directReports} reports` : `Hide reports`}
                        >
                            {isCollapsed
                                ? `Show ${directReports} ${directReports === 1 ? "Report" : "Reports"}`
                                : `Hide ${directReports} ${directReports === 1 ? "Report" : "Reports"}`
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
},
// ✔ Memo props (removed profile related props)
(prev, next) =>
    prev.employee.id === next.employee.id &&
    prev.isHighlighted === next.isHighlighted &&
    prev.isCollapsed === next.isCollapsed &&
    prev.showDepartment === next.showDepartment &&
    prev.hasChildren === next.hasChildren &&
    prev.employee.name === next.employee.name &&
    prev.employee.title === next.employee.title &&
    prev.employee.department === next.employee.department
);

export default EmployeeNode;
