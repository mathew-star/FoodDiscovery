import type { BranchDetail } from '../queries/branches';

const schemaDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function restaurantJsonLd(branch: BranchDetail, url: string): Record<string, unknown> {
  return {
    '@type': 'Restaurant',
    '@id': url,
    name: branch.name,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: branch.address,
      addressLocality: branch.cityName,
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: branch.location.lat, longitude: branch.location.lng },
    servesCuisine: branch.cuisines.map((cuisine) => cuisine.name),
    priceRange: '₹'.repeat(branch.priceBand),
    ...(branch.phone ? { telephone: branch.phone } : {}),
    openingHoursSpecification: branch.hours.map((row) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${schemaDays[row.dayOfWeek] ?? 'Sunday'}`,
      opens: row.opensAt.slice(0, 5),
      closes: row.closesAt.slice(0, 5),
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
