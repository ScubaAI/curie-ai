import { NextResponse, NextRequest } from 'next/server';
import { Redis } from 'ioredis';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { z } from 'zod';

// Redis configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (request: NextRequest) => request.ip,
  points: 100, // 100 requests
  duration: 60, // per minute
});

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const patientDataSchema = z.object({
  weight: z.number().min(1).max(500),
  height: z.number().min(50).max(300),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).max(200).optional(),
  visceralFatRating: z.number().min(0).max(50).optional(),
  phaseAngle: z.number().min(0).max(20).optional(),
});

// Security headers configuration
const securityHeaders = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'x-xss-protection': '1; mode=block',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
};

// Rate limiting middleware
export async function rateLimitMiddleware(request: NextRequest) {
  try {
    await rateLimiter.consume(request.ip);
    return NextResponse.next();
  } catch (rejRes) {
    const response = new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response;
  }
}

// Input sanitization middleware
export async function sanitizeInputMiddleware(request: NextRequest) {
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      const body = await request.json();
      
      // Sanitize all string inputs
      const sanitizedBody = Object.fromEntries(
        Object.entries(body).map(([key, value]) => {
          if (typeof value === 'string') {
            return [key, value.trim().replace(/[<>'"]/g, '')];
          }
          return [key, value];
        })
      );
      
      const newRequest = new NextRequest(request.url, {
        headers: request.headers,
        method: request.method,
        body: JSON.stringify(sanitizedBody),
      });
      
      return NextResponse.next({ request: newRequest });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }
  
  return NextResponse.next();
}

// CORS middleware
export async function corsMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Allow all origins for development, restrict in production
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['*'];
  
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    response.headers.set('access-control-allow-origin', origin || '*');
    response.headers.set('access-control-allow-credentials', 'true');
    response.headers.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('access-control-allow-headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'access-control-max-age': '86400',
      },
    });
  }
  
  return response;
}

// Security headers middleware
export async function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });
  
  return response;
}

// API validation middleware
export async function validateApiInput(request: NextRequest, schema: z.ZodSchema) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    
    const newRequest = new NextRequest(request.url, {
      headers: request.headers,
      method: request.method,
      body: JSON.stringify(validated),
    });
    
    return { valid: true, request: newRequest };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid input',
    };
  }
}

// Export middleware functions for use in API routes
export {
  rateLimiter,
  loginSchema,
  registerSchema,
  patientDataSchema,
  securityHeaders,
};