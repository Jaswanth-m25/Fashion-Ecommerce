import React, { useState, useEffect } from 'react';
import './AddProduct.css';

const AddProduct = ({ 
    formData, 
    setFormData, 
    editingId, 
    setEditingId, 
    loading, 
    onSubmit, 
    showNotification,
    previewImages,
    setPreviewImages,
    imageFiles,
    setImageFiles
}) => {
    const [sizeStocks, setSizeStocks] = useState({});
    const [removedImages, setRemovedImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const [seoKeywords, setSeoKeywords] = useState([]);
    const [variants, setVariants] = useState([]);
    const [shippingDetails, setShippingDetails] = useState({
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        estimatedDelivery: ''
    });

    useEffect(() => {
        if (formData.sizeStocks) {
            setSizeStocks(formData.sizeStocks);
        }
        if (formData.seoKeywords) {
            setSeoKeywords(formData.seoKeywords);
        }
        if (formData.variants) {
            setVariants(formData.variants);
        }
        if (formData.shippingDetails) {
            setShippingDetails(formData.shippingDetails);
        }
    }, [editingId]);

    useEffect(() => {
        if (editingId && formData.images && formData.images.length > 0) {
            const existingImages = formData.images.map((img, index) => ({
                id: `existing-${index}`,
                preview: img,
                file: null,
                isNew: false
            }));
            setPreviewImages(existingImages);
            setRemovedImages([]);
        }
    }, [editingId, formData.images]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            removedImages: removedImages,
            sizeStocks: sizeStocks,
            seoKeywords: seoKeywords,
            variants: variants,
            shippingDetails: shippingDetails
        }));
    }, [removedImages, sizeStocks, seoKeywords, variants, shippingDetails]);

    useEffect(() => {
        setCharacterCount(formData.description?.length || 0);
    }, [formData.description]);

    // Complete validation function
    const validateField = (name, value, extraData = {}) => {
        switch (name) {
            case 'name':
                if (!value || value.trim() === '') return 'Product name is required';
                if (value.length < 3) return 'Product name must be at least 3 characters';
                if (value.length > 100) return 'Product name cannot exceed 100 characters';
                if (!/^[a-zA-Z0-9\s\-_,.!&()]+$/.test(value)) return 'Product name contains invalid characters';
                return '';

            case 'category':
                if (!value) return 'Category is required';
                return '';

            case 'price':
                if (!value) return 'Price is required';
                if (isNaN(value) || value <= 0) return 'Price must be a positive number';
                if (value > 1000000) return 'Price cannot exceed ₹10,00,000';
                return '';

            case 'discount':
                if (value === '' || value === null) return '';
                if (isNaN(value) || value < 0 || value > 100) return 'Discount must be between 0 and 100';
                return '';

            case 'description':
                if (!value || value.trim() === '') return 'Product description is required';
                if (value.length < 20) return 'Description must be at least 20 characters';
                if (value.length > 2000) return 'Description cannot exceed 2000 characters';
                return '';

            case 'brand':
                if (!value || value.trim() === '') return 'Brand name is required';
                if (value.length > 50) return 'Brand name cannot exceed 50 characters';
                return '';

            case 'color':
                if (!value || value.trim() === '') return 'Color is required';
                if (value.length > 30) return 'Color cannot exceed 30 characters';
                return '';

            case 'material':
                if (!value || value.trim() === '') return 'Material is required';
                if (value.length > 50) return 'Material cannot exceed 50 characters';
                return '';

            case 'fit':
                if (!value || value.trim() === '') return 'Fit type is required';
                return '';

            case 'sizes':
                if (!value || value.length === 0) return 'At least one size is required';
                return '';

            case 'stock':
                const hasStock = Object.values(sizeStocks).some(stock => stock > 0);
                if (!hasStock) return 'Please add stock for at least one size';
                return '';

            case 'images':
                if (previewImages.length === 0) return 'At least one product image is required';
                return '';

            case 'seoKeywords':
                if (!value || value.length === 0) return 'At least one SEO keyword is required';
                return '';

            case 'weight':
                if (!value) return 'Product weight is required';
                if (isNaN(value) || value <= 0) return 'Weight must be a positive number';
                return '';

            case 'estimatedDelivery':
                if (!value) return 'Estimated delivery time is required';
                return '';

            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields validation
        newErrors.name = validateField('name', formData.name);
        newErrors.category = validateField('category', formData.category);
        newErrors.price = validateField('price', formData.price);
        newErrors.description = validateField('description', formData.description);
        newErrors.brand = validateField('brand', formData.brand);
        newErrors.color = validateField('color', formData.color);
        newErrors.material = validateField('material', formData.material);
        newErrors.fit = validateField('fit', formData.fit);
        newErrors.sizes = validateField('sizes', formData.sizes);
        newErrors.stock = validateField('stock', null);
        newErrors.images = validateField('images', null);
        newErrors.seoKeywords = validateField('seoKeywords', seoKeywords);
        newErrors.weight = validateField('weight', shippingDetails.weight);
        newErrors.estimatedDelivery = validateField('estimatedDelivery', shippingDetails.estimatedDelivery);
        
        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSizeStockChange = (size, value) => {
        const stockValue = parseInt(value) || 0;
        const newSizeStocks = { ...sizeStocks, [size]: stockValue };
        setSizeStocks(newSizeStocks);
        
        // Validate stock
        const hasStock = Object.values(newSizeStocks).some(stock => stock > 0);
        if (!hasStock) {
            setErrors(prev => ({ ...prev, stock: 'Please add stock for at least one size' }));
        } else {
            setErrors(prev => ({ ...prev, stock: '' }));
        }
    };

    const handleSeoKeywordAdd = (keyword) => {
        if (keyword && keyword.trim() && !seoKeywords.includes(keyword.trim())) {
            const newKeywords = [...seoKeywords, keyword.trim()];
            setSeoKeywords(newKeywords);
            setErrors(prev => ({ ...prev, seoKeywords: '' }));
        }
    };

    const handleSeoKeywordRemove = (keyword) => {
        const newKeywords = seoKeywords.filter(k => k !== keyword);
        setSeoKeywords(newKeywords);
        if (newKeywords.length === 0) {
            setErrors(prev => ({ ...prev, seoKeywords: 'At least one SEO keyword is required' }));
        }
    };

    const handleVariantAdd = () => {
        setVariants([...variants, { name: '', price: '', stock: '' }]);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleVariantRemove = (index) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    const handleShippingChange = (field, value) => {
        setShippingDetails({ ...shippingDetails, [field]: value });
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleDimensionChange = (dimension, value) => {
        setShippingDetails({
            ...shippingDetails,
            dimensions: { ...shippingDetails.dimensions, [dimension]: value }
        });
    };

    const calculateTotalStock = () => {
        return Object.values(sizeStocks).reduce((sum, val) => sum + (val || 0), 0);
    };

    const handleImageFiles = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showNotification(`${file.name} is not an image`, 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotification(`${file.name} exceeds 5MB`, 'error');
                return;
            }
            validFiles.push(file);
        });
        
        if (validFiles.length > 0) {
            const newImageFiles = [...imageFiles, ...validFiles];
            setImageFiles(newImageFiles);
            
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setPreviewImages(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        preview: event.target.result,
                        file: file,
                        isNew: true
                    }]);
                };
                reader.readAsDataURL(file);
            });
            
            if (errors.images) {
                setErrors(prev => ({ ...prev, images: '' }));
            }
        }
    };

    const removeImagePreview = (id) => {
        const imageToRemove = previewImages.find(img => img.id === id);
        
        if (imageToRemove && !imageToRemove.isNew) {
            setRemovedImages([...removedImages, imageToRemove.preview]);
        }
        
        setPreviewImages(previewImages.filter(img => img.id !== id));
        
        if (imageToRemove && imageToRemove.file) {
            setImageFiles(imageFiles.filter(f => f !== imageToRemove.file));
        }
        
        if (previewImages.length === 1) {
            setErrors(prev => ({ ...prev, images: 'At least one product image is required' }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allFields = ['name', 'category', 'price', 'description', 'brand', 'color', 'material', 'fit', 'sizes', 'seoKeywords', 'weight', 'estimatedDelivery'];
        const touchedFields = {};
        allFields.forEach(field => {
            touchedFields[field] = true;
        });
        setTouched(touchedFields);
        
        // Validate all fields
        const isValid = validateForm();
        
        if (!isValid) {
            const firstErrorField = document.querySelector('.form-group.has-error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            showNotification('Please fill all required fields correctly', 'error');
            return;
        }
        
        onSubmit(e);
    };

    const getFieldError = (fieldName) => {
        return touched[fieldName] && errors[fieldName] ? errors[fieldName] : '';
    };

    const isFieldRequired = (fieldName) => {
        const requiredFields = ['name', 'category', 'price', 'description', 'brand', 'color', 'material', 'fit', 'sizes', 'images', 'weight', 'estimatedDelivery'];
        return requiredFields.includes(fieldName);
    };

    return (
        <div className="vendor-card">
            <div className="card-header">
                <h2>{editingId ? '✏️ Edit Product' : ' Add New Product'}</h2>
                <div className="header-buttons">
                    {editingId && (
                        <button 
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ 
                                    name: '', image: '', images: [], category: 'men', price: '', 
                                    discount: '0', description: '', fit: '', material: '', 
                                    color: '', sizes: [], stock: '', brand: '', tags: '', sizeStocks: {}
                                });
                                setImageFiles([]);
                                setPreviewImages([]);
                                setSizeStocks({});
                                setRemovedImages([]);
                                setSeoKeywords([]);
                                setVariants([]);
                                setShippingDetails({ weight: '', dimensions: { length: '', width: '', height: '' }, estimatedDelivery: '' });
                                setErrors({});
                                setTouched({});
                            }}
                            className="cancel-btn"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="vendor-form">
                {/* Basic Information Section */}
                <div className="form-section">
                    <h3>Basic Information</h3>
                    
                    <div className={`form-group ${getFieldError('name') ? 'has-error' : ''}`}>
                        <label>Product Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter product name"
                            className={getFieldError('name') ? 'error' : ''}
                        />
                        {getFieldError('name') && <span className="error-message">{getFieldError('name')}</span>}
                        <span className="field-hint">3-100 characters. Only letters, numbers, spaces, and basic punctuation</span>
                    </div>
                    
                    <div className="form-row">
                        <div className={`form-group ${getFieldError('category') ? 'has-error' : ''}`}>
                            <label>Category <span className="required">*</span></label>
                            <select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldError('category') ? 'error' : ''}
                            >
                                <option value="">Select Category</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="kid">Kids</option>
                            </select>
                            {getFieldError('category') && <span className="error-message">{getFieldError('category')}</span>}
                        </div>
                        
                        <div className={`form-group ${getFieldError('brand') ? 'has-error' : ''}`}>
                            <label>Brand <span className="required">*</span></label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g. Nike, Adidas"
                                className={getFieldError('brand') ? 'error' : ''}
                            />
                            {getFieldError('brand') && <span className="error-message">{getFieldError('brand')}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${getFieldError('price') ? 'has-error' : ''}`}>
                            <label>Price (₹) <span className="required">*</span></label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter original price"
                                className={getFieldError('price') ? 'error' : ''}
                            />
                            {getFieldError('price') && <span className="error-message">{getFieldError('price')}</span>}
                            {formData.price && formData.price > 0 && (
                                <span className="price-preview">
                                    Final Price: ₹{Math.round(formData.price - (formData.price * ((formData.discount || 0) / 100)))}
                                </span>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label>Discount (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="0"
                                min="0"
                                max="100"
                            />
                            {getFieldError('discount') && <span className="error-message">{getFieldError('discount')}</span>}
                        </div>
                    </div>

                    <div className={`form-group ${getFieldError('description') ? 'has-error' : ''}`}>
                        <label>Product Description <span className="required">*</span></label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Describe your product in detail (features, benefits, specifications, etc.)"
                            rows="5"
                            maxLength="2000"
                            className={getFieldError('description') ? 'error' : ''}
                        />
                        <div className="character-counter">
                            <span className={characterCount < 20 ? 'warning' : characterCount > 1900 ? 'warning' : ''}>
                                {characterCount}
                            </span>/2000 characters
                            {characterCount < 20 && characterCount > 0 && <span className="warning-text"> (Minimum 20 characters required)</span>}
                        </div>
                        {getFieldError('description') && <span className="error-message">{getFieldError('description')}</span>}
                    </div>
                </div>

                {/* Product Specifications */}
                <div className="form-section">
                    <h3>Product Specifications</h3>
                    
                    <div className="form-row">
                        <div className={`form-group ${getFieldError('color') ? 'has-error' : ''}`}>
                            <label>Color <span className="required">*</span></label>
                            <input 
                                type="text" 
                                name="color" 
                                value={formData.color} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g. Navy Blue, Red, Black"
                                className={getFieldError('color') ? 'error' : ''}
                            />
                            {getFieldError('color') && <span className="error-message">{getFieldError('color')}</span>}
                        </div>
                        
                        <div className={`form-group ${getFieldError('material') ? 'has-error' : ''}`}>
                            <label>Material <span className="required">*</span></label>
                            <input 
                                type="text" 
                                name="material" 
                                value={formData.material} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g. 100% Cotton, Polyester Blend"
                                className={getFieldError('material') ? 'error' : ''}
                            />
                            {getFieldError('material') && <span className="error-message">{getFieldError('material')}</span>}
                        </div>
                        
                        <div className={`form-group ${getFieldError('fit') ? 'has-error' : ''}`}>
                            <label>Fit <span className="required">*</span></label>
                            <select 
                                name="fit" 
                                value={formData.fit} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldError('fit') ? 'error' : ''}
                            >
                                <option value="">Select Fit</option>
                                <option value="Slim Fit">Slim Fit</option>
                                <option value="Regular Fit">Regular Fit</option>
                                <option value="Relaxed Fit">Relaxed Fit</option>
                                <option value="Oversized Fit">Oversized Fit</option>
                                <option value="Compression Fit">Compression Fit</option>
                            </select>
                            {getFieldError('fit') && <span className="error-message">{getFieldError('fit')}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tags</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="Summer, New, Trending, Exclusive"
                        />
                        <span className="field-hint">Comma separated values for better searchability</span>
                    </div>
                </div>

                {/* Size & Stock Section */}
                <div className="form-section">
                    <h3>Size & Stock Management</h3>
                    
                    <div className={`form-group ${getFieldError('sizes') ? 'has-error' : ''}`}>
                        <label>Available Sizes <span className="required">*</span></label>
                        <div className="size-selector">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', '42', '44'].map(size => (
                                <div 
                                    key={size}
                                    onClick={() => {
                                        const newSizes = formData.sizes.includes(size) 
                                            ? formData.sizes.filter(s => s !== size)
                                            : [...formData.sizes, size];
                                        setFormData({...formData, sizes: newSizes});
                                        const error = validateField('sizes', newSizes);
                                        setErrors(prev => ({ ...prev, sizes: error }));
                                    }}
                                    className={`size-option ${formData.sizes.includes(size) ? 'selected' : ''}`}
                                >
                                    {size}
                                </div>
                            ))}
                        </div>
                        {getFieldError('sizes') && <span className="error-message">{getFieldError('sizes')}</span>}
                    </div>

                    {formData.sizes.length > 0 && (
                        <div className={`form-group ${getFieldError('stock') ? 'has-error' : ''}`}>
                            <label>Stock Per Size <span className="required">*</span></label>
                            <div className="size-stock-grid">
                                {formData.sizes.map(size => (
                                    <div key={size} className="size-stock-input">
                                        <label>{size}</label>
                                        <input
                                            type="number"
                                            value={sizeStocks[size] || ''}
                                            onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                            placeholder="Quantity"
                                            min="0"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="total-stock-info">
                                <span>Total Stock: </span>
                                <strong>{calculateTotalStock()} units</strong>
                            </div>
                            {getFieldError('stock') && <span className="error-message">{getFieldError('stock')}</span>}
                        </div>
                    )}
                </div>

                {/* Images Section */}
                <div className="form-section">
                    <h3>Product Images</h3>
                    
                    <div className={`form-group ${getFieldError('images') ? 'has-error' : ''}`}>
                        <label>Product Images <span className="required">*</span></label>
                        <div 
                            className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageFiles({ target: { files: e.dataTransfer.files } }); }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageFiles}
                                id="vendor-image-upload"
                                style={{display: 'none'}}
                            />
                            <label htmlFor="vendor-image-upload" className="upload-label">
                                📁 Click to upload images or drag & drop
                            </label>
                            <p className="upload-hint">Supported formats: JPG, PNG, GIF, WebP (Max 5MB per image)</p>
                            <p className="upload-hint">Recommended: Upload at least 3 images from different angles</p>
                        </div>
                        {getFieldError('images') && <span className="error-message">{getFieldError('images')}</span>}
                        
                        {previewImages.length > 0 && (
                            <div className="image-preview-grid">
                                {previewImages.map((img) => (
                                    <div key={img.id} className="preview-item">
                                        <img src={img.preview} alt="Preview" className="preview-image" />
                                        <div className="preview-overlay">
                                            {!img.isNew && <span className="image-badge existing">Existing</span>}
                                            {img.isNew && <span className="image-badge new">New</span>}
                                            <button
                                                type="button"
                                                onClick={() => removeImagePreview(img.id)}
                                                className="delete-preview-btn"
                                                title="Remove image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SEO Section */}
                {/* <div className="form-section">
                    <h3>Search Engine Optimization (SEO)</h3>
                    
                    <div className={`form-group ${getFieldError('seoKeywords') ? 'has-error' : ''}`}>
                        <label>SEO Keywords <span className="required">*</span></label>
                        <div className="seo-keywords-container">
                            <div className="keyword-input-group">
                                <input
                                    type="text"
                                    id="seoKeywordInput"
                                    placeholder="Enter keyword and press Enter"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSeoKeywordAdd(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('seoKeywordInput');
                                        handleSeoKeywordAdd(input.value);
                                        input.value = '';
                                    }}
                                    className="add-keyword-btn"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="keywords-list">
                                {seoKeywords.map((keyword, index) => (
                                    <span key={index} className="keyword-tag">
                                        {keyword}
                                        <button type="button" onClick={() => handleSeoKeywordRemove(keyword)}>✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        {getFieldError('seoKeywords') && <span className="error-message">{getFieldError('seoKeywords')}</span>}
                        <span className="field-hint">Add relevant keywords to improve product visibility in search results</span>
                    </div>
                </div> */}

                {/* Shipping Information */}
                <div className="form-section">
                    <h3>Shipping Information</h3>
                    
                    <div className="form-row">
                        <div className={`form-group ${getFieldError('weight') ? 'has-error' : ''}`}>
                            <label>Product Weight (kg) <span className="required">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                value={shippingDetails.weight}
                                onChange={(e) => handleShippingChange('weight', e.target.value)}
                                onBlur={handleBlur}
                                placeholder="e.g. 0.5"
                                className={getFieldError('weight') ? 'error' : ''}
                            />
                            {getFieldError('weight') && <span className="error-message">{getFieldError('weight')}</span>}
                        </div>
                        
                        <div className={`form-group ${getFieldError('estimatedDelivery') ? 'has-error' : ''}`}>
                            <label>Estimated Delivery <span className="required">*</span></label>
                            <select
                                value={shippingDetails.estimatedDelivery}
                                onChange={(e) => handleShippingChange('estimatedDelivery', e.target.value)}
                                className={getFieldError('estimatedDelivery') ? 'error' : ''}
                            >
                                <option value="">Select Delivery Time</option>
                                <option value="1-2 days">1-2 days (Express)</option>
                                <option value="3-5 days">3-5 days (Standard)</option>
                                <option value="5-7 days">5-7 days (Economy)</option>
                                <option value="7-10 days">7-10 days (International)</option>
                            </select>
                            {getFieldError('estimatedDelivery') && <span className="error-message">{getFieldError('estimatedDelivery')}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Package Dimensions (cm)</label>
                        <div className="dimensions-grid">
                            <input
                                type="number"
                                placeholder="Length"
                                value={shippingDetails.dimensions.length}
                                onChange={(e) => handleDimensionChange('length', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Width"
                                value={shippingDetails.dimensions.width}
                                onChange={(e) => handleDimensionChange('width', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Height"
                                value={shippingDetails.dimensions.height}
                                onChange={(e) => handleDimensionChange('height', e.target.value)}
                            />
                        </div>
                        <span className="field-hint">Optional: Helps calculate accurate shipping costs</span>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="submit" className="vendor-submit-btn" disabled={loading}>
                        {loading ? '⏳ Processing...' : editingId ? '💾 Update Product' : '🚀 Publish Product'}
                    </button>
                    <button 
                        type="button" 
                        className="save-draft-btn"
                        onClick={() => {
                            if (window.confirm('Save product as draft? You can edit and publish later.')) {
                                showNotification('Product saved as draft', 'success');
                            }
                        }}
                    >
                        Save as Draft
                    </button>
                    <button 
                        type="button" 
                        className="reset-btn"
                        onClick={() => {
                            if (window.confirm('Reset all form fields? All entered data will be lost.')) {
                                setFormData({ 
                                    name: '', image: '', images: [], category: 'men', price: '', 
                                    discount: '0', description: '', fit: '', material: '', 
                                    color: '', sizes: [], stock: '', brand: '', tags: '', sizeStocks: {}
                                });
                                setImageFiles([]);
                                setPreviewImages([]);
                                setSizeStocks({});
                                setRemovedImages([]);
                                setSeoKeywords([]);
                                setVariants([]);
                                setShippingDetails({ weight: '', dimensions: { length: '', width: '', height: '' }, estimatedDelivery: '' });
                                setErrors({});
                                setTouched({});
                            }
                        }}
                    >
                        Reset Form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;