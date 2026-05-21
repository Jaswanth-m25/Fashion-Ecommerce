import React, { useContext } from 'react';

import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

import './Wishlist.css';

import { ShopContext } from '../../context/ShopContext';

import Item from '../../components/Item/Item';

const Wishlist = () => {

    const {
        all_product,
        wishlistItems
    } = useContext(ShopContext);

    const wishlistedProducts =
        all_product.filter(product =>
            wishlistItems?.includes(product.id)
        );

    return (

        <div className="wishlist-wrapper">

            <Navbar />

            <div className="wishlist-page">

                {/* HEADER */}

                <div className="wishlist-header">

                    <div>

                        <h1>
                            My Wishlist
                        </h1>

                        <p>
                            Save your favourite
                            styles and shop them
                            anytime.
                        </p>

                    </div>

                    <div className="wishlist-count">

                        {
                            wishlistedProducts.length
                        }

                        <span>
                            Items
                        </span>

                    </div>

                </div>

                {/* EMPTY */}

                {
                    wishlistedProducts.length === 0 ? (

                        <div className="wishlist-empty">

                            <div className="wishlist-empty-icon">
                                🤍
                            </div>

                            <h2>
                                Your wishlist is empty
                            </h2>

                            <p>
                                Discover products you
                                love and save them here.
                            </p>

                        </div>

                    ) : (

                        <div className="wishlist-grid">

                            {
                                wishlistedProducts.map(
                                    (item) => (

                                        <Item
                                            key={item.id}

                                            id={item.id}

                                            name={item.name}

                                            image={item.image}

                                            new_price={
                                                item.new_price
                                            }

                                            old_price={
                                                item.old_price
                                            }

                                            stock={
                                                item.stock
                                            }

                                            sizeStock={
                                                item.sizeStock
                                            }

                                            discount={
                                                item.discount
                                            }
                                        />
                                    )
                                )
                            }

                        </div>
                    )
                }

            </div>

            <Footer />

        </div>
    );
};

export default Wishlist;