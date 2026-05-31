import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface ProductRow {
  id: string;
  name: string;
  store_name: string;
  warranty_end_date: string;
  user_id: string;
}

interface UserRow {
  id: string;
  push_token: string | null;
  notify_30d: boolean;
  notify_7d: boolean;
  notify_1d: boolean;
}

Deno.serve(async () => {
  const today = new Date();
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  const in1 = new Date(today); in1.setDate(in1.getDate() + 1);

  const checks: Array<{ date: string; type: 'push_30d' | 'push_7d' | 'push_1d'; prefField: keyof UserRow; title: string }> = [
    { date: in30.toISOString().split('T')[0], type: 'push_30d', prefField: 'notify_30d', title: 'Expira en 30 dias' },
    { date: in7.toISOString().split('T')[0], type: 'push_7d', prefField: 'notify_7d', title: 'Expira en 7 dias' },
    { date: in1.toISOString().split('T')[0], type: 'push_1d', prefField: 'notify_1d', title: 'Expira manana' },
  ];

  let sent = 0;

  for (const check of checks) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, store_name, warranty_end_date, user_id')
      .eq('warranty_end_date', check.date)
      .eq('status', 'active') as { data: ProductRow[] | null };

    if (!products || products.length === 0) continue;

    for (const product of products) {
      const { data: existing } = await supabase
        .from('notifications_log')
        .select('id')
        .eq('user_id', product.user_id)
        .eq('product_id', product.id)
        .eq('type', check.type)
        .maybeSingle();

      if (existing) continue;

      const { data: user } = await supabase
        .from('users')
        .select('push_token, notify_30d, notify_7d, notify_1d')
        .eq('id', product.user_id)
        .single() as { data: UserRow | null };

      if (!user?.push_token || !user[check.prefField]) continue;

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.push_token,
          title: check.title,
          body: `Tu ${product.name}${product.store_name ? ` de ${product.store_name}` : ''} expira pronto`,
          data: { productId: product.id },
          channelId: 'warranties',
        }),
      });

      await supabase.from('notifications_log').insert({
        user_id: product.user_id,
        product_id: product.id,
        type: check.type,
      });

      sent++;
    }
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
