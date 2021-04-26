import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from './supabase-client';

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const [userLoaded, setUserLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [checkoutId, setCheckoutId] = useState(null);
  const [cart, setCart] = useState(null);
  const [cartItem, setCartItem] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setSession(session);
    setUser(session?.user ?? null);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);


  const getUserDetails = () => supabase.from('users').select('*').single();
  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single()

  useEffect(() => {
    if (user) {
      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          setUserDetails(results[0].value.data);
          setSubscription(results[1].value.data);
          setUserLoaded(true);
        }
      );
    }
  }, [user]);

  const getCheckoutId = () =>
    supabase
    .from('customers')
    .select('stripe_checkout_session_id')
    .eq('id', user.id)
    .single()

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(), getCheckoutId()]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setCheckoutId(results[1].value.data);
            setUserLoaded(true);
          }
        );
      }
    }, [user]);

    const getCartItem = () =>
    supabase
    .from('customers')
    .select('item')
    .eq('id', user.id)
    .single()

    if (!cartItem)
      

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(), getCartItem()]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setCartItem(results[1].value.data);
            setUserLoaded(true);
          }
        );
      }
    }, [user]);


    const getCart = () => 
    supabase
    .from('carts')
    .select('*')
    .eq('cartId', checkoutId)
    .single()

      useEffect(() => {
        if (user) {
          Promise.allSettled([getUserDetails(), getCart()]).then(
            (results) => {
              setUserDetails(results[0].value.data);
              setCart(results[1].value.data);
              setUserLoaded(true);
            }
          );
        }
      }, [user]);


  const upsertCart = () => 
  supabase
    .from('carts')
    .update([getCartItem()])
    .match({cartId: checkoutId, items: [cartItem] })

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(),upsertCart()]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setCartItem(null);
            setUserLoaded(true);
          }
        );
      }
    }, [user]);
    
  const removeCartItem = (stripe_checkout_session_id, item) => 
  supabase
    .from('carts')
    .delete()
    .match('cartId', checkoutId) 
    .match('items', cartItem)

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(), removeCartItem()]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setCart(results[1].value.data);
            setCartItem(null);
            setUserLoaded(true);
          }
        );
      }
    }, [user]);

  const getWishlist = () =>
  supabase
    .from('wishlists')
    .select('*, prices(*, products(*))')
    .single();

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(), getWishlist()]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setWishlist(results[1].value.data);
            setUserLoaded(true);
          }
        );
      }
    }, [user]);

  const value = {
    cart,
    cartItem,
    checkoutId,
    session,
    subscription,
    user,
    userDetails,
    userLoaded,
    wishlist,
    signIn: (options) => supabase.auth.signIn(options),
    signUp: (options) => supabase.auth.signUp(options),
    signOut: () => {
      setUserDetails(null);
      setSubscription(null);
      setCart(null);
      setCartItem(null);
      setWishlist(null);
      return supabase.auth.signOut();
    }
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
