// app/api/blink/invoice/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amountSats, memo } = await req.json();
    
    const response = await fetch('https://api.blink.sv/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.BLINK_API_KEY || '',
      },
      body: JSON.stringify({
        query: `
          mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
            lnInvoiceCreate(input: $input) {
              invoice {
                paymentRequest
                paymentHash
                paymentSecret
                satoshis
              }
              errors {
                message
              }
            }
          }
        `,
        variables: {
          input: {
            amount: amountSats,
            memo: memo || 'Donación a Curie Intelligence',
          }
        }
      }),
    });

    const { data, errors } = await response.json();
    
    if (errors || data?.lnInvoiceCreate?.errors?.length > 0) {
      throw new Error(errors?.[0]?.message || data?.lnInvoiceCreate?.errors[0]?.message);
    }

    return NextResponse.json({
      invoice: data.lnInvoiceCreate.invoice.paymentRequest,
      amount: amountSats,
    });

  } catch (error: any) {
    console.error('[INVOICE_ERROR]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}