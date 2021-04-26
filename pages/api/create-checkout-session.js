import { stripe } from '@/utils/stripe';
import { getUser, getCart } from '@/utils/supabase-admin';
import { createOrRetrieveCustomer } from '@/utils/useDatabase';
import { getURL } from '@/utils/helpers';
import getCart from '@/assets/bigcommerce/api/cart/handlers/get-cart';

const createCheckoutSession = async (req, res) => {
  if (req.method === 'POST') {
    const token = req.headers.token;
    const { item, price, quantity = 1, metadata = {} } = req.body;

    try {
      const user = await getUser(token);
      const customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email
      }); 

      const cart = await getCart(user.stripe_checkout_session_id);

      if (!cart) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          billing_address_collection: 'required',
          customer,
          line_items: [item],
          mode: 'subscription',
          allow_promotion_codes: true,
          subscription_data: {
            trial_from_plan: true,
            metadata
          },
          success_url: `${getURL()}/account`,
          cancel_url: `${getURL()}/`
        });

        cart = await upsertCart(item, user.stripe_checkout_session_id);   
      } else {
        const session = await stripe.checkout.sessions.update({ id: user.stripe_checkout_session_id }, {
          payment_method_types: ['card'],
          billing_address_collection: 'required',
          customer,
          line_items: [cart.items],
          mode: 'subscription',
          allow_promotion_codes: true,
          subscription_data: {
            trial_from_plan: true,
            metadata
          },
          success_url: `${getURL()}/account`,
          cancel_url: `${getURL()}/`
        });

        cart = await upsertCart(item, user.stripe_checkout_session_id);
      }
      return res.status(200).json({ sessionId: session.id });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default createCheckoutSession;
