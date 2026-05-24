import React, {
    useContext,
    useState,
    useEffect
} from 'react';

import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

import './Checkout.css';

import { ShopContext } from '../../context/ShopContext';

import { useNavigate } from 'react-router-dom';

const Checkout = () => {

    const {
        getTotalCartAmount,
        all_product,
        cartItems,
        clearCart
    } = useContext(ShopContext);

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [loading, setLoading] =
        useState(false);

    const [formData, setFormData] =
        useState({
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            city: '',
            zip: ''
        });

    /* =========================================
       LOAD RAZORPAY
    ========================================= */

    useEffect(() => {

        const script =
            document.createElement('script');

        script.src =
            'https://checkout.razorpay.com/v1/checkout.js';

        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };

    }, []);

    /* =========================================
       INPUT CHANGE
    ========================================= */

    const handleInputChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /* =========================================
       PURCHASED PRODUCTS
    ========================================= */

    const purchasedProducts = [];

    Object.entries(cartItems).forEach(
        ([key, itemData]) => {

            const quantity =
                itemData.quantity;

            if (quantity > 0) {

                const productId =
                    itemData.productId;

                const size =
                    itemData.size;

                const product =
                    all_product.find(
                        (p) =>
                            p.id ===
                            Number(productId)
                    );

                if (product) {

                    purchasedProducts.push({

                        productId,

                        size,

                        quantity,

                        name: product.name,

                        price:
                            product.new_price,

                        image: product.image,

                        vendorId:
                            product.vendorId ||
                            'admin',

                        vendorName:
                            product.vendorName ||
                            'Admin'
                    });
                }
            }
        }
    );

    console.log(
        "PURCHASED PRODUCTS:",
        purchasedProducts
    );

    /* =========================================
       PAYMENT
    ========================================= */

    const handlePayment = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            /* CREATE ORDER */

            const createOrderResponse =
                await fetch(
                    'https://fashion-ecommerce-ak78.onrender.com/payment/create-order',
                    {
                        method: 'POST',

                        headers: {
                            'auth-token':
                                localStorage.getItem(
                                    'auth-token'
                                ),

                            'Content-Type':
                                'application/json',
                        },

                        body: JSON.stringify({
                            amount:
                                getTotalCartAmount(),

                            currency: 'INR',

                            receipt:
                                `receipt_${Date.now()}`
                        }),
                    }
                );

            const orderData =
                await createOrderResponse.json();

            if (!orderData.success) {

                alert(
                    orderData.errors ||
                    'Failed to create order'
                );

                setLoading(false);

                return;
            }

            /* RAZORPAY OPTIONS */

            const options = {

                key:
                    'rzp_test_Sq7ITnv3VVmsIq',

                amount:
                    orderData.amount,

                currency: 'INR',

                name:
                    'Fashion Store',

                description:
                    'Order Payment',

                image:
                    'https://via.placeholder.com/100',

                order_id:
                    orderData.orderId,

                prefill: {

                    name:
                        `${formData.firstName} ${formData.lastName}`,

                    email:
                        formData.email,

                    contact:
                        '9999999999'
                },

                notes: {

                    address:
                        formData.address,

                    city:
                        formData.city,

                    zip:
                        formData.zip
                },

                theme: {
                    color: '#ef4444'
                },

                /* PAYMENT SUCCESS */

                handler: async (
                    response
                ) => {

                    try {

                        const verifyResponse =
                            await fetch(
                                'https://fashion-ecommerce-ak78.onrender.com/payment/verify-payment',
                                {
                                    method: 'POST',

                                    headers: {

                                        'auth-token':
                                            localStorage.getItem(
                                                'auth-token'
                                            ),

                                        'Content-Type':
                                            'application/json',
                                    },

                                    body:
                                        JSON.stringify({

                                            razorpay_order_id:
                                                response.razorpay_order_id,

                                            razorpay_payment_id:
                                                response.razorpay_payment_id,

                                            razorpay_signature:
                                                response.razorpay_signature,

                                            products:
                                                purchasedProducts,

                                            address: {

                                                name:
                                                    `${formData.firstName} ${formData.lastName}`,

                                                email:
                                                    formData.email,

                                                address:
                                                    formData.address,

                                                city:
                                                    formData.city,

                                                zip:
                                                    formData.zip
                                            },

                                            paymentMethod:
                                                'razorpay'
                                        }),
                                }
                            );

                        const result =
                            await verifyResponse.json();

                        console.log(result);

                        if (result.success) {

                            clearCart();

                            setLoading(false);

                            setStep(3);

                        } else {

                            alert(
                                result.errors ||
                                'Payment verification failed'
                            );

                            setLoading(false);
                        }

                    } catch (error) {

                        console.log(error);

                        setLoading(false);
                    }
                },

                modal: {

                    ondismiss: () => {

                        alert(
                            'Payment cancelled'
                        );

                        setLoading(false);
                    }
                }
            };

            /* OPEN RAZORPAY */

            if (window.Razorpay) {

                const rzp =
                    new window.Razorpay(
                        options
                    );

                rzp.open();

            } else {

                alert(
                    'Razorpay failed to load'
                );

                setLoading(false);
            }

        } catch (error) {

            console.error(
                "Payment error:",
                error
            );

            alert(
                "An error occurred. Please try again."
            );

            setLoading(false);
        }
    };

    /* =========================================
       EMPTY CART
    ========================================= */

    if (
        getTotalCartAmount() === 0 &&
        step !== 3
    ) {

        return (

            <div className="checkout-empty">

                <h2>
                    Your cart is empty
                </h2>

                <button
                    onClick={() =>
                        navigate('/')
                    }
                >
                    Go Shopping
                </button>

            </div>
        );
    }

    /* =========================================
       RENDER
    ========================================= */

    return (

        <div>

            <Navbar />

            <div className="checkout-container">

                {/* STEPPER */}

                <div className="checkout-stepper">

                    <div
                        className={`step ${
                            step >= 1
                                ? 'active'
                                : ''
                        }`}
                    >
                        <span>1</span>
                        Shipping
                    </div>

                    <div className="step-line"></div>

                    <div
                        className={`step ${
                            step >= 2
                                ? 'active'
                                : ''
                        }`}
                    >
                        <span>2</span>
                        Payment
                    </div>

                    <div className="step-line"></div>

                    <div
                        className={`step ${
                            step >= 3
                                ? 'active'
                                : ''
                        }`}
                    >
                        <span>3</span>
                        Success
                    </div>

                </div>

                {/* SHIPPING STEP */}

                {
                    step === 1 && (

                        <div className="checkout-layout">

                            {/* FORM */}

                            <div className="checkout-form-section">

                                <h2>
                                    Shipping Information
                                </h2>

                                <form
                                    onSubmit={(e) => {

                                        e.preventDefault();

                                        setStep(2);
                                    }}
                                >

                                    <div className="form-row">

                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            required
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            required
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        required
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Street Address"
                                        required
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                    <div className="form-row">

                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            required
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                        <input
                                            type="text"
                                            name="zip"
                                            placeholder="ZIP Code"
                                            required
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>

                                    <button
                                        type="submit"
                                        className="checkout-btn"
                                    >
                                        Continue to Payment
                                    </button>

                                </form>

                            </div>

                            {/* SUMMARY */}

                            <div className="order-summary">

                                <h2>
                                    Order Summary
                                </h2>

                                <div className="summary-items">

                                    {
                                        purchasedProducts.map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    className="summary-item"
                                                >

                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                    />

                                                    <div>

                                                        <p>
                                                            {item.name}
                                                        </p>

                                                        <span>
                                                            Size:
                                                            {item.size}
                                                            |
                                                            Qty:
                                                            {item.quantity}
                                                        </span>

                                                    </div>

                                                    <p>
                                                        ₹
                                                        {
                                                            item.price *
                                                            item.quantity
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )
                                    }

                                </div>

                            </div>

                        </div>
                    )
                }

                {/* PAYMENT STEP */}

                {
                    step === 2 && (

                        <div className="payment-layout">

                            <div className="payment-container">

                                <h2>
                                    Secure Payment
                                </h2>

                                <button
                                    className="checkout-btn razorpay-btn"
                                    onClick={handlePayment}
                                    disabled={loading}
                                >

                                    {
                                        loading
                                            ? 'Processing...'
                                            : `Pay ₹${getTotalCartAmount()}`
                                    }

                                </button>

                            </div>

                            {/* SUMMARY */}

                            <div className="order-summary">

                                <h3>
                                    Order Summary
                                </h3>

                                <div className="summary-items">

                                    {
                                        purchasedProducts.map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    className="summary-item"
                                                >

                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                    />

                                                    <div>

                                                        <p>
                                                            {item.name}
                                                        </p>

                                                        <span>
                                                            Size:
                                                            {item.size}
                                                            |
                                                            Qty:
                                                            {item.quantity}
                                                        </span>

                                                    </div>

                                                    <p>
                                                        ₹
                                                        {
                                                            item.price *
                                                            item.quantity
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )
                                    }

                                </div>

                            </div>

                        </div>
                    )
                }

                {/* SUCCESS */}

                {
                    step === 3 && (

                        <div className="success-section">

                            <h1>
                                🎉 Payment Successful!
                            </h1>

                            <p>
                                Thank you for your purchase.
                            </p>

                            <button
                                className="checkout-btn"
                                onClick={() =>
                                    navigate('/')
                                }
                            >
                                Continue Shopping
                            </button>

                        </div>
                    )
                }

            </div>

            <Footer />

        </div>
    );
};

export default Checkout;