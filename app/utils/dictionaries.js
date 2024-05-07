export const JOB_TYPES = {
  inspections: 'inspections',
  workToDos: 'workToDos',
  allowables: 'allowables',
  tools: 'tools',
  appointments: 'appointments',
  instructions: 'instructions',
  allowablesPools: 'allowablesPools',
}

export const TASK_STATUS = {
  taskCompleted: 'task-completed',
  performingWork: 'performing-work',
  idle: 'idle',
}

export const CATEGORY_OPTIONS = {
  ultraHigh: 'Ultra High',
  high: 'High',
  median: 'Median',
  low: 'Low',
  veryLow: 'Very Low',
}
export const ROUTES_FILTER_OPTIONS = {
  ...CATEGORY_OPTIONS,
  other: 'Other',
  none: 'None',
  route: 'Route',
}
export const CATEGORY_OPTIONS_COLOR_HEX = {
  High: '#FB8C00',

  Low: '#43A047',

  Median: '#FDD835',

  'Ultra High': '#E53935',

  'Very Low': '#68B6F3',
}
export const CATEGORY_OPTIONS_COLOR_CLASSNAME = {
  High: 'orange darken-1',

  Low: 'green darken-1',

  Median: 'yellow darken-1',

  'Ultra High': 'red darken-1',

  'Very Low': 'blue lighten-1',
}

export const GENERAL_ORDER_STATUS = {
  newOrder: 'New Order',
  assigned: 'Assigned',
  readyForOffice: 'Ready for Office',
  invoiced: 'Invoiced',
  closed: 'Closed',
  canceled: 'Canceled',
}

export const ORDER_SUB_STATUS_BY_GENERAL_STATUS = {
  'New Order': ['Inactive', 'Unassigned', 'Hold', 'Edited'],
  Assigned: [
    'On Route',
    'Accessing Property',
    'Performing Work',
    'Closing Work Order',
  ],
  'Ready for Office': ['Processing'],
}

export const ORDER_STATUS = {
  newOrder: 'New Order',
  inactive: 'Inactive',
  inField: 'In Field',
  readyForOffice: 'Ready for Office',
  invoiced: 'Invoiced',
  closed: 'Closed',
  assigned: 'Assigned',
  canceled: 'Canceled',
  partiallyCompleted: 'Partially Completed',
  hold: 'Hold',
  edited: 'Edited',
  unassigned: 'Unassigned',
  onRoute: 'On Route',
  accesingProperty: 'Accessing Property',
  performingWork: 'Performing Work',
  closingWorkOrder: 'Closing Work Order',
  processing: 'Processing',
}

export const JOB_NOTES_TYPES = {
  propertyNotes: 'Property Notes',
  workOrderNotes: 'Work Order Notes',
}

export const TEMPLATES_TYPES = {
  inspections: 'inspections',
  workToDos: 'workToDos',
  tools: 'tools',
  inspectionsOptions: 'inspectionsOptions',
  itemsForInvoices: 'itemsForInvoices',
  units: 'units',
  subAreas: 'subAreas',
  routeStatus: 'routeStatus',
}

export const PROCESS_TIME_TYPES = {
  before: 'Before',
  during: 'During',
  after: 'After',
  generalReports: 'GeneralReports',
  inspection: 'Inspection',
}

export const ROL_TYPES = {
  admin: 'admin',
  contractor: 'coontactor',
}

export const MEDIA_TYPES = {
  image: 'image',
  video: 'video',
  pdf: 'pdf',
}

export const ALERT_TYPES = {
  textReport: 'TEXT_REPORT',
  chatMsg: 'CHAT_MSG',
  newTask: 'NEW_TASK',
  newRequirement: 'NEW_REQUIREMENT',
  completeTaskReminder: 'COMPLETE_TASK_REMINDER',
}

export const NOTIFICATION_COLORS = {
  green: 'green-400',
  red: 'red-400',
  orange: 'warning-400',
  primary: 'primary-600',
}

export const TYPES_BUCKET = {
  daytona_system_main: 'daytona-system-main',
  daytona_system_dev_appspot: 'daytona-system-dev.appspot.com',
}
