export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const formattedCurrency = value.toFixed(2);
    return `$${formattedCurrency}`;
  }
};

export const formatSubscriptionDateTime = (date: string): string | undefined => {
  try {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '...';
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  } catch {
    return '...';
  }
}