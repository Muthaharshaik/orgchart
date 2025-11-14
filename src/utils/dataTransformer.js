/*This converts our flat mendix data into a tree structure
*/

/**
 * Transforms flat employee data into hierarchical tree structure
 * @param {Array} employees - Flat array of employee objects
 * @returns {Object} Root node of the tree
*/

export function buildHierarchy(employees) {
    if(!employees || employees.length === 0) {
        console.info('No employees provided to buildHierarchy');
        return null;
    }

    console.info('=== BUILDING HIERARCHY ===');
    console.info('Input employees count:', employees.length);

    //create a map for quick lookup
    // Here we are creating a map for fast lookup by copying the employee properties by adding an empty children
    const employeeMap = new Map();
    employees.forEach(emp => {
        // Ensure ID is string for consistent comparison
        const stringId = emp.id ? String(emp.id) : null;
        employeeMap.set(stringId, {
            ...emp, 
            id: stringId, // Ensure ID is string
            children: []
        });
        console.info(`Mapped employee: ${emp.name} with ID: ${stringId}`);
    });

    console.info('Employee map size:', employeeMap.size);

    let root = null;
    let orphans = [];
    
    //Build the tree by connecting the children to parents
    employees.forEach(emp => {
        const stringId = emp.id ? String(emp.id) : null;
        const stringManagerId = emp.managerId ? String(emp.managerId) : null;
        
        const employee = employeeMap.get(stringId);
        
        console.info(`Processing: ${emp.name}, ID: ${stringId}, ManagerID: ${stringManagerId}`);
        
        // Check if this is root (no manager or self-managing)
        if(!stringManagerId || stringManagerId === 'null' || stringManagerId === 'undefined' || stringManagerId === stringId) {
            console.info(`  -> This is ROOT: ${emp.name}`);
            root = employee; //Top person (CEO or President)
        } else {
            //Add this employee as a child of their manager
            const manager = employeeMap.get(stringManagerId);
            console.info(`  -> Looking for manager with ID: ${stringManagerId}`);
            console.info(`  -> Manager found:`, manager ? manager.name : 'NOT FOUND');
            
            if(manager) {
                manager.children.push(employee);
                console.info(`  -> Added ${employee.name} as child of ${manager.name}`);
                console.info(`  -> ${manager.name} now has ${manager.children.length} children`);
            } else {
                console.info(`  -> WARNING: Manager not found for ${emp.name}!`);
                orphans.push(emp.name);
            }
        }
    });

    if (orphans.length > 0) {
        console.warn('Orphaned employees (no manager found):', orphans);
    }

    if (root) {
        console.info('Root found:', root.name);
        console.info('Root children count:', root.children?.length || 0);
        
        // Log the tree structure
        const logTree = (node, level = 0) => {
            console.info('  '.repeat(level) + `- ${node.name} (${node.children?.length || 0} reports)`);
            node.children?.forEach(child => logTree(child, level + 1));
        };
        console.info('=== COMPLETE TREE STRUCTURE ===');
        logTree(root);
    } else {
        console.error('No root employee found!');
    }

    return root;
}


/**
 *Searches for an employee in the hierarchy by name  
 * @param {Object} node - Root node  
 * @param {String} searchTerm - Search term  
 * @returns {Array} Array of matching employee nodes
 */
 //searchEmployees("dev") result returns [node3, node4]
 export function searchEmployees(node, searchTerm) {
    const results = []; //array to store all the matches
    const term = searchTerm.toLowerCase();

    function traverse(currentNode) {
        if (
            currentNode.name.toLowerCase().includes(term) ||
            currentNode.title?.toLowerCase().includes(term) ||
            currentNode.department?.toLowerCase().includes(term)
        ) {
            results.push(currentNode);
        }
        //Recursively search all children
        currentNode.children?.forEach(child => traverse(child));
    }
    traverse(node);
    return results;
 }


/**
 * Function to count the total employees
 */

//countEmployees(root) result returns Returns: 5
export function countEmployees(node) {
    if(!node) return 0;
    let count = 1;

    //Add count of all the children of the node
    node.children?.forEach(child => {
        count += countEmployees(child); //Recursive call
    });
    
    return count;
}