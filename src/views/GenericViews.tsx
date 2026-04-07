import React from 'react';
import { GenericView } from './GenericView';

export function Manufacturing() {
  return <GenericView title="Manufacturing" description="Manage production lines, work orders, and equipment." entityName="Work Order"
    schema={[
      { name: 'orderNumber', label: 'Order #', type: 'text', required: true },
      { name: 'product', label: 'Product', type: 'text', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{label: 'Pending', value: 'Pending'}, {label: 'In Progress', value: 'In Progress'}, {label: 'Completed', value: 'Completed'}], required: true },
      { name: 'dueDate', label: 'Due Date', type: 'date' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function Inventory() {
  return <GenericView title="Inventory" description="Track raw materials, WIP, and finished goods." entityName="Item"
    schema={[
      { name: 'sku', label: 'SKU', type: 'text', required: true },
      { name: 'name', label: 'Item Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: [{label: 'Raw Material', value: 'Raw Material'}, {label: 'Finished Good', value: 'Finished Good'}], required: true },
      { name: 'stock', label: 'Stock Level', type: 'number', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function Sales() {
  return <GenericView title="Sales" description="Manage customer orders, quotes, and invoices." entityName="Order"
    schema={[
      { name: 'orderId', label: 'Order ID', type: 'text', required: true },
      { name: 'customer', label: 'Customer', type: 'text', required: true },
      { name: 'unitPrice', label: 'Unit Price (USD)', type: 'number', required: true },
      { name: 'amount', label: 'Total Amount (USD)', type: 'number', required: true },
      { name: 'amountOMR', label: 'Total (OMR)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: [{label: 'Quote', value: 'Quote'}, {label: 'Confirmed', value: 'Confirmed'}, {label: 'Shipped', value: 'Shipped'}], required: true },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function Procurement() {
  return <GenericView title="Procurement" description="Manage purchase orders and supplier relationships." entityName="Purchase Order"
    schema={[
      { name: 'poNumber', label: 'PO Number', type: 'text', required: true },
      { name: 'supplier', label: 'Supplier', type: 'text', required: true },
      { name: 'total', label: 'Total (USD)', type: 'number', required: true },
      { name: 'totalOMR', label: 'Total (OMR)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: [{label: 'Draft', value: 'Draft'}, {label: 'Sent', value: 'Sent'}, {label: 'Received', value: 'Received'}], required: true },
      { name: 'expectedDate', label: 'Expected Date', type: 'date' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function Accounting() {
  return <GenericView title="Accounting" description="Financial records, ledgers, credits, liabilities, and assets." entityName="Transaction"
    schema={[
      { name: 'txId', label: 'Transaction ID', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: [{label: 'Income', value: 'Income'}, {label: 'Expense', value: 'Expense'}, {label: 'Asset', value: 'Asset'}, {label: 'Liability', value: 'Liability'}, {label: 'Credit', value: 'Credit'}], required: true },
      { name: 'amount', label: 'Amount (USD)', type: 'number', required: true },
      { name: 'amountOMR', label: 'Amount (OMR)', type: 'number' },
      { name: 'category', label: 'Category', type: 'select', options: [{label: 'Sales', value: 'Sales'}, {label: 'Fuel', value: 'Fuel'}, {label: 'Food', value: 'Food'}, {label: 'Hotel/Visitors', value: 'Hotel/Visitors'}, {label: 'Equipment', value: 'Equipment'}, {label: 'Other', value: 'Other'}], required: true },
      { name: 'dueDate', label: 'Due Date', type: 'date' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function HRAdmin() {
  return <GenericView title="HR & Admin" description="Employee records, payroll, and administration." entityName="Employee"
    schema={[
      { name: 'empId', label: 'Employee ID', type: 'text', required: true },
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'select', options: [{label: 'Engineering', value: 'Engineering'}, {label: 'Sales', value: 'Sales'}, {label: 'Operations', value: 'Operations'}], required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{label: 'Active', value: 'Active'}, {label: 'On Leave', value: 'On Leave'}], required: true },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function RDLab() {
  return <GenericView title="R&D Lab" description="Research projects, testing, formulations, and development." entityName="Project"
    schema={[
      { name: 'projectId', label: 'Project ID', type: 'text', required: true },
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'phase', label: 'Phase', type: 'select', options: [{label: 'Ideation', value: 'Ideation'}, {label: 'Prototyping', value: 'Prototyping'}, {label: 'Testing', value: 'Testing'}, {label: 'Failure Analysis', value: 'Failure Analysis'}], required: true },
      { name: 'experimentFormulation', label: 'Experiment Formulation', type: 'textarea' },
      { name: 'issues', label: 'Issues/Failures', type: 'textarea' },
      { name: 'resolution', label: 'Resolution', type: 'textarea' },
      { name: 'lead', label: 'Project Lead', type: 'text', required: true },
      { name: 'budget', label: 'Budget (USD)', type: 'number' },
      { name: 'budgetOMR', label: 'Budget (OMR)', type: 'number' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function Vendors() {
  return <GenericView title="Vendors" description="Manage suppliers, their products, and ratings." entityName="Vendor"
    schema={[
      { name: 'vendorId', label: 'Vendor ID', type: 'text', required: true },
      { name: 'name', label: 'Vendor Name', type: 'text', required: true },
      { name: 'contact', label: 'Contact Info', type: 'text' },
      { name: 'products', label: 'Products Supplied', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating', type: 'select', options: [{label: 'Excellent', value: 'Excellent'}, {label: 'Good', value: 'Good'}, {label: 'Fair', value: 'Fair'}, {label: 'Poor', value: 'Poor'}], required: true },
      { name: 'attachment', label: 'Contract/Document', type: 'file' }
    ]} />;
}

export function Tasks() {
  return <GenericView title="Task Management" description="Create, assign, prioritize, and track tasks across the organization." entityName="Task"
    schema={[
      { name: 'taskId', label: 'Task ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'assignee', label: 'Assignee', type: 'text', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: [{label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'}], required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{label: 'To Do', value: 'To Do'}, {label: 'In Progress', value: 'In Progress'}, {label: 'Done', value: 'Done'}], required: true },
      { name: 'dueDate', label: 'Due Date', type: 'date' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function BusinessDev() {
  return <GenericView title="Business Dev" description="Partnerships, expansion, and strategic initiatives." entityName="Initiative"
    schema={[
      { name: 'initId', label: 'Initiative ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'partner', label: 'Partner/Target', type: 'text', required: true },
      { name: 'stage', label: 'Stage', type: 'select', options: [{label: 'Prospecting', value: 'Prospecting'}, {label: 'Negotiation', value: 'Negotiation'}, {label: 'Closed', value: 'Closed'}], required: true },
      { name: 'value', label: 'Est. Value (USD)', type: 'number' },
      { name: 'valueOMR', label: 'Est. Value (OMR)', type: 'number' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}

export function Samples() {
  return <GenericView title="Samples" description="Manage product samples sent to clients." entityName="Sample Request"
    schema={[
      { name: 'reqId', label: 'Request ID', type: 'text', required: true },
      { name: 'client', label: 'Client', type: 'text', required: true },
      { name: 'product', label: 'Product', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{label: 'Preparing', value: 'Preparing'}, {label: 'Shipped', value: 'Shipped'}, {label: 'Feedback Received', value: 'Feedback Received'}], required: true },
      { name: 'shipDate', label: 'Ship Date', type: 'date' },
      { name: 'attachment', label: 'Attachment', type: 'file' }
    ]} />;
}
