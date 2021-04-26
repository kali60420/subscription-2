import Pricing from '@/components/Pricing';
import { getActiveDonationsWithPrices, getActiveItemsWithPrices } from '@/utils/supabase-client';

export default function PricingPage({ donations }) {
  return (<div>
    <Pricing donations={donations} />
    </div>);
}

export async function getStaticProps() {
  // const products = await getActiveItemsWithPrices();
  const donations = await getActiveDonationsWithPrices();
  return {
    props: {
      donations
    },
    revalidate: 60
  };
}
