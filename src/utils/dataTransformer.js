/*This converts our flat mendix data into a tree structure
*/

// import { Children } from "react";

/**
 * Transforms flat employee data into hierarchical tree structure
 * @param {Array} employees - Flat array of employee objects
 * @returns {Object} Root node of the tree
*/

export function buildHierarchy(employees) {
    if(!employees || employees.length === 0) {
        return null;
    }

    //create a map for quick lookup
    // Here we are creating a map for fast lookup by copying the employee properties by adding an empty children
    const employeeMap = new Map();
    employees.forEach(emp => {
        employeeMap.set(emp.id, {
            ...emp, 
            children: []
        })
    })

    let root = null;
    //Build the tree by connecting the children to parents
    employees.forEach(emp => {
        const employee = employeeMap.get(emp.id);
        if(!emp.managerId || emp.managerId === emp.id) {
            root = employee //Top person (CEO or President)
        } else {
            //Add this employee as a child of their manager
            const manager = employeeMap.get(emp.managerId)
            if(manager) {
                manager.children.push(employee)
            }
        }
    })
    return root
}


/**
 *Searches for an employee in the hierarchy by name  
 * @param {Object} node - Root node  
 * @param {String} searchTerm - Search term  
 * @returns {Array} Array of matching employee nodes
 */
 //searchEmployees("dev") result returns [node3, node4]
 export function searchEmployees(node, searchTerm) {
    const results = [] //array to store all the matches
    const term = searchTerm.toLowerCase();

    function traverse(currentNode) {
        if (
            currentNode.name.toLowerCase().includes(term) ||
            currentNode.title?.toLowerCase().includes(term) ||
            currentNode.department?.toLowerCase().includes(term)
        ) {
            results.push(currentNode)
        }
        //Recursively search all children
        currentNode.children?.forEach(child => traverse(child))
    }
    traverse(node)
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
        count += countEmployees(child) //Recursive call
    })
    
    return count;
}