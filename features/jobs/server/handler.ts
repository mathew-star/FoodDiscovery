import 'server-only';

import { serve } from 'inngest/next';
import { inngest } from '@/infra/inngest/client';
import { functions } from '@/infra/inngest/functions';

/** The Inngest endpoint (ARCHITECTURE §7); requests are verified with INNGEST_SIGNING_KEY. */
export const jobsHandler = serve({ client: inngest, functions });
