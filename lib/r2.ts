import 'server-only';

import { S3Client } from '@aws-sdk/client-s3';
import { ConfigurationError, requireEnv } from './env';

const accountId = requireEnv('R2_ACCOUNT_ID');
const apiUrl = requireEnv('S3_API');

let url: URL;

try {
  url = new URL(apiUrl);
} catch {
  throw new ConfigurationError('S3_API must be a valid R2 URL');
}

const expectedHost = `${accountId}.r2.cloudflarestorage.com`;

if (url.protocol !== 'https:' || url.hostname !== expectedHost || url.username || url.password || url.search || url.hash) {
  throw new ConfigurationError('S3_API must be an HTTPS R2 endpoint for R2_ACCOUNT_ID');
}

const pathSegments = url.pathname.split('/').filter(Boolean);

if (pathSegments.length > 1) {
  throw new ConfigurationError('S3_API must contain at most one bucket path segment');
}

export const r2Bucket = process.env.R2_BUCKET_NAME?.trim() || pathSegments[0];

if (!r2Bucket) {
  throw new ConfigurationError('R2_BUCKET_NAME or a bucket path in S3_API is required');
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint: url.origin,
  forcePathStyle: true,
  credentials: {
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
  },
});
