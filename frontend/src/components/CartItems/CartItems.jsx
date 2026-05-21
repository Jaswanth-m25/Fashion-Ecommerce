
import React, { useContext, useMemo } from 'react';
import './CartItems.css';
import { ShopContext } from '../../context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {

    const {
        all_product,
        cartItems,
        removeFromCart,
        updateCartQuantity,
        getTotalCartAmount
    } = useContext(ShopContext);

    const navigate = useNavigate();

    /* =========================================
       TRACK CART REMOVAL
    ========================================= */

    const trackCartRemoval = async (productId, quantity, size) => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                console.warn('No auth token found, cart removal tracking skipped');
                return;
            }

            console.log('🛒 Tracking cart removal:', {
                productId,
                quantity,
                size,
                action: 'removed'
            });

            const response = await fetch('http://localhost:4000/trackcart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify({
                    productId: productId,
                    action: 'removed',
                    quantity: quantity,
                    size: size
                })
            });

            const data = await response.json();
            console.log('✅ Cart removal tracking response:', data);

            if (!data.success) {
                console.error('Cart removal tracking failed:', data.message);
            }
        } catch (err) {
            console.error('❌ Error tracking cart removal:', err);
        }
    };

    /* =========================================
       FLATTEN CART ITEMS
    ========================================= */

    const cartProducts = useMemo(() => {

        const items = [];

        Object.keys(cartItems).forEach((key) => {

            const cartItem = cartItems[key];

            if (!cartItem || cartItem.quantity <= 0) return;

            const product = all_product.find(
                (item) => item.id === cartItem.productId
            );

            if (product) {

                items.push({
                    ...product,
                    cartKey: key,
                    size: cartItem.size,
                    quantity: cartItem.quantity
                });
            }
        });

        return items;

    }, [cartItems, all_product]);

    /* =========================================
       EMPTY CART
    ========================================= */

    if (cartProducts.length === 0) {

        return (
            <div className="cart-empty-container">

                <div className="cart-empty-card">

                    <h1>Your Cart is Empty</h1>

                    <p>
                        Looks like you haven't added anything yet.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                    >
                        Continue Shopping
                    </button>

                </div>

            </div>
        );
    }

    return (

        <div className='cartitems'>

            {/* =========================================
               HEADER
            ========================================= */}

            <div className="cartitems-header">

                <h1>Shopping Cart</h1>

                <p>
                    {cartProducts.length} item(s) in your cart
                </p>

            </div>

            {/* =========================================
               TABLE HEADER
            ========================================= */}

            <div className="cartitems-format-main">

                <p>Product</p>
                <p>Details</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>

            </div>

            <hr />

            {/* =========================================
               CART ITEMS
            ========================================= */}

            {cartProducts.map((item) => {

                const totalPrice =
                    item.new_price * item.quantity;

                return (

                    <div key={item.cartKey}>

                        <div className="cartitems-format">

                            {/* PRODUCT IMAGE */}

                            <div className="cart-product-left">

                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className='carticon-product-icon'
                                />

                            </div>

                            {/* PRODUCT DETAILS */}

                            <div className="cart-product-details">

                                <h3>{item.name}</h3>

                                <div className="cart-product-meta">

                                    <span className="product-size">
                                        Size: {item.size}
                                    </span>

                                </div>

                            </div>

                            {/* PRICE */}

                            <p className="cart-price">
                                ₹{item.new_price}
                            </p>

                            {/* QUANTITY */}

                            <div className="quantity-controls">

                                <button
                                    onClick={() =>
                                        updateCartQuantity(
                                            item.cartKey,
                                            item.quantity - 1
                                        )
                                    }
                                >
                                    -
                                </button>

                                <span>
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        updateCartQuantity(
                                            item.cartKey,
                                            item.quantity + 1
                                        )
                                    }
                                >
                                    +
                                </button>

                            </div>

                            {/* TOTAL */}

                            <p className="cart-total-price">
                                ₹{totalPrice}
                            </p>

                            {/* REMOVE */}

                            <button
                                className="remove-btn"
                                onClick={() => {
                                    // Track removal before removing from cart
                                    trackCartRemoval(item.id, item.quantity, item.size);
                                    removeFromCart(item.cartKey);
                                }}
                            >

                                <img
                                    src={remove_icon}
                                    alt="remove"
                                />

                            </button>

                        </div>

                        <hr />

                    </div>
                );
            })}

            {/* =========================================
               BOTTOM SECTION
            ========================================= */}

            <div className="cartitems-down">

                {/* TOTALS */}

                <div className="cartitems-total">

                    <h1>Cart Totals</h1>

                    <div>

                        <div className="cartitems-total-item">

                            <p>Subtotal</p>

                            <p>
                                ₹{getTotalCartAmount()}
                            </p>

                        </div>

                        <hr />

                        <div className="cartitems-total-item">

                            <p>Shipping Fee</p>

                            <p>Free</p>

                        </div>

                        <hr />

                        <div className='cartitems-total-item total-final'>

                            <h3>Total</h3>

                            <h3>
                                ₹{getTotalCartAmount()}
                            </h3>

                        </div>

                    </div>

                    <button
                        className="checkout-btn"
                        onClick={() => navigate('/checkout')}
                    >
                        Proceed To Checkout
                    </button>

                </div>

                {/* PROMO */}

                <div className="cartitems-promocode">

                    <h3>Promo Code</h3>

                    <p>
                        Enter your promo code if you have one.
                    </p>

                    <div className="cartitems-promobox">

                        <input
                            type="text"
                            placeholder='Enter promo code'
                        />

                        <button>
                            Apply
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CartItems;
