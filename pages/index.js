import Pricing from '@/components/Pricing';
import { getActiveDonationsWithPrices, getActiveItemsWithPrices } from '@/utils/supabase-client';

export default function PricingPage({ products, donations }) {
  return (<div>
    <Pricing products={products} donations={donations} />
    </div>);
}

export async function getStaticProps() {
  const products = await getActiveItemsWithPrices();
  const donations = await getActiveDonationsWithPrices();
  return {
    props: {
      products,
      donations
    },
    revalidate: 60
  };
}
