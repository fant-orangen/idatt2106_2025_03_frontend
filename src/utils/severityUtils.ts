export const getSeverityClass = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return 'bg-green-500 text-white';
    case 'yellow': return 'bg-yellow-500 text-black';
    case 'red': return 'bg-red-500 text-white';
    default: return 'bg-green-500 text-white';
  }
};

export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return '#10b981';
    case 'yellow': return '#f59e0b';
    case 'red': return '#ef4444';
    default: return '#10b981';
  }
};
