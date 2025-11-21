import React, {useState, useEffect, useRef, createElement, useCallback} from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import EmployeeNode from "./components/EmployeeNode";
import { buildHierarchy, searchEmployees } from "./utils/dataTransformer";
import ErrorBoundary from "./components/ErrorBoundary"
import './ui/OrgChart.css'
import html2canvas from "html2canvas";

export default function OrgChart(props) {
    const {
        employeeEntity,
        employeeId,
        managerId,
        employeeName,
        employeeTitle,
        department,
        email,
        phoneNumber,
        showDepartment,
        onNodeClick,
        enableExport
    } = props;

    // State management
    const [hierarchyData, setHierarchyData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [zoomLevel, setZoomLevel] = useState(0.8);
    const [highlightedNode, setHighlightedNode] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [collapsedNodes, setCollapsedNodes] = useState(new Set());
    const [error, setError] = useState(null);

    const chartRef = useRef(null);
    const highlightedNodeRef = useRef(null);
    const searchRef = useRef(null);
    const treeRef = useRef(null);
    
    // Auto-scroll to highlighted node
    useEffect(() => {
        if(highlightedNode && highlightedNodeRef.current) {
            try {
                highlightedNodeRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            } catch (err) {
                // Fallback for older browsers
                highlightedNodeRef.current.scrollIntoView(false);
            }
        }
    }, [highlightedNode]);

    // Transform Mendix data to usable format
    useEffect(() => {
        try {
            if(employeeEntity?.status === 'available' && employeeEntity.items) {
                const employees = employeeEntity.items.map(item => {
                    const rawId = employeeId.get(item).value;
                    const rawManagerId = managerId.get(item).value;
                    
                    const stringId = rawId ? String(rawId) : null;
                    const stringManagerId = rawManagerId ? String(rawManagerId) : null;
                    
                    return {
                        id: stringId,
                        managerId: stringManagerId,
                        name: employeeName.get(item).value || 'Unknown',
                        title: employeeTitle?.get(item).value || '',
                        department: department?.get(item).value || '',
                        email: email?.get(item).value || '',
                        phone: phoneNumber?.get(item).value || '',
                        mendixObject: item
                    };
                });

                const tree = buildHierarchy(employees);
                if (tree) {
                    setHierarchyData(tree);
                    setError(null);
                } else {
                    setError('Unable to build organization hierarchy. Please check your data structure.');
                }
            }
        } catch (err) {
            setError('Error processing employee data: ' + err.message);
        }
    }, [employeeEntity, employeeId, managerId, employeeName, employeeTitle, department, email, phoneNumber]);

    // Initial centering when hierarchy data loads
    useEffect(() => {
        if (hierarchyData && chartRef.current) {
            setTimeout(() => {
                try {
                    const wrapper = chartRef.current;
                    const scrollWidth = wrapper.scrollWidth;
                    const clientWidth = wrapper.clientWidth;
                    const centerScrollLeft = (scrollWidth - clientWidth) / 2;

                    wrapper.scrollTo({
                        left: centerScrollLeft,
                        behavior: 'auto'
                    });
                } catch (err) {
                    // Silent fail for centering - not critical
                }
            }, 100);
        }
    }, [hierarchyData]);

    /**
     * Expand path to a specific node (used for search)
     */
    const expandPathToNode = useCallback((targetNodeId) => {
        if (!hierarchyData) return;
        
        const pathNodes = [];
        
        const findPath = (node, target, path=[]) => {
            if (node.id === target) {
                pathNodes.push(...path);
                return true;
            }
            
            if (node.children) {
                for(const child of node.children) {
                    if (findPath(child, target, [...path, node.id])) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        findPath(hierarchyData, targetNodeId);
        
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            pathNodes.forEach(nodeId => newSet.delete(nodeId));
            return newSet;
        });
    }, [hierarchyData]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!searchTerm) return;
            
            if (e.key === 'Enter' && searchResults.length > 0) {
                e.preventDefault();
                if (e.shiftKey) {
                    handlePrevResult();
                } else {
                    handleNextResult();
                }
            }
            
            if (e.key === 'Escape') {
                handleRemove();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchTerm, searchResults, currentResultIndex]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    /**
     * Handle node click - triggers Mendix Action
     */
    const handleNodeClick = useCallback((employee) => {
    try {
            if (onNodeClick && onNodeClick.canExecute) {
                onNodeClick.execute();
        }
    } catch (err) {
            // Silent fail - action execution errors are handled by Mendix
    }
    }, [onNodeClick]);


    /**
     * Toggle collapse state for a node
     */
    const handleToggleCollapse = useCallback((nodeId, event) => {
        if(event) {
           event.stopPropagation();
        }
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    /**
     * Collapse all children except CEO
     */
    const handleCollapseAll = useCallback(() => {
        if (!hierarchyData) return;
        const allNodeIds = new Set();
        const collectNodeIds = (node) => {
            allNodeIds.add(node.id);
            if (node.children) {
                node.children.forEach(child => collectNodeIds(child));
            }
        };
        collectNodeIds(hierarchyData);
        setCollapsedNodes(allNodeIds);
    }, [hierarchyData]);

    /**
     * Expand all nodes
     */
    const handleExpandAll = useCallback(() => {
        setCollapsedNodes(new Set());
    }, []);

    /**
     * Handle search input change
     */
    const handleSearch = useCallback((event) => {
        const term = event.target.value;
        setSearchTerm(term);

        if(term && hierarchyData) {
            setIsSearching(true);
            
            setTimeout(() => {
                try {
                    const results = searchEmployees(hierarchyData, term);
                    setSearchResults(results);
                    setIsSearching(false);
                    setShowSearchDropdown(true);
                    
                    if(results.length > 0) {
                        setCurrentResultIndex(0);
                        setHighlightedNode(results[0].id);
                        expandPathToNode(results[0].id);
                    } else {
                        setHighlightedNode(null);
                    }
                } catch (err) {
                    setIsSearching(false);
                    setSearchResults([]);
                }
            }, 150);
        } else {
            setSearchResults([]);
            setHighlightedNode(null);
            setShowSearchDropdown(false);
            setIsSearching(false);
        }
    }, [hierarchyData, expandPathToNode]);

    /**
     * Select result from dropdown
     */
    const handleSelectResult = useCallback((result, index) => {
        setCurrentResultIndex(index);
        setHighlightedNode(result.id);
        setShowSearchDropdown(false);
        expandPathToNode(result.id);
    }, [expandPathToNode]);

    /**
     * Navigation functions
     */
    const handleNextResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentResultIndex + 1) % searchResults.length;
        setCurrentResultIndex(nextIndex);
        setHighlightedNode(searchResults[nextIndex].id);
        expandPathToNode(searchResults[nextIndex].id);
    }, [searchResults, currentResultIndex, expandPathToNode]);

    const handlePrevResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const prevIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
        setCurrentResultIndex(prevIndex);
        setHighlightedNode(searchResults[prevIndex].id);
        expandPathToNode(searchResults[prevIndex].id);
    }, [searchResults, currentResultIndex, expandPathToNode]);

    /**
     * Get hierarchy path helper
     */
    const getHierarchyPath = useCallback((employee) => {
        if (employee.department) {
            return employee.department;
        }
        return 'Organization';
    }, []);

    /**
     * Handle zoom controls
     */
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoomLevel(0.8);
        setSearchTerm('');
        setHighlightedNode(null);
    }, []);

    // Auto-scroll to center when zoom changes
    useEffect(() => {
        if (chartRef.current) {
            const wrapper = chartRef.current;
            
            setTimeout(() => {
                try {
                    const scrollWidth = wrapper.scrollWidth;
                    const clientWidth = wrapper.clientWidth;
                    const centerScrollLeft = (scrollWidth - clientWidth) / 2;
                    
                    wrapper.scrollTo({
                        left: centerScrollLeft,
                    });
                } catch (err) {
                    // Silent fail - not critical
                }
            }, 50);
        }
    }, [zoomLevel, hierarchyData]);

    const handleRemove = useCallback(() => {
        setSearchTerm('');
        setHighlightedNode(null);
        setSearchResults([]);
        setCurrentResultIndex(0);
        setShowSearchDropdown(false);
    }, []);

    /**
     * Export chart as PNG
     */
    const handleExport = useCallback(() => {
        if (!chartRef.current) return;

        try {
            html2canvas(chartRef.current, {
                backgroundColor: '#ffffff',
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'org-chart.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(error => {
                setError('Failed to export chart. Please try again.');
            });
        } catch (err) {
            setError('Export feature is not available in your browser.');
        }
    }, []);

    /**
     * Recursively render the org chart tree
     */
    const renderTree = useCallback((node) => {
        if(!node) return null;
        
        const isHighlighted = highlightedNode === node.id;
        const isCollapsed = collapsedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;        
        
        return(
            <TreeNode
                key={node.id}
                label={
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <EmployeeNode
                            employee={node}
                            showDepartment={showDepartment}
                            onClick={handleNodeClick}
                            isHighlighted={isHighlighted}
                            nodeRef={isHighlighted ? highlightedNodeRef : null}
                            isCollapsed={isCollapsed}
                            hasChildren={hasChildren}
                            onToggleCollapse={handleToggleCollapse}
                        />
                    </div>
                }
            >
                {!isCollapsed && hasChildren && node.children && node.children.length > 0 && 
                    node.children.map(child => renderTree(child))
                }
            </TreeNode>
        );
    }, [highlightedNode, collapsedNodes, showDepartment, handleNodeClick, handleToggleCollapse]);

    // Loading state
    if (!employeeEntity || employeeEntity.status === 'loading') {
        return (
            <div className="org-chart-container">
                <div className="org-chart-loading">Loading organization chart...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="org-chart-container">
                <div className="org-chart-error">
                    <div className="error-icon">⚠️</div>
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!hierarchyData) {
        return (
            <div className="org-chart-container">
                <div className="org-chart-empty">No employee data available</div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="org-chart-container">
                {/* Toolbar */}
                <div className="org-chart-toolbar">
                    {/* Search */}
                    <div className="toolbar-search" ref={searchRef}>
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search by name, title, or department..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                                aria-label="Search employees"
                            />
                            {isSearching && (
                                <div className="search-loading">
                                    <div className="spinner-small"></div>
                                </div>
                            )}
                            {searchTerm && !isSearching && (
                                <button
                                    className="search-clear"
                                    onClick={handleRemove}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {showSearchDropdown && searchResults.length > 0 && (
                            <div className="search-dropdown">
                                <div className="search-dropdown-header">
                                    <span className="results-count">
                                        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                                    </span>
                                    <div className="navigation-controls">
                                        <button
                                            onClick={handlePrevResult}
                                            className="nav-arrow"
                                            disabled={searchResults.length <= 1}
                                            title="Previous (Shift + Enter)"
                                            aria-label="Previous result"
                                        >
                                            ◀
                                        </button>
                                        <span className="nav-counter">
                                            {currentResultIndex + 1} / {searchResults.length}
                                        </span>
                                        <button
                                            onClick={handleNextResult}
                                            className="nav-arrow"
                                            disabled={searchResults.length <= 1}
                                            title="Next (Enter)"
                                            aria-label="Next result"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="search-dropdown-list">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={result.id}
                                            className={`search-result-item ${index === currentResultIndex ? 'active' : ''}`}
                                            onClick={() => handleSelectResult(result, index)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleSelectResult(result, index);
                                                }
                                            }}
                                        >
                                            <div className="result-avatar">
                                                    <div className="result-avatar-placeholder">
                                                        {result.name?.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('')}
                                                    </div>
                                            </div>
                                            <div className="result-info">
                                                <div className="result-name">{result.name}</div>
                                                {result.title && (
                                                    <div className="result-title">{result.title}</div>
                                                )}
                                                <div className="result-meta">
                                                    <span className="result-breadcrumb">
                                                        {getHierarchyPath(result)}
                                                    </span>
                                                    {result.children && result.children.length > 0 && (
                                                        <span className="result-reports">
                                                            • {result.children.length} {result.children.length === 1 ? 'report' : 'reports'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {index === currentResultIndex && (
                                                <div className="result-indicator">
                                                    <span className="current-badge">Current</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="search-dropdown-footer">
                                    <span className="keyboard-hint">
                                        Press <kbd>Enter</kbd> for next • <kbd>Esc</kbd> to close
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* No Results Message */}
                        {showSearchDropdown && searchResults.length === 0 && !isSearching && (
                            <div className="search-dropdown no-results">
                                <div className="no-results-icon">🔍</div>
                                <div className="no-results-text">No employees found</div>
                                <div className="no-results-hint">Try searching by name, title, or department</div>
                            </div>
                        )}
                    </div>

                    {/* Collapse Controls */}
                    <div className="toolbar-collapse">
                        <button
                            onClick={handleExpandAll}
                            className="collapse-button"
                            title="Expand all nodes"
                            aria-label="Expand all nodes"
                        >
                            Expand All
                        </button>
                        <button
                            onClick={handleCollapseAll}
                            className="collapse-button"
                            title="Collapse all nodes"
                            aria-label="Collapse all nodes"
                        >
                            Collapse All
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="toolbar-zoom">
                        <button
                            onClick={handleZoomOut}
                            className="zoom-button"
                            disabled={zoomLevel <= 0.5}
                            aria-label="Zoom out"
                            title="Zoom out"
                        >
                            −
                        </button>
                        <span className="zoom-level" aria-live="polite">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="zoom-button"
                            disabled={zoomLevel >= 1.5}
                            aria-label="Zoom in"
                            title="Zoom in"
                        >
                            +
                        </button>
                        <button
                            onClick={handleZoomReset}
                            className="zoom-button"
                            aria-label="Reset zoom"
                            title="Reset zoom"
                        >
                            ⟲
                        </button>
                    </div>

                    {/* Export Button */}
                    {enableExport && (
                        <button
                            onClick={handleExport}
                            className="export-button"
                            aria-label="Export as PNG"
                            title="Export organization chart as PNG"
                        >
                            📥 Export PNG
                        </button>
                    )}
                </div>

                {/* Chart Area */}
                <div 
                    className="org-chart-wrapper"
                    ref={chartRef}
                    role="tree"
                    aria-label="Organization chart"
                >
                    <div
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'left top',
                            transition: 'transform 0.2s ease',
                            display: 'inline-block',
                            minWidth: '100%'
                        }}
                    >
                        <Tree
                            lineWidth="2px"
                            lineColor="#bbb"
                            lineBorderRadius="10px"
                            label={
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <EmployeeNode
                                        employee={hierarchyData}
                                        showDepartment={showDepartment}
                                        onClick={handleNodeClick}
                                        isHighlighted={highlightedNode === hierarchyData.id}
                                        nodeRef={highlightedNode === hierarchyData.id ? highlightedNodeRef : null}
                                        isCollapsed={collapsedNodes.has(hierarchyData.id)}
                                        hasChildren={hierarchyData.children && hierarchyData.children.length > 0}
                                        onToggleCollapse={handleToggleCollapse}
                                    />
                                </div>
                            }
                        >
                            {!collapsedNodes.has(hierarchyData.id) && hierarchyData.children && 
                                hierarchyData.children.map(child => renderTree(child))
                            }
                        </Tree>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}