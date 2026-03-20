import { z } from 'zod';
import { insertUserProfileSchema, insertScanSchema, scans, userProfiles } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile',
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/profile',
      input: insertUserProfileSchema.partial(),
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/profile',
      responses: {
        204: z.null(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  scans: {
    list: {
      method: 'GET' as const,
      path: '/api/scans',
      input: z.object({
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof scans.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/scans/:id',
      responses: {
        200: z.custom<typeof scans.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scans',
      input: insertScanSchema,
      responses: {
        201: z.custom<typeof scans.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/scans/:id',
      input: insertScanSchema.partial(),
      responses: {
        200: z.custom<typeof scans.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  // Analyze endpoint for the AI processing
  analyze: {
    product: {
      method: 'POST' as const,
      path: '/api/analyze/product',
      input: z.object({
        image: z.string(), // Base64
      }),
      responses: {
        200: z.object({
          productName: z.string(),
          ingredients: z.string(),
          score: z.number(),
          grade: z.string(),
          portionSize: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          positives: z.array(z.object({
            title: z.string(),
            description: z.string().optional(),
            detail: z.string().optional(),
            type: z.string().optional(),
            amount: z.string().optional(),
          })),
          negatives: z.array(z.object({
            title: z.string(),
            description: z.string().optional(),
            detail: z.string().optional(),
            type: z.string().optional(),
            amount: z.string().optional(),
          })),
          additivesDetails: z.array(z.object({
            name: z.string(),
            label: z.string().optional(),
            risk: z.string(),
            category: z.string().optional(),
            description: z.string(),
            gutEffect: z.string().optional(),
          })).optional(),
          citations: z.array(z.object({
            source: z.string(),
            text: z.string(),
            url: z.string().optional(),
          })).optional(),
          alternatives: z.array(z.object({
            name: z.string(),
            score: z.number(),
            image: z.string().nullable().optional(),
          })).optional(),
        }),
        500: errorSchemas.internal,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
