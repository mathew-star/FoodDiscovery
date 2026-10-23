import { sql } from 'drizzle-orm';
import { customType, timestamp, uuid } from 'drizzle-orm/pg-core';
import { parseEwkbPoint, type LatLng } from '@/shared/lib/geo';
import { uuidv7 } from '@/shared/lib/uuid';

export const id = () =>
  uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7());

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

export const geographyPoint = customType<{ data: LatLng; driverData: string }>({
  dataType: () => 'geography(Point,4326)',
  toDriver: ({ lat, lng }) => sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`,
  fromDriver: (value) => parseEwkbPoint(value),
});
