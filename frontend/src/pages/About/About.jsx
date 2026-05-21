import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1>About FASHION</h1>
                    <p>Your Ultimate Destination for Style & Quality</p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="about-section our-story">
                <div className="section-content">
                    <div className="section-text">
                        <h2>Our Story</h2>
                        <p>
                            FASHION was founded with a simple mission: to bring high-quality, 
                            trendy clothing to customers worldwide. What started as a small 
                            boutique has grown into a leading e-commerce platform serving 
                            millions of satisfied customers.
                        </p>
                        <p>
                            We believe that fashion should be accessible to everyone. Our 
                            carefully curated collection includes men's, women's, and kids' 
                            clothing from top brands and emerging designers, all at competitive prices.
                        </p>
                    </div>
                    <div className="section-image">
                        <div className="image-placeholder">📦</div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="about-section mission-vision">
                <h2>Our Mission & Vision</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon">🎯</div>
                        <h3>Our Mission</h3>
                        <p>
                            To provide premium quality clothing and exceptional customer service 
                            at affordable prices, making fashion accessible to all.
                        </p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">✨</div>
                        <h3>Our Vision</h3>
                        <p>
                            To become the most trusted and innovative fashion e-commerce 
                            platform globally, known for quality, style, and customer satisfaction.
                        </p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">❤️</div>
                        <h3>Our Values</h3>
                        <p>
                            Quality, Integrity, Innovation, and Customer-First approach. 
                            We believe in ethical practices and sustainability.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="about-section why-choose">
                <h2>Why Choose FASHION?</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">🛍️</div>
                        <h3>Wide Selection</h3>
                        <p>Thousands of products from top brands and designers</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon"></div>
                        <h3>Competitive Prices</h3>
                        <p>Best deals and regular discounts on your favorite items</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🚚</div>
                        <h3>Fast Delivery</h3>
                        <p>Quick and reliable shipping to your doorstep</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">💳</div>
                        <h3>Secure Payment</h3>
                        <p>Safe and encrypted payment methods for your peace of mind</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">📞</div>
                        <h3>24/7 Support</h3>
                        <p>Dedicated customer service team ready to help anytime</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">↩️</div>
                        <h3>Easy Returns</h3>
                        <p>Hassle-free return policy within 30 days</p>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            {/* <section className="about-section statistics">
                <h2>Our Achievements</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">1M+</div>
                        <div className="stat-label">Happy Customers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">50K+</div>
                        <div className="stat-label">Products Available</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">500+</div>
                        <div className="stat-label">Partner Brands</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">98%</div>
                        <div className="stat-label">Customer Satisfaction</div>
                    </div>
                </div>
            </section> */}

            {/* Categories Section */}
            <section className="about-section categories">
                <h2>What We Offer</h2>
                <div className="categories-grid">
                    <div className="category-card">
                        <div className="category-icon">👔</div>
                        <h3>Men's Fashion</h3>
                        <p>Trendy t-shirts, shirts, jeans, jackets, shoes, and more</p>
                    </div>
                    <div className="category-card">
                        <div className="category-icon">👗</div>
                        <h3>Women's Fashion</h3>
                        <p>Elegant dresses, tops, heels, handbags, jewelry, and more</p>
                    </div>
                    <div className="category-card">
                        <div className="category-icon">👧</div>
                        <h3>Kids' Fashion</h3>
                        <p>Comfortable and stylish clothing for children of all ages</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-section cta">
                <div className="cta-content">
                    <h2>Ready to Explore Our Collection?</h2>
                    <p>Start shopping now and discover your next favorite outfit!</p>
                    <div className="cta-buttons">
                        <a href="/" className="cta-btn primary">Start Shopping</a>
                        <a href="/contact" className="cta-btn secondary">Contact Us</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
