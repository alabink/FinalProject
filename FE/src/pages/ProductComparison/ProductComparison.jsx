import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import request from '../../Config/request';
import { Spin, Select, Button, Alert } from 'antd';
import './ProductComparison.module.scss';

const ProductComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);
  const [comparisonType, setComparisonType] = useState('detailed'); // 'detailed' or 'quick'

  // Helper to validate MongoDB ObjectId (24 hex chars)
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  // useEffect parse param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const productIdParam = searchParams.get('products');

    if (productIdParam) {
      const initialProductIds = productIdParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id && isValidObjectId(id));
      setSelectedProductIds(initialProductIds);
    }
  }, [location.search]);

  // Fetch all products for selection
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await request.get('/api/all-product');
        if (response.data.metadata) {
          setAllProducts(response.data.metadata);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Lỗi khi tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // fetchSelectedProducts loop modify
  useEffect(() => {
    const fetchSelectedProducts = async () => {
      const ids = selectedProductIds.filter((id) => id && isValidObjectId(id));
      if (!ids.length) return;

      setLoading(true);
      try {
        const productsData = [];

        for (const id of ids) {
          try {
            const response = await request.get(`/api/product?id=${id}`);
            if (response.data.metadata?.data) {
              productsData.push(response.data.metadata.data);
            }
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
          }
        }

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching selected products:', error);
        setError('Lỗi khi tải thông tin sản phẩm đã chọn');
      } finally {
        setLoading(false);
      }
    };

    if (selectedProductIds.length > 0) {
      fetchSelectedProducts();
    }
  }, [selectedProductIds]);

  // handleProductSelection
  const handleProductSelection = (values) => {
    const filtered = values.filter((id) => id && isValidObjectId(id));
    setSelectedProductIds(filtered);

    const searchParams = new URLSearchParams();
    if (filtered.length > 0) {
      searchParams.set('products', filtered.join(','));
      navigate(`?${searchParams.toString()}`);
    } else {
      navigate('');
    }
  };

  // compareProducts
  const compareProducts = async () => {
    const validIds = selectedProductIds.filter((id) => id && isValidObjectId(id));
    if (validIds.length < 2) {
      setError('Vui lòng chọn ít nhất 2 sản phẩm hợp lệ để so sánh');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = comparisonType === 'detailed'
        ? '/api/compare-products'
        : '/api/quick-compare-products';

      const response = await request.post(endpoint, {
        productIds: validIds,
      });

      if (comparisonType === 'detailed') {
        setComparisonResult(response.data.metadata.comparisonHTML);
      } else {
        setComparisonResult(response.data.metadata.comparisonTable);
      }
    } catch (error) {
      console.error('Error comparing products:', error);
      setError(
        'Lỗi khi so sánh sản phẩm: ' + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-comparison-container">
      <div className="comparison-header">
        <h1>So sánh sản phẩm</h1>
        <div className="product-selector">
          <Select
            mode="multiple"
            placeholder="Chọn sản phẩm để so sánh"
            value={selectedProductIds}
            onChange={handleProductSelection}
            style={{ width: '100%', maxWidth: '600px' }}
            options={allProducts.map((product) => ({
              value: product._id,
              label: product.name
            }))}
            maxTagCount={5}
            loading={loading}
          />
        </div>
        
        <div className="comparison-options">
          <div className="comparison-type">
            <Button 
              type={comparisonType === 'detailed' ? 'primary' : 'default'} 
              onClick={() => setComparisonType('detailed')}
            >
              So sánh chi tiết
            </Button>
            <Button 
              type={comparisonType === 'quick' ? 'primary' : 'default'} 
              onClick={() => setComparisonType('quick')}
            >
              So sánh nhanh
            </Button>
          </div>
          
          <Button 
            type="primary" 
            onClick={compareProducts} 
            disabled={selectedProductIds.length < 2}
            loading={loading}
          >
            So sánh ngay
          </Button>
        </div>
      </div>

      {error && (
        <Alert 
          message="Lỗi" 
          description={error} 
          type="error" 
          showIcon 
          closable 
          onClose={() => setError(null)}
          style={{ marginBottom: '20px' }}
        />
      )}

      <div className="selected-products">
        {products.length > 0 && (
          <div className="product-cards">
            {products.map(product => (
              <div className="product-card" key={product._id}>
                <img 
                  src={product.images?.[0]} 
                  alt={product.name} 
                  className="product-image"
                />
                <h3>{product.name}</h3>
                <p className="product-price">
                  {product.priceDiscount > 0 
                    ? `${product.priceDiscount.toLocaleString('vi-VN')} VND`
                    : `${product.price.toLocaleString('vi-VN')} VND`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="comparison-loading">
          <Spin size="large" tip="Hệ thống TechifyAI đang phân tích & so sánh sản phẩm..." />
        </div>
      )}

      {comparisonResult && !loading && (
        <div 
          className="comparison-result"
          dangerouslySetInnerHTML={{ __html: comparisonResult }}
        />
      )}
    </div>
  );
};

export default ProductComparison; 