import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getActiveDonationsWithPrices = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, metadata, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error.message);
    throw error;
  }

  let fData = [];

  fData.push(data.find(
    (product) => product.metadata.category === 'donation'
  ))

  return fData || [];
};

export const getActiveItemsWithPrices = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, metadata, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error.message);
    throw error;
  }

  let fData = [];

  fData.push(data.find(
    (product) => product.metadata.category === 'item'
  ))

  return fData || [];
};

export const updateUserName = async (user, name) => {
  await supabase
    .from('users')
    .update({
      full_name: name
    })
    .eq('id', user.id);
};
