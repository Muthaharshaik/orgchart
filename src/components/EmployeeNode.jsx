import React, { createElement, memo } from "react";

/**
 * EmployeeNode Component
 * Displays individual employee card in the organization chart
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const EmployeeNode = memo(function EmployeeNode({
    employee, 
    showImages, 
    showDepartment, 
    onClick, 
    isHighlighted = false, 
    nodeRef, 
    isCollapsed = false, 
    hasChildren = false, 
    onToggleCollapse 
}) {
    const directReports = employee.children?.length || 0;

    /**
     * Handle node click
     */
    const handleClick = () => {
        if (onClick) {
            onClick(employee);
        }
    };

    /**
     * Handle keyboard navigation for node
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    /**
     * Handle collapse/expand toggle
     */
    const handleCollapseClick = (e) => {
        e.stopPropagation();
        if (onToggleCollapse) {
            onToggleCollapse(employee.id, e);
        }
    };

    /**
     * Handle keyboard navigation for collapse button
     */
    const handleCollapseKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleCollapse) {
                onToggleCollapse(employee.id, e);
            }
        }
    };

    /**
     * Generate initials for placeholder avatar
     */
    const getInitials = () => {
        if (!employee?.name) return '?';
        return employee.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    return (
        <div
            ref={nodeRef}
            className={`org-chart-node ${isHighlighted ? 'highlighted' : ''} ${showImages ? 'with-image' : 'no-image'} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="treeitem"
            tabIndex={0}
            aria-expanded={hasChildren ? !isCollapsed : undefined}
            aria-label={`${employee.name}${employee.title ? `, ${employee.title}` : ''}${hasChildren ? `, ${directReports} direct reports` : ''}`}
        >
            <div className="node-inner">
                {/* Profile Image */}
                {showImages && (
                    <div className="node-image-container">
                        {employee.profileImage ? (
                            <img 
                                src={employee.profileImage}
                                alt={`${employee.name} profile`}
                                className="node-image"
                                onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        {!employee.profileImage && (
                            <div 
                                className="node-image-placeholder"
                                aria-hidden="true"
                            >
                                {getInitials()}
                            </div>
                        )}
                    </div>
                )}

                {/* Employee Information */}
                <div className="node-content">
                    <div className="node-name">{employee.name || 'Unknown'}</div>
                    {employee.title && (
                        <div className="node-title">{employee.title}</div>
                    )}
                    {showDepartment && employee.department && (
                        <div className="node-department">{employee.department}</div>
                    )}
                    
                    {/* Collapse/Expand Badge */}
                    {hasChildren && directReports > 0 && (
                        <div 
                            className="node-badge" 
                            onClick={handleCollapseClick}
                            onKeyDown={handleCollapseKeyDown}
                            role="button"
                            tabIndex={0}
                            style={{ cursor: "pointer" }}
                            title={isCollapsed ? `Expand ${directReports} reports` : `Hide reports`}
                            aria-label={isCollapsed ? `Expand ${directReports} direct reports` : `Collapse ${directReports} direct reports`}
                        >
                            {isCollapsed
                                ? `Show ${directReports} ${directReports === 1 ? 'Report' : 'Reports'}`
                                : `Hide ${directReports} ${directReports === 1 ? 'Report' : 'Reports'}`
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if these specific props change
    return (
        prevProps.employee.id === nextProps.employee.id &&
        prevProps.isHighlighted === nextProps.isHighlighted &&
        prevProps.isCollapsed === nextProps.isCollapsed &&
        prevProps.showImages === nextProps.showImages &&
        prevProps.showDepartment === nextProps.showDepartment &&
        prevProps.hasChildren === nextProps.hasChildren &&
        prevProps.employee.name === nextProps.employee.name &&
        prevProps.employee.title === nextProps.employee.title &&
        prevProps.employee.department === nextProps.employee.department &&
        prevProps.employee.profileImage === nextProps.employee.profileImage
    );
});

export default EmployeeNode;