export const formatDate = (date: Date, format = 'yyyy-MM-dd') => {
  if (!date) return '';

  try {
    const d = new Date(date);
    
    // Format as ISO date string (yyyy-MM-dd)
    if (format === 'yyyy-MM-dd') {
      return d.toISOString().split('T')[0];
    }
    
    // Format with Intl.DateTimeFormat
    if (format === 'MMMM d, yyyy') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    }
    
    if (format === 'h:mm a') {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(d);
    }
    
    // Default to ISO string
    return d.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};