# Organization Chart Widget for Mendix

A powerful and feature-rich organization chart widget for Mendix applications that visualizes hierarchical employee structures with an intuitive, interactive interface.

## Features

### Core Features
- **Hierarchical Visualization**: Display company structure from CEO down through all reporting levels
- **Interactive Node Cards**: Click-responsive employee cards with customizable actions
- **Collapse/Expand**: Manage large hierarchies by collapsing and expanding branches
- **Smart Search**: Real-time search by employee name, title, or department
- **Zoom Controls**: Zoom in/out and reset view for better navigation
- **Export Capability**: Export charts as PNG images for documentation

### Customization Options
- **Department Display**: Toggle department information visibility
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessible**: Full keyboard navigation and screen reader support

### Performance
- **Optimized Rendering**: Uses React.memo to prevent unnecessary re-renders
- **Smart State Management**: Efficient handling of large organizational structures
- **Error Boundaries**: Graceful error handling with user-friendly messages

## Installation

1. Download the widget from the Mendix Marketplace
2. Import the widget into your Mendix project
3. Add the widget to a page in your application

## Configuration

### Data Source

The widget requires a data source with the following attributes:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| Employee ID | String/AutoNumber | Yes | Unique identifier for each employee |
| Manager ID | String/AutoNumber | Yes | Reference to the employee's manager (self-reference) |
| Employee Name | String | Yes | Full name of the employee |
| Job Title | String | No | Employee's job title |
| Department | String | No | Department name |

### Setup Steps

1. **Create Your Domain Model**
   ```
   Entity: Employee
   - EmployeeID (String/AutoNumber)
   - ManagerID (String/AutoNumber) 
   - Name (String)
   - Title (String)
   - Department (String)
   ```

2. **Configure the Widget**
   - Add the Organization Chart widget to your page
   - Set the data source to retrieve your employee list
   - Map the required attributes to your entity attributes

3. **Configure Display Options**
   - Toggle "Show Department" to display/hide department info
   - Enable "Export (PNG/PDF)" to allow chart export

4. **Add Actions (Optional)**
   - Configure "On Node Click" to execute when an employee card is clicked
   - This can open a detail page, show a popup, etc.

## Data Structure Requirements

### Hierarchy Rules
- **Root Node**: One employee should have no manager (or self-reference) to serve as the root
- **No Circular References**: Ensure no employee is their own ancestor
- **Valid IDs**: All employee and manager IDs must be valid and consistent


## Features Guide

### Search Functionality
- Type in the search box to find employees by name, title, or department
- Navigate results using Enter (next) and Shift+Enter (previous)
- Press Escape to clear search
- Search results highlight matching employees and auto-expand their paths

### Collapse/Expand
- **Collapse All**: Hides all employees except the root node
- **Expand All**: Shows the entire organizational structure
- **Individual Toggle**: Click the badge on any card to collapse/expand that branch

### Zoom Controls
- **Zoom In (+)**: Increase chart size (up to 150%)
- **Zoom Out (−)**: Decrease chart size (down to 50%)
- **Reset (⟲)**: Return to default 80% zoom and clear search

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and click nodes
- **Escape**: Close search dropdown
- **Enter**: Navigate to next search result
- **Shift+Enter**: Navigate to previous search result

## Styling

The widget comes with a modern, professional design out of the box. You can customize the appearance by overriding CSS classes in your theme:

### Main Container Classes
- `.org-chart-container` - Main wrapper
- `.org-chart-toolbar` - Top toolbar with controls
- `.org-chart-wrapper` - Scrollable chart area

### Node Classes
- `.org-chart-node` - Individual employee card
- `.org-chart-node.highlighted` - Search result highlight
- `.org-chart-node.collapsed` - Collapsed node state

### Example Customization
```css
/* Custom company colors */
.org-chart-node {
    border-color: #your-brand-color;
}

.node-badge {
    background-color: #your-brand-color;
}

/* Custom node size */
.org-chart-node {
    min-width: 200px;
    max-width: 250px;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Large Organizations**: Use the collapse/expand features for organizations with 100+ employees
2. **Images**: Optimize profile images to small file sizes (recommended: 100x100px, < 50KB)
3. **Data Loading**: Consider implementing pagination or lazy loading for very large organizations

## Troubleshooting

### No Data Displays
- Verify your data source is configured correctly
- Check that at least one employee has no manager (root node)
- Ensure employee IDs and manager IDs are consistent

### Hierarchy Looks Wrong
- Check for circular references in your data
- Verify manager IDs match existing employee IDs
- Ensure there's only one root employee

### Images Not Loading
- Verify image URLs are publicly accessible
- Check image format (JPG, PNG, WebP supported)
- Consider CORS settings if images are from external domains

### Performance Issues
- Consider limiting initial data load to active employees only
- Optimize profile image sizes
- Use the collapse feature for very large hierarchies

## Accessibility

The widget is built with accessibility in mind:
- Full keyboard navigation support
- ARIA labels for screen readers
- High contrast mode support
- Reduced motion support for animations

## Version History

### Version 1.0.0
- Initial release
- Hierarchical organization chart visualization
- Search and filter functionality
- Collapse/expand branches
- Zoom controls
- Export to PNG
- Full accessibility support

## Support


## License

[Specify your license here - MIT, Apache 2.0, etc.]

## Credits

Developed by [Lowcode Labs/Muthahar Shaik]

Built with:
- React
- react-organizational-chart
- html2canvas
- Mendix Pluggable Widgets API

---

**Note**: This widget requires Mendix 9.0 or higher and supports both web and PWA platforms.