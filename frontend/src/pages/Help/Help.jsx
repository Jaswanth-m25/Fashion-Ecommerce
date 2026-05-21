import React, { useState, useEffect } from 'react';
import './Help.css';

const Help = () => {
    const [activeTab, setActiveTab] = useState('customer');
    const [expandedFaq, setExpandedFaq] = useState(null);
    
    // Get user role from localStorage
    const userRole = localStorage.getItem('user-role');

    // Set active tab based on user role on component mount
    useEffect(() => {
        if (userRole === 'vendor') {
            setActiveTab('vendor');
        } else {
            setActiveTab('customer');
        }
    }, [userRole]);

    const customerFaqData = [
        {
            id: 1,
            question: "How do I create an account?",
            answer: "Click on 'Sign Up' in the navigation bar. Enter your email, create a password, and fill in your basic information. You'll receive a confirmation email to verify your account."
        },
        {
            id: 2,
            question: "How can I reset my password?",
            answer: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you a link to reset your password. Follow the instructions in the email."
        },
        {
            id: 3,
            question: "How do I place an order?",
            answer: "Browse products, add items to your cart, proceed to checkout, enter your shipping and payment information, and confirm your order. You'll receive an order confirmation email."
        },
        {
            id: 4,
            question: "What payment methods do you accept?",
            answer: "We accept Credit Cards (Visa, Mastercard, American Express), Debit Cards, and Razorpay digital wallets. All transactions are secured with SSL encryption."
        },
        {
            id: 5,
            question: "Can I track my order?",
            answer: "Yes! Once your order is shipped, you'll receive an email with a tracking link. You can also track orders from your Profile > Orders section anytime."
        },
        {
            id: 6,
            question: "What is your return and exchange policy?",
            answer: "We offer a 30-day return policy for most items in original condition with tags attached. Visit Orders > Return Item to initiate a return. Refunds are processed within 7-10 business days."
        },
        {
            id: 7,
            question: "How do I add items to my wishlist?",
            answer: "Click the heart icon on any product page to add it to your wishlist. Access your wishlist anytime from the navigation menu."
        },
        {
            id: 8,
            question: "Is my payment information secure?",
            answer: "Yes! We use industry-standard SSL encryption and PCI DSS compliance. Your credit card information is never stored on our servers."
        }
    ];

    const vendorFaqData = [
        {
            id: 1,
            question: "How do I become a vendor?",
            answer: "Navigate to Vendor Dashboard and click 'Apply Now'. Fill in your business information, verify your identity, and submit your application. We'll review it within 3-5 business days."
        },
        {
            id: 2,
            question: "What are the vendor fees?",
            answer: "We charge a commission of 15-20% per sale depending on product category. Additional services like featured listings have optional premium charges."
        },
        {
            id: 3,
            question: "How do I list products?",
            answer: "Go to Vendor Dashboard > Products > Add New. Fill in product details, upload images, set pricing, and submit. Products appear within 24 hours after approval."
        },
        {
            id: 4,
            question: "How do I manage inventory?",
            answer: "Use the Inventory Management panel in your dashboard. You can update stock quantities in bulk, set low-stock alerts, and track inventory history."
        },
        {
            id: 5,
            question: "When do I receive payments?",
            answer: "Payments are processed every 15 days. Your earnings are calculated after deducting our commission and any refunds. View payment history in Finance section."
        },
        {
            id: 6,
            question: "How do I handle returns and refunds?",
            answer: "Returned items appear in your Returns section. Approve or reject returns within 48 hours. Once approved, refunds are issued to the customer automatically."
        },
        {
            id: 7,
            question: "How do I improve my seller rating?",
            answer: "Maintain good communication, process orders quickly, handle returns professionally, and ensure product quality. Ratings are based on customer feedback and on-time performance."
        },
        {
            id: 8,
            question: "Can I run promotional campaigns?",
            answer: "Yes! Use the Promotions section to create discounts, flash sales, and bundle offers. Target specific categories or customer segments to maximize reach."
        },
        {
            id: 9,
            question: "How do I contact customer support?",
            answer: "Visit Help > Contact Us or use the chat widget in your dashboard. Email support@fashion.com for technical issues or vendor-specific concerns."
        }
    ];

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const renderFaqSection = (faqData) => (
        <div className="faq-container">
            {faqData.map((item) => (
                <div key={item.id} className="faq-item">
                    <button
                        className={`faq-question ${expandedFaq === item.id ? 'active' : ''}`}
                        onClick={() => toggleFaq(item.id)}
                    >
                        <span className="faq-title">{item.question}</span>
                        <span className="faq-icon">{expandedFaq === item.id ? '−' : '+'}</span>
                    </button>
                    {expandedFaq === item.id && (
                        <div className="faq-answer">
                            <p>{item.answer}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="help-page">
            {/* Header */}
            <section className="help-header">
                <div className="header-content">
                    <h1>Help Center</h1>
                    <p>Find answers and get support</p>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="help-container">
                <div className="tab-navigation">
                    {userRole !== 'vendor' && (
                        <button
                            className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
                            onClick={() => setActiveTab('customer')}
                        >
                            <span className="tab-icon">👤</span>
                            Customer Help
                        </button>
                    )}
                    {userRole === 'vendor' && (
                        <button
                            className={`tab-btn ${activeTab === 'vendor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vendor')}
                        >
                            <span className="tab-icon">🏪</span>
                            Vendor Help
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="help-content">
                    {activeTab === 'customer' && (
                        <div className="tab-content customer-help">
                            <div className="section-header">
                                <h2>Customer Support</h2>
                                <p>Get help with shopping, orders, and account management</p>
                            </div>

                            {/* Quick Links */}
                            <div className="quick-links">
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">🛍️</div>
                                    <h3>Shopping Guide</h3>
                                    <p>Learn how to browse and purchase</p>
                                </a>
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">📦</div>
                                    <h3>Track Orders</h3>
                                    <p>Check your order status</p>
                                </a>
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">↩️</div>
                                    <h3>Returns & Refunds</h3>
                                    <p>Initiate a return</p>
                                </a>
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">🔒</div>
                                    <h3>Account Security</h3>
                                    <p>Protect your account</p>
                                </a>
                            </div>

                            {/* FAQs */}
                            <div className="faq-section">
                                <h3>Frequently Asked Questions</h3>
                                {renderFaqSection(customerFaqData)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'vendor' && (
                        <div className="tab-content vendor-help">
                            <div className="section-header">
                                <h2>Vendor Support</h2>
                                <p>Manage your shop and grow your business</p>
                            </div>

                            {/* Quick Links */}
                            <div className="quick-links">
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">🏪</div>
                                    <h3>Shop Setup</h3>
                                    <p>Get started as a vendor</p>
                                </a>
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">📝</div>
                                    <h3>Product Listing</h3>
                                    <p>Add and manage products</p>
                                </a>
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">💰</div>
                                    <h3>Payments & Finance</h3>
                                    <p>Manage earnings</p>
                                </a>
                                <a href="#" className="quick-link-card">
                                    <div className="link-icon">📊</div>
                                    <h3>Analytics</h3>
                                    <p>View performance metrics</p>
                                </a>
                            </div>

                            {/* FAQs */}
                            <div className="faq-section">
                                <h3>Frequently Asked Questions</h3>
                                {renderFaqSection(vendorFaqData)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Support Section */}
                <div className="contact-support">
                    <h3>Still need help?</h3>
                    <p>Our support team is here to assist you</p>
                    <div className="contact-options">
                        <div className="contact-method">
                            <div className="contact-icon">📧</div>
                            <h4>Email</h4>
                            <p>support@fashion.com</p>
                            <span className="response-time">Response within 24 hours</span>
                        </div>
                        <div className="contact-method">
                            <div className="contact-icon">💬</div>
                            <h4>Live Chat</h4>
                            <p>Chat with us now</p>
                            <span className="response-time">Available 9 AM - 9 PM</span>
                        </div>
                        <div className="contact-method">
                            <div className="contact-icon">📞</div>
                            <h4>Phone</h4>
                            <p>1-800-FASHION</p>
                            <span className="response-time">Mon - Fri, 10 AM - 6 PM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
