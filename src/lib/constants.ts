// Project constants
export const PROJECT_STATUSES = {
  planning: { label: 'Planning', color: '#7f5dff', description: 'Shaping direction' },
  active: { label: 'Active', color: '#38f8c7', description: 'In execution' },
  'on-hold': { label: 'Paused', color: '#f9a826', description: 'Waiting for input' },
  completed: { label: 'Completed', color: '#4ecbff', description: 'Shipped' },
  archived: { label: 'Archived', color: '#ff5c87', description: 'Saved for later' },
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUSES;

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUSES).map(([value, meta]) => ({
  value,
  ...meta,
}));

export const PROJECT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
];

export const TECH_STACK_OPTIONS = [
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express',
  'NestJS',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'Ruby on Rails',
  'PHP',
  'Laravel',
  'Java',
  'Spring Boot',
  'Go',
  'Rust',
  'TypeScript',
  'JavaScript',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Tailwind CSS',
  'Bootstrap',
  'Material-UI',
  'Chakra UI',
];

// Task constants
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'urgent', label: 'Urgent', color: '#DC2626' },
];

export const TASK_STATUSES = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

// Kanban constants
export const DEFAULT_KANBAN_COLUMNS = [
  { name: 'To Do', order: 0 },
  { name: 'In Progress', order: 1 },
  { name: 'In Review', order: 2 },
  { name: 'Done', order: 3 },
];

export const CREDENTIAL_CATEGORIES = {
  API_KEY: 'API Key',
  PASSWORD: 'Password',
  DATABASE_URL: 'Database URL',
  ENV_VARIABLE: 'Env Variable',
  OTHER: 'Other',
};

export const CREDENTIAL_CATEGORIES_ARRAY = [
  { value: 'API Key', label: 'API Key' },
  { value: 'Password', label: 'Password' },
  { value: 'Database URL', label: 'Database URL' },
  { value: 'Env Variable', label: 'Env Variable' },
  { value: 'Other', label: 'Other' },
];

export const MOOD_OPTIONS = {
  GREAT: 'great',
  GOOD: 'good',
  OKAY: 'okay',
  STRUGGLING: 'struggling',
};

export const MOOD_OPTIONS_ARRAY = [
  { value: 'great', label: 'Great momentum' },
  { value: 'good', label: 'Energetic' },
  { value: 'okay', label: 'Steady' },
  { value: 'struggling', label: 'Needs recovery' },
];

export const ACTIVITY_TYPES = {
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_MOVED: 'task_moved',
  DOCUMENT_CREATED: 'document_created',
  JOURNAL_ENTRY: 'journal_entry',
};
