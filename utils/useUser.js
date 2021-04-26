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
  const [cart, setCart] = useState(null);
  const [item, setItem] = useState(null);

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

    const setUserItem = (item) => 
    supabase
    .from('customers')
    .select('*')
    .eq('stripe_checkout_session_id', stripe_checkout_session_id)
    .insert({ item }, { upsert: true })
    .single()

      useEffect(() => {
        if (user) {
          Promise.allSettled([getUserDetails(), setUserItem()]).then(
            (results) => {
              setUserDetails(results[0].value.data);
              setCart(results[1].value.data);
              setUserLoaded(true);
            }
          );
        }
      }, [user]);

    const getCart = (stripe_checkout_session_id) => 
    supabase
    .from('carts')
    .select('*')
    .eq('id', stripe_checkout_session_id)
    .single()

      useEffect(() => {
        if (user) {
          Promise.allSettled([getUserDetails(), getCart(user.stripe_checkout_session_id)]).then(
            (results) => {
              setUserDetails(results[0].value.data);
              setCart(results[1].value.data);
              setUserLoaded(true);
            }
          );
        }
      }, [user]);

  const upsertCart = (stripe_checkout_session_id, item) => 
  supabase
    .from('carts')
    .select('*')
    .eq('id', stripe_checkout_session_id)
    .eq('items->id', item.id)
    .insert(item, { upsert: true })

    if (item && !item.quantity) item.quantity = 1

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(), upsertCart(user.stripe_checkout_session_id)]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setCart(results[1].value.data);
            setUserLoaded(true);
          }
        );
      }
    }, [user]);
    
  const removeCartItem = (item, stripe_checkout_session_id) => 
  supabase
    .from('carts')
    .delete()
    .match('id', stripe_checkout_session_id) 
    .match('items->id', item.id)

    useEffect(() => {
      if (user) {
        Promise.allSettled([getUserDetails(), (item) => removeCartItem(item, user.stripe_checkout_session_id)]).then(
          (results) => {
            setUserDetails(results[0].value.data);
            setCart(results[1].value.data);
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
    item,
    cart,
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
