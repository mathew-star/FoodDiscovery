const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatRupees(paise: number): string {
  return rupees.format(Math.round(paise / 100));
}
