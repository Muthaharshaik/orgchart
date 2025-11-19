/**
 * Data Transformer Utilities
 * Converts flat Mendix data into hierarchical tree structure
 */

/**
 * Transforms flat employee data into hierarchical tree structure
 * @param {Array} employees - Flat array of employee objects
 * @returns {Object|null} Root node of the tree or null if no valid hierarchy
 */
export function buildHierarchy(employees) {
    if(!employees || employees.length === 0) {
        return null;
    }

    // Create a map for quick lookup
    const employeeMap = new Map();
    
    // First pass: Create map of all employees with empty children arrays
    employees.forEach(emp => {
        const stringId = emp.id ? String(emp.id) : null;
        if (stringId) {
            employeeMap.set(stringId, {
                ...emp, 
                id: stringId,
                children: []
            });
        }
    });

    let root = null;
    
    // Second pass: Build the tree by connecting children to parents
    employees.forEach(emp => {
        const stringId = emp.id ? String(emp.id) : null;
        const stringManagerId = emp.managerId ? String(emp.managerId) : null;
        
        if (!stringId) return; // Skip invalid entries
        
        const employee = employeeMap.get(stringId);
        if (!employee) return; // Skip if not in map
        
        // Check if this is the root node (no manager or self-managing)
        const isRoot = !stringManagerId || 
                       stringManagerId === 'null' || 
                       stringManagerId === 'undefined' || 
                       stringManagerId === stringId;
        
        if (isRoot) {
            root = employee;
        } else {
            // Add this employee as a child of their manager
            const manager = employeeMap.get(stringManagerId);
            if (manager) {
                manager.children.push(employee);
            }
            // If manager not found, employee becomes orphaned (not added to tree)
        }
    });

    return root;
}

/**
 * Searches for employees in the hierarchy by name, title, or department
 * @param {Object} node - Root node of the tree
 * @param {String} searchTerm - Search term to match against
 * @returns {Array} Array of matching employee nodes
 */
export function searchEmployees(node, searchTerm) {
    if (!node || !searchTerm) {
        return [];
    }

    const results = [];
    const term = searchTerm.toLowerCase().trim();

    /**
     * Recursive traversal function
     * @param {Object} currentNode - Current node being examined
     */
    function traverse(currentNode) {
        if (!currentNode) return;

        // Check if current node matches search criteria
        const nameMatch = currentNode.name?.toLowerCase().includes(term);
        const titleMatch = currentNode.title?.toLowerCase().includes(term);
        const deptMatch = currentNode.department?.toLowerCase().includes(term);

        if (nameMatch || titleMatch || deptMatch) {
            results.push(currentNode);
        }

        // Recursively search all children
        if (currentNode.children && Array.isArray(currentNode.children)) {
            currentNode.children.forEach(child => traverse(child));
        }
    }

    try {
        traverse(node);
    } catch (error) {
        // Return empty results if search fails
        return [];
    }

    return results;
}

/**
 * Counts total number of employees in the hierarchy
 * @param {Object} node - Root node of the tree
 * @returns {Number} Total count of employees
 */
export function countEmployees(node) {
    if (!node) return 0;
    
    let count = 1; // Count the current node
    
    // Add count of all children recursively
    if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
            count += countEmployees(child);
        });
    }
    
    return count;
}

/**
 * Finds an employee by ID in the hierarchy
 * @param {Object} node - Root node of the tree
 * @param {String} employeeId - ID of the employee to find
 * @returns {Object|null} Employee object or null if not found
 */
export function findEmployeeById(node, employeeId) {
    if (!node || !employeeId) return null;
    
    if (node.id === employeeId) {
        return node;
    }
    
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            const found = findEmployeeById(child, employeeId);
            if (found) return found;
        }
    }
    
    return null;
}

/**
 * Gets the depth/level of the hierarchy tree
 * @param {Object} node - Root node of the tree
 * @returns {Number} Maximum depth of the tree
 */
export function getTreeDepth(node) {
    if (!node) return 0;
    
    if (!node.children || node.children.length === 0) {
        return 1;
    }
    
    const childDepths = node.children.map(child => getTreeDepth(child));
    return 1 + Math.max(...childDepths);
}

/**
 * Validates the hierarchy structure
 * @param {Object} node - Root node to validate
 * @returns {Object} Validation result with isValid flag and issues array
 */
export function validateHierarchy(node) {
    const issues = [];
    const seenIds = new Set();
    
    function validate(currentNode, path = []) {
        if (!currentNode) {
            issues.push({ type: 'null_node', path });
            return;
        }
        
        if (!currentNode.id) {
            issues.push({ type: 'missing_id', path, node: currentNode.name });
            return;
        }
        
        if (seenIds.has(currentNode.id)) {
            issues.push({ type: 'duplicate_id', path, id: currentNode.id });
            return;
        }
        
        seenIds.add(currentNode.id);
        
        if (currentNode.children && Array.isArray(currentNode.children)) {
            currentNode.children.forEach((child, index) => {
                validate(child, [...path, currentNode.id]);
            });
        }
    }
    
    try {
        validate(node);
    } catch (error) {
        issues.push({ type: 'validation_error', error: error.message });
    }
    
    return {
        isValid: issues.length === 0,
        issues: issues
    };
}