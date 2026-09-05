const STATUS_STYLES: Record<string, string> = {
  ACTIVE:        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  PROBATION:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  NOTICE_PERIOD: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  TERMINATED:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  RESIGNED:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  INACTIVE:      'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

export function EmployeeStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  const label = status.replace('_', ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
