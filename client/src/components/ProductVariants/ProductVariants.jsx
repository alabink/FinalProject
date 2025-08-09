import React, { useState, useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductVariants.module.scss';

const cx = classNames.bind(styles);

function ProductVariants({ 
    productId, 
    variants = [], 
    onVariantChange,
    onImageChange, // Thêm callback để thay đổi ảnh chính
    defaultColorIndex = -1, // Đổi thành -1 để không chọn mặc định
    defaultStorageIndex = -1 // Đổi thành -1 để không chọn mặc định
}) {
    const [selectedColorIndex, setSelectedColorIndex] = useState(defaultColorIndex);
    const [selectedStorageIndex, setSelectedStorageIndex] = useState(defaultStorageIndex);
    const [availableStorages, setAvailableStorages] = useState([]);
    const [currentVariant, setCurrentVariant] = useState(null);

    // Memoize these computations to prevent recalculation on each render
    const colors = useMemo(() => {
        return variants.reduce((acc, variant) => {
            const existingColor = acc.find(c => c.name === variant.color.name);
            if (!existingColor) {
                acc.push(variant.color);
            }
            return acc;
        }, []);
    }, [variants]);

    const allStorages = useMemo(() => {
        return variants.reduce((acc, variant) => {
            const existingStorage = acc.find(s => s.size === variant.storage.size);
            if (!existingStorage) {
                acc.push(variant.storage);
            }
            return acc;
        }, []);
    }, [variants]);

    // Update available storages when color changes
    useEffect(() => {
        if (colors.length > 0 && selectedColorIndex >= 0) {
            const selectedColor = colors[selectedColorIndex];
            const storagesForColor = variants
                .filter(v => v.color.name === selectedColor.name)
                .map(v => v.storage);
            
            setAvailableStorages(storagesForColor);
            
            // Reset storage index if current storage is not available
            if (selectedStorageIndex >= 0) {
                const currentStorage = allStorages[selectedStorageIndex];
                const isStorageAvailable = storagesForColor.some(s => s.size === currentStorage?.size);
                
                if (!isStorageAvailable) {
                    setSelectedStorageIndex(-1);
                }
            }
        } else {
            setAvailableStorages([]);
            setSelectedStorageIndex(-1);
        }
    }, [selectedColorIndex, colors, allStorages, variants, selectedStorageIndex]);

    // Memoize the variant update to prevent unnecessary calls
    const updateCurrentVariant = useCallback(() => {
        if (selectedColorIndex >= 0 && selectedStorageIndex >= 0 && 
            colors.length > 0 && availableStorages.length > 0) {
            const selectedColor = colors[selectedColorIndex];
            const selectedStorage = availableStorages[selectedStorageIndex];
            
            const variant = variants.find(v => 
                v.color.name === selectedColor.name && 
                v.storage.size === selectedStorage.size
            );
            
            setCurrentVariant(variant);
            
            if (variant && onVariantChange) {
                onVariantChange(variant);
            }
        } else {
            setCurrentVariant(null);
            if (onVariantChange) {
                onVariantChange(null);
            }
        }
    }, [selectedColorIndex, selectedStorageIndex, colors, availableStorages, variants, onVariantChange]);

    useEffect(() => {
        updateCurrentVariant();
    }, [updateCurrentVariant]);

    // Handlers for color and storage selection
    const handleColorChange = useCallback((colorIndex) => {
        if (selectedColorIndex === colorIndex) {
            setSelectedColorIndex(-1);
            if (onImageChange) {
                onImageChange(null);
            }
        } else {
            setSelectedColorIndex(colorIndex);
            if (onImageChange && colors[colorIndex]?.image) {
                onImageChange(colors[colorIndex].image);
            }
        }
    }, [selectedColorIndex, onImageChange, colors]);

    const handleStorageChange = useCallback((storageIndex) => {
        if (selectedStorageIndex === storageIndex) {
            setSelectedStorageIndex(-1);
        } else {
            setSelectedStorageIndex(storageIndex);
        }
    }, [selectedStorageIndex]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    if (!variants.length) {
        return null;
    }

    return (
        <div className={cx('variants-container')}>
            {/* Chọn màu sắc */}
            <div className={cx('variant-section')}>
                <h3 className={cx('variant-title')}>
                    Màu sắc {selectedColorIndex === -1 && <span style={{ color: '#999', fontWeight: 'normal' }}>(Chưa chọn)</span>}
                </h3>
                <div className={cx('color-options')}>
                    {colors.map((color, index) => (
                        <div
                            key={color.name}
                            className={cx('color-option', {
                                selected: selectedColorIndex === index
                            })}
                            onClick={() => handleColorChange(index)}
                        >
                            <div className={cx('color-preview')}>
                                <img src={color.image} alt={color.name} />
                                <div 
                                    className={cx('color-dot')} 
                                    style={{ backgroundColor: color.code }}
                                ></div>
                            </div>
                            <span className={cx('color-name')}>{color.name}</span>
                        </div>
                    ))}
                </div>
                {selectedColorIndex === -1 && (
                    <div style={{ 
                        marginTop: '8px', 
                        fontSize: '13px', 
                        color: '#1890ff',
                        fontStyle: 'italic' 
                    }}>
                        👆 Vui lòng chọn màu sắc để xem các phiên bản có sẵn
                    </div>
                )}
            </div>

            {/* Chọn phiên bản */}
            <div className={cx('variant-section')}>
                <h3 className={cx('variant-title')}>
                    Phiên bản {selectedStorageIndex === -1 && <span style={{ color: '#999', fontWeight: 'normal' }}>(Chưa chọn)</span>}
                </h3>
                {selectedColorIndex === -1 ? (
                    <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#999',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '6px',
                        border: '1px dashed #d9d9d9'
                    }}>
                        Vui lòng chọn màu sắc trước
                    </div>
                ) : (
                    <>
                        <div className={cx('storage-options')}>
                            {allStorages.map((storage, index) => {
                                const isAvailable = availableStorages.some(s => s.size === storage.size);
                                const isSelected = selectedStorageIndex === index;
                                
                                // Tìm giá cho storage này với màu đã chọn
                                const selectedColor = colors[selectedColorIndex];
                                const variantForPrice = variants.find(v => 
                                    v.color.name === selectedColor?.name && 
                                    v.storage.size === storage.size
                                );

                                return (
                                    <div
                                        key={storage.size}
                                        className={cx('storage-option', {
                                            selected: isSelected && isAvailable,
                                            disabled: !isAvailable
                                        })}
                                        onClick={() => isAvailable && handleStorageChange(index)}
                                    >
                                        <div className={cx('storage-info')}>
                                            <span className={cx('storage-size')}>{storage.displayName}</span>
                                            {variantForPrice && (
                                                <span className={cx('storage-price')}>
                                                    {variantForPrice.priceDiscount > 0 ? (
                                                        <>
                                                            <span className={cx('discount-price')}>
                                                                {formatPrice(variantForPrice.priceDiscount)}
                                                            </span>
                                                            <span className={cx('original-price')}>
                                                                {formatPrice(variantForPrice.price)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        formatPrice(variantForPrice.price)
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {!isAvailable && (
                                            <span className={cx('out-of-stock')}>Hết hàng</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {selectedStorageIndex === -1 && availableStorages.length > 0 && (
                            <div style={{ 
                                marginTop: '8px', 
                                fontSize: '13px', 
                                color: '#1890ff',
                                fontStyle: 'italic' 
                            }}>
                                👆 Vui lòng chọn phiên bản để xem giá cụ thể
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Thông tin variant hiện tại */}
            {currentVariant ? (
                <div className={cx('current-variant-info')}>
                    <div className={cx('selected-info')}>
                        <span>Đã chọn: </span>
                        <strong>{currentVariant.color.name} - {currentVariant.storage.displayName}</strong>
                    </div>
                    <div className={cx('price-info')}>
                        {currentVariant.priceDiscount > 0 ? (
                            <>
                                <span className={cx('current-price')}>
                                    {formatPrice(currentVariant.priceDiscount)}
                                </span>
                                <span className={cx('old-price')}>
                                    {formatPrice(currentVariant.price)}
                                </span>
                            </>
                        ) : (
                            <span className={cx('current-price')}>
                                {formatPrice(currentVariant.price)}
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                <div className={cx('no-variant-selected')}>
                    <div style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        color: '#666',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px solid #e8e8e8'
                    }}>
                        {selectedColorIndex === -1 && selectedStorageIndex === -1 ? (
                            <>
                                <div style={{ fontSize: '16px', marginBottom: '4px' }}>🎨</div>
                                <div>Vui lòng chọn màu sắc và phiên bản để xem giá</div>
                            </>
                        ) : selectedColorIndex >= 0 && selectedStorageIndex === -1 ? (
                            <>
                                <div style={{ fontSize: '16px', marginBottom: '4px' }}>📱</div>
                                <div>Đã chọn màu <strong>{colors[selectedColorIndex].name}</strong></div>
                                <div style={{ fontSize: '13px', color: '#999' }}>Vui lòng chọn phiên bản để xem giá</div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '16px', marginBottom: '4px' }}>⚠️</div>
                                <div>Không có sản phẩm phù hợp với lựa chọn của bạn</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductVariants; 