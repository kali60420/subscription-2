import { stripe } from '@/utils/stripe';
import { getUser } from '@/utils/supabase-admin';
import { createOrRetrieveCustomer, updateCustomerSession } from '@/utils/useDatabase';
import { getURL } from '@/utils/helpers';

const createCheckoutSession = async (req, res) => {
  if (req.method === 'POST') {
    const token = req.headers.token;
    const { cart, price, quantity = 1, metadata = {} } = req.body;
    
    try {
      const user = await getUser(token);
      const customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email
      });
    
      let cartItems = {};

      if (cart.length > 0)
        cart.forEach((item) => cartItem.push({ price: [item.price], quantity: item.quantity }));
      else 
        cartItems = { price: JSON.stringify(price), quantity: quantity };

      console.log('cartItems')
      console.log(cartItems)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        customer,
        line_items: [cartItems],
        mode: 'subscription',
        allow_promotion_codes: true,
        subscription_data: {
          trial_from_plan: true,
          metadata
        },
        success_url: `${getURL()}/account`,
        cancel_url: `${getURL()}/`
      });

      
      await updateCustomerSession({
        uuid: user.id,
        session_id: session.id
      });

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
