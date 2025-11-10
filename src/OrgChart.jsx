import React, {useState, useEffect, useRef} from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import EmployeeNode from "./components/EmployeeNode";
import { buildHierarchy, searchEmployees } from "./utils/dataTransformer";
import './ui/OrgChart.css'
import html2canvas from "html2canvas";

export default function OrgChart(props) {
    const {
        employeeEntity,
        employeeId,
        managerId,
        employeeName,
        employeeTitle,
        profileImage,
        department,
        email,
        phoneNumber,
        // chartDirection,
        showImages,
        showDepartment,
        onNodeClick,
        enableExport
    } = props;

    //state management
    const [hierarchyData, setHierarchyData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('')
    const [zoomLevel, setZoomLevel] = useState(1);
    const [highlightedNode, setHighlightedNode] = useState(null);

    const chartRef = useRef(null);

    //Transform Mendix DATA to usable format
    useEffect(() => {
        if(employeeEntity?.status === 'available' && employeeEntity.items) {
            const employees = employeeEntity.items.map(item => ({
                id: employeeId.get(item).value,
                managerId: managerId.get(item).value,
                name: employeeName.get(item).value || 'Unknown',
                title: employeeTitle?.get(item).value || '',
                profileImage: profileImage?.get(item).value || '',
                department: department?.get(item).value || '',
                email: email?.get(item).value || '',
                phone: phoneNumber?.get(item).value || '',
                mendixObject: item // Keep reference for actions
            }))

            const tree = buildHierarchy(employees);
            setHierarchyData(tree);
        }
    }, [employeeEntity, employeeId, managerId, employeeName, employeeTitle, profileImage, department, email, phoneNumber])

    /**
     * Handle node click - triggers Mendix Action
    */
    const handleNodeClick = (employee) => {
        if (onNodeClick && onNodeClick.canExecute) {
            onNodeClick.execute()
        }
    }

    /**
     * Handle Search input change
    */
   const handleSearch = (event) => {
       const term = event.target.value;
       setSearchTerm(term);

       if(term && hierarchyData) {
          const results = searchEmployees(hierarchyData, term)
          //Highlight first result
          if(results.length > 0) {
            setHighlightedNode(results[0].id)
          } else {
            setHighlightedNode(null)
          }
       } else {
          setHighlightedNode(null);
       }
   }

   /**
    * Handle zoom in , zoom out and Reset Zoom
   */
   const handleZoomIn = () => {
       setZoomLevel(prev => Math.min(prev + 0.1, 2)); //Max:200
   }

   const handleZoomOut = () => {
       setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); //Min:50
   }

   const handleZoomReset = () => {
       setZoomLevel(1)
   }

    /**
     * Export chart as PNG
     */
    const handleExport = () => {
        if (!chartRef.current) return;

        // Use regular import instead of dynamic
        html2canvas(chartRef.current, {
            backgroundColor: '#ffffff',
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'org-chart.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('Export failed:', error);
        });
    };

   /**
    * Recursively render the org chat tree
    */
   const renderTree = (node) => {
      if(!node) return null;
      const isHighlighted = highlightedNode === node.id
      return(
          <TreeNode
              label = {
                   <div className={isHighlighted ? 'highlighted' : ''}>
                       <EmployeeNode
                          employee={node}
                          showImages={showImages}
                          showDepartment={showDepartment}
                          onClick={handleNodeClick}
                        />
                   </div>
              }
          >
                {node.children && node.children.length > 0 && (
                    node.children.map(child => (
                        <React.Fragment key={child.id}>
                            {renderTree(child)}
                        </React.Fragment>
                    ))
                )}
         </TreeNode>
      )
   }

    //MAIN RENDER
    // Loading state
    if (!employeeEntity || employeeEntity.status === 'loading') {
        return <div className="org-chart-loading">Loading organization chart...</div>;
    }

    // No data state
    if (!hierarchyData) {
        return <div className="org-chart-empty">No employee data available</div>;
    }

    return (
        <div className="org-chart-container">
            {/* Toolbar */}
            <div className="org-chart-toolbar">
                {/* Search */}
                <div className="toolbar-search">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            className="search-clear"
                            onClick={() => setSearchTerm('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Zoom Controls */}
                <div className="toolbar-zoom">
                    <button
                        onClick={handleZoomOut}
                        className="zoom-button"
                        aria-label="Zoom out"
                        title="Zoom out"
                    >
                        −
                    </button>
                    <span className="zoom-level">
                        {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="zoom-button"
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
                    >
                        📥 Export
                    </button>
                )}
            </div>

            {/* Chart Area */}
            <div 
                className="org-chart-wrapper"
                ref={chartRef}
                style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease'
                }}
            >
                <Tree
                    lineWidth="2px"
                    lineColor="#bbb"
                    lineBorderRadius="10px"
                    label={
                        <EmployeeNode
                            employee={hierarchyData}
                            showImages={showImages}
                            showDepartment={showDepartment}
                            onClick={handleNodeClick}
                        />
                    }
                >
                    {hierarchyData.children && hierarchyData.children.map(child => (
                        <React.Fragment key={child.id}>
                            {renderTree(child)}
                        </React.Fragment>
                    ))}
                </Tree>
            </div>
        </div>
    );
}
