// Project dates are saved as midnight UTC (new Date("YYYY-MM-DD")), so they are
// formatted in UTC too. In the local time zone they could show the previous day.
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "01 de setembro de 2024"
const formatLongDate = (date: Date): string => longDateFormatter.format(date);

// "2024-09-01", for the dateTime attribute of <time>.
const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export { formatLongDate, toIsoDate };
