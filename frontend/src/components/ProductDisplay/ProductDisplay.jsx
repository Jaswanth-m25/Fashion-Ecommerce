import React, {
    useContext,
    useState,
    useMemo,
    useEffect,
    useRef
} from 'react';

import './ProductDisplay.css';

import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";

import { ShopContext } from '../../context/ShopContext';

const ProductDisplay = ({ product }) => {

    const {
        addToCart,
        wishlistItems,
        toggleWishlist
    } = useContext(ShopContext);

    const [selectedSize, setSelectedSize] =
        useState('');

    const viewStartTime = useRef(Date.now());

    /* =========================================
       TRACK PRODUCT VIEW
    ========================================= */

    useEffect(() => {
        const trackProductView = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                
                if (!token) {
                    console.warn('No auth token found, tracking skipped');
                    return;
                }

                const timeSpent = Math.round((Date.now() - viewStartTime.current) / 1000);

                console.log('📊 Tracking product view:', {
                    productId: product.id,
                    timeSpent: timeSpent,
                    hasToken: !!token
                });

                const response = await fetch('https://fashion-ecommerce-ak78.onrender.com/trackview', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token,
                    },
                    body: JSON.stringify({
                        productId: product.id,
                        timeSpent: timeSpent
                    })
                });

                const data = await response.json();
                console.log('✅ View tracking response:', data);

                if (!data.success) {
                    console.error('View tracking failed:', data.message);
                }
            } catch (err) {
                console.error('❌ Error tracking product view:', err);
            }
        };

        if (product?.id) {
            trackProductView();
        }

        return () => {
            // Optional: Could track time spent on component unmount
        };
    }, [product?.id]);

    /* =========================================
       GET STOCK FOR SELECTED SIZE
    ========================================= */

    const getSizeStock = (size) => {
        if (!product.sizeStocks) return product.stock;
        return product.sizeStocks[size] || 0;
    };

    const selectedSizeStock = selectedSize ? getSizeStock(selectedSize) : null;
    const isSizeOutOfStock = selectedSize && getSizeStock(selectedSize) === 0;

    /* =========================================
       PRODUCT IMAGES
    ========================================= */

    const productImages = useMemo(() => {

        if (
            product?.images &&
            product.images.length > 0
        ) {
            return product.images;
        }

        return product?.image
            ? [product.image]
            : [];

    }, [product]);

    const [selectedImage, setSelectedImage] =
        useState('');

    useEffect(() => {

        if (productImages.length > 0) {
            setSelectedImage(productImages[0]);
        }

    }, [productImages]);

    /* =========================================
       WISHLIST
    ========================================= */

    const isWishlisted =
        wishlistItems?.includes(product?.id);

    if (!product) return null;

    /* =========================================
       SIZES
    ========================================= */

    const availableSizes =
        (
            product.sizes &&
            product.sizes.length > 0
        )
            ? product.sizes
            : ['S', 'M', 'L', 'XL'];

    const getTotalStock = () => {
        if (!product.sizeStocks || Object.keys(product.sizeStocks).length === 0) {
            return product.stock;
        }
        return Object.values(product.sizeStocks).reduce((sum, val) => sum + (val || 0), 0);
    };

    return (

        <div className='productdisplay'>

            {/* =========================================
               LEFT SECTION
            ========================================= */}

            <div className="productdisplay-left">

                {/* THUMBNAILS */}

                <div className="productdisplay-img-list">

                    {
                        productImages.map((img, index) => (

                            <img
                                key={index}
                                src={img}
                                alt={product.name}
                                className={
                                    selectedImage === img
                                        ? 'active-thumbnail'
                                        : ''
                                }
                                onClick={() =>
                                    setSelectedImage(img)
                                }
                            />
                        ))
                    }

                </div>

                {/* MAIN IMAGE */}

                <div className="productdisplay-img">

                    <img
                        className='productdisplay-main-img'
                        src={selectedImage}
                        alt={product.name}
                    />

                </div>

            </div>

            {/* =========================================
               RIGHT SECTION
            ========================================= */}

            <div className="productdisplay-right">

                {/* PRODUCT NAME */}

                <h1>{product.name}</h1>

                {/* RATING */}

                <div className="productdisplay-right-star">

                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_dull_icon} alt="" />

                    <p>(122 Reviews)</p>

                </div>

                {/* PRICES */}

                <div className="productdisplay-right-prices">

                    <div className="productdisplay-right-price-new">

                        ₹{product.new_price}

                    </div>

                    {
                        product.discount > 0 && (

                            <>

                                <div className="productdisplay-right-price-old">

                                    ₹{product.price}

                                </div>

                                <div className="productdisplay-discount-tag">

                                    {product.discount}% OFF

                                </div>

                            </>
                        )
                    }

                </div>

                {/* STOCK STATUS */}

                {/* <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? (
                        <>✓ In Stock ({product.stock} available)</>
                    ) : (
                        <>✗ Out of Stock</>
                    )}
                </div> */}

                {/* DESCRIPTION */}

                <div className="productdisplay-right-description">

                    {
                        product.description ||

                        "Experience ultimate comfort and style with this premium product."
                    }

                </div>

                {/* EXTRA DETAILS */}

                <div className="productdisplay-extra-details">

                    {
                        product.fit && (

                            <p>

                                <span>Fit:</span>

                                {product.fit}

                            </p>
                        )
                    }

                    {
                        product.material && (

                            <p>

                                <span>Material:</span>

                                {product.material}

                            </p>
                        )
                    }

                    {
                        product.color && (

                            <p>

                                <span>Color:</span>

                                {product.color}

                            </p>
                        )
                    }

                </div>

                {/* SIZE SECTION */}

                <div className="productdisplay-right-size-container">

                    

                    <div className="productdisplay-right-sizes">

                        {
                            availableSizes.map((size) => {
                                const sizeStock = getSizeStock(size);
                                const isOOS = sizeStock === 0;
                                return (
                                    <div
                                        key={size}
                                        className={`
                                            size-option-item 
                                            ${selectedSize === size ? 'selected-size' : ''} 
                                            ${isOOS ? 'out-of-stock-size' : ''}
                                        `}
                                        onClick={() => {
                                            if (!isOOS) {
                                                setSelectedSize(size);
                                            }
                                        }}
                                        title={isOOS ? `${size} - Out of Stock` : `${size} - ${sizeStock} available`}
                                    >
                                        <div>{size}</div>

                                    </div>
                                );
                            })
                        }

                    </div>


                </div>

                {/* ACTION BUTTONS */}

                <div className="productdisplay-actions">

                    <button
                        className="add-to-cart-btn"
                        onClick={() => {
                            addToCart(product.id, selectedSize);
                            
                            // Track cart addition
                            const trackCartActivity = async () => {
                                try {
                                    const token = localStorage.getItem('auth-token');
                                    
                                    if (!token) {
                                        console.warn('No auth token found, cart addition tracking skipped');
                                        return;
                                    }

                                    console.log('🛒 Tracking cart addition:', {
                                        productId: product.id,
                                        quantity: 1,
                                        size: selectedSize,
                                        action: 'added'
                                    });

                                    const response = await fetch('https://fashion-ecommerce-ak78.onrender.com/trackcart', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'auth-token': token,
                                        },
                                        body: JSON.stringify({
                                            productId: product.id,
                                            action: 'added',
                                            quantity: 1,
                                            size: selectedSize
                                        })
                                    });

                                    const data = await response.json();
                                    console.log('✅ Cart addition tracking response:', data);

                                    if (!data.success) {
                                        console.error('Cart addition tracking failed:', data.message);
                                    }
                                } catch (err) {
                                    console.error('❌ Error tracking cart activity:', err);
                                }
                            };
                            
                            trackCartActivity();
                        }}
                        disabled={!selectedSize || isSizeOutOfStock}
                    >

                        {!selectedSize 
                            ? 'SELECT A SIZE' 
                            : isSizeOutOfStock 
                                ? 'OUT OF STOCK' 
                                : 'ADD TO CART'
                        }

                    </button>

                    <button
                        className={
                            `add-to-wishlist-btn ${
                                isWishlisted
                                    ? 'active'
                                    : ''
                            }`
                        }
                        onClick={() =>
                            toggleWishlist(product.id)
                        }
                    >

                        {
                            isWishlisted
                                ? '❤️ Wishlisted'
                                : '🤍 Add to Wishlist'
                        }

                    </button>

                </div>

                {getTotalStock() === 0 && (
                    <div className="all-sizes-oos-message">
                        ⚠️ All sizes are currently out of stock
                    </div>
                )}

                {/* CATEGORY */}

                <p className='productdisplay-right-category'>

                    <span>Category: </span>

                    {product.category}, Clothing

                </p>

                <p className='productdisplay-right-category'>

                    <span>Tags: </span>

                    Modern, Latest

                </p>

            </div>

        </div>
    );
};

export default ProductDisplay;