import { NextResponse } from 'next/server';

// Caché simple en memoria (para demo; en producción usar Redis/Upstash)
let cache: { balance: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 segundos

export async function GET() {
  try {
    // 1. Verificar caché válida
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      console.log('[BLINK_CACHE_HIT]:', cache.balance, 'sats');
      return NextResponse.json({ 
        balance: cache.balance,
        cached: true 
      });
    }

    // 2. Fetch a Blink si no hay caché
    const response = await fetch('https://api.blink.sv/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.BLINK_API_KEY || '',
      },
      body: JSON.stringify({
        query: `
          query GetWalletBalance {
            me {
              defaultAccount {
                wallets {
                  balance
                  walletCurrency
                }
              }
            }
          }
        `,
      }),
      // Timeout para no colgar el request
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) throw new Error(`Blink HTTP ${response.status}`);

    const { data, errors } = await response.json();
    
    if (errors) throw new Error(errors[0]?.message || 'GraphQL error');

    const btcWallet = data?.me?.defaultAccount?.wallets?.find(
      (w: any) => w.walletCurrency === 'BTC'
    );

    const balance = btcWallet ? parseInt(btcWallet.balance) : 0;

    // 3. Guardar en caché
    cache = { balance, timestamp: Date.now() };
    
    console.log('[BLINK_API_HIT]:', balance, 'sats');

    return NextResponse.json({ 
      balance,
      cached: false 
    });

  } catch (error: any) {
    console.error('[BLINK_ERROR]:', error.message);
    
    // Fallback a caché stale si existe
    if (cache) {
      return NextResponse.json({ 
        balance: cache.balance,
        stale: true,
        error: error.message 
      });
    }

    return NextResponse.json({ 
      balance: 0, 
      error: "Blink Link Down" 
    }, { status: 500 });
  }
}