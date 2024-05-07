exports.TASK_STATUS = {
  taskCompleted: 'task-completed',
  performingWork: 'performing-work',
  idle: 'idle',
}
exports.JOB_TYPES = {
  inspections: 'inspections',
  workToDos: 'workToDos',
  allowables: 'allowables',
  tools: 'tools',
  appointments: 'appointments',
  instructions: 'instructions',
  allowablesPools: 'allowablesPools',
}
exports.JOB_NOTES_TYPES = {
  propertyNotes: 'Property Notes',
  workOrderNotes: 'Work Order Notes',
}

exports.GENERAL_ORDER_STATUS = {
  newOrder: 'New Order',
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  readyForOffice: 'Ready for Office',
  invoiced: 'Invoiced',
  closed: 'Closed',
  canceled: 'Canceled',
}
exports.ORDER_STATUS = {
  newOrder: 'New Order',
  assigned: 'Assigned',
  unassigned: 'Unassigned',
  readyForOffice: 'Ready for Office',
  invoiced: 'Invoiced',
  closed: 'Closed',
  canceled: 'Canceled',
  inactive: 'Inactive',

  partiallyCompleted: 'Partially Completed',
  hold: 'Hold',
  editingOrder: 'Editing Order',
  onRoute: 'On Route',
  accesingProperty: 'Accessing Property',
  performingWork: 'Performing Work',
  closingWorkOrder: 'Closing Work Order',
  processing: 'Processing',
}

exports.ORDER_SUB_STATUS_BY_GENERAL_STATUS = {
  ['New Order']: ['Inactive', 'Editing Order'],
  ['Unassigned']: ['Hold'],
  ['Assigned']: [
    'On Route',
    'Accessing Property',
    'Performing Work',
    'Closing Work Order',
  ],
  ['Ready for Office']: ['Processing'],
}
