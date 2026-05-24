import React, { createContext, useState, useEffect } from 'react'

export const ShopContext = createContext(null);

const ShopContextProvider =(props)=>{
    const [all_product, setAllProduct] = useState([]);
    const [cartItems,setCartItems]=useState({});
    const [wishlistItems, setWishlistItems] = useState([]);

    // Fetch approved products from backend
    useEffect(() => {
        fetch('https://fashion-ecommerce-ak78.onrender.com/allproducts')
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setAllProduct(data);
                    // Initialize cart based on fetched products
                    let cart = {};
                    for (let i = 0; i < 300; i++) {
                        cart[i] = 0;
                    }
                    setCartItems(cart);
                }
            })
            .catch(err => console.error("Failed to fetch products:", err));
    }, []);

    useEffect(() => {
        if(localStorage.getItem('auth-token')){
            fetch('https://fashion-ecommerce-ak78.onrender.com/getwishlist',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':localStorage.getItem('auth-token'),
                    'Content-Type':'application/json',
                },
                body:"",
            }).then((response)=>response.json())
              .then((data)=>{
                  if(Array.isArray(data)) setWishlistItems(data);
              })
              .catch(err => console.error(err));
        }
    }, [])

    const toggleWishlist = (itemId) => {
        if(localStorage.getItem('auth-token')){
            if (wishlistItems.includes(itemId)) {
                setWishlistItems((prev) => prev.filter(id => id !== itemId));
                fetch('https://fashion-ecommerce-ak78.onrender.com/removefromwishlist', {
                    method:'POST',
                    headers:{
                        Accept:'application/form-data',
                        'auth-token':localStorage.getItem('auth-token'),
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify({"itemId":itemId}),
                })
            } else {
                setWishlistItems((prev) => [...prev, itemId]);
                fetch('https://fashion-ecommerce-ak78.onrender.com/addtowishlist', {
                    method:'POST',
                    headers:{
                        Accept:'application/form-data',
                        'auth-token':localStorage.getItem('auth-token'),
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify({"itemId":itemId}),
                })
            }
        } else {
            window.location.replace('/LoginSignup');
        }
    }

const addToCart = (productId, size) => {

    const cartKey = `${productId}_${size}`;

    setCartItems((prev) => {

        const existingItem = prev[cartKey];

        return {
            ...prev,

            [cartKey]: {
                productId,
                size,
                quantity:
                    existingItem
                        ? existingItem.quantity + 1
                        : 1
            }
        };
    });
};
const removeFromCart = (cartKey) => {

    setCartItems((prev) => {

        const updated = { ...prev };

        delete updated[cartKey];

        return updated;
    });
};
const updateCartQuantity = (
    cartKey,
    quantity
) => {

    if (quantity <= 0) {

        removeFromCart(cartKey);

        return;
    }

    setCartItems((prev) => ({
        ...prev,

        [cartKey]: {
            ...prev[cartKey],
            quantity
        }
    }));
};
    const getTotalCartAmount = () =>{
        let totalAmount = 0;
        for(const item in cartItems)
        {
            if(cartItems[item].quantity > 0)
            {
                let itemInfo = all_product.find((product)=>product.id===cartItems[item].productId)
                if (itemInfo) {
                    totalAmount +=itemInfo.new_price * cartItems[item].quantity;
                }
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () =>{
        let totalItem=0;
        for(const item in cartItems)
        {
            if(cartItems[item].quantity > 0)
            {
                totalItem+=cartItems[item].quantity;
            }
        }
        return totalItem;
    }

    const clearCart = () => {
        setCartItems({});
    }

    const contextValue = {getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart,updateCartQuantity,clearCart, wishlistItems, toggleWishlist};

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
    
}
export default ShopContextProvider;
