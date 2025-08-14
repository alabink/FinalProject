import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import { Select, Spin, message, Result, Button, Pagination } from 'antd';
import CardBody from '../../components/CardBody/CardBody';
import { useEffect, useRef, useState } from 'react';
import request, { requestFilterProduct } from '../../Config/request';
import { useParams } from 'react-router-dom';
import { 
  CloseOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  LoadingOutlined,
  SearchOutlined,
  ArrowDownOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';

const cx = classNames.bind(styles);

function Category() {
    const [dataProduct, setDataProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);

    const [compareIds, setCompareIds] = useState([]);
    const [compareHTML, setCompareHTML] = useState('');
    const [loadingCompare, setLoadingCompare] = useState(false);
    const [isComparisonActive, setIsComparisonActive] = useState(false);
    const [comparisonError, setComparisonError] = useState(null);

    const [compareMode, setCompareMode] = useState(false);

    const handleToggleCompareMode = () => {
        const newMode = !compareMode;
        setCompareMode(newMode);
        if (!newMode) {
            // exiting compare mode, reset selections and result
            setCompareIds([]);
            setCompareHTML('');
            setIsComparisonActive(false);
            setComparisonError(null);
        } else {
            message.info('Chọn 2 sản phẩm để so sánh chi tiết');
        }
    };

    const { id } = useParams();

    const handleCompareToggle = (productId) => {
        let updated;
        if (compareIds.includes(productId)) {
            updated = compareIds.filter((pid) => pid !== productId);
        } else {
            if (compareIds.length >= 2) {
                message.warning('Chỉ chọn tối đa 2 sản phẩm để so sánh');
                return;
            }
            updated = [...compareIds, productId];
            if (updated.length === 1) {
                message.info('Đã chọn 1 sản phẩm. Chọn thêm 1 sản phẩm nữa để so sánh.');
            } else if (updated.length === 2) {
                message.success('Đã chọn đủ 2 sản phẩm. Nhấn "So sánh ngay" để xem kết quả!');
            }
        }
        setCompareIds(updated);
        
        // Reset comparison when selection changes
        if (isComparisonActive) {
            setCompareHTML('');
            setIsComparisonActive(false);
            setComparisonError(null);
        }
    };

    // Function to fetch comparison data when button is clicked
        const fetchCompare = async () => {
        if (compareIds.length !== 2) {
            message.warning('Cần chọn đủ 2 sản phẩm để so sánh');
            return;
        }
        
                try {
                    setLoadingCompare(true);
            setComparisonError(null);
            
            // Show elegant loading state
            window.scrollTo({
                top: document.querySelector(`.${cx('inner')}`).offsetTop - 100,
                behavior: 'smooth'
            });
            
                    const res = await request.post('/api/compare-products', {
                        productIds: compareIds,
                    });
                    setCompareHTML(res.data.metadata.comparisonHTML);
            setIsComparisonActive(true);
            
            // Success message
            message.success('Phân tích so sánh hoàn tất!');
            
            // Scroll to comparison results
            if (res.data.metadata.comparisonHTML) {
                setTimeout(() => {
                    const compareResults = document.querySelector(`.${cx('compare-result')}`);
                    if (compareResults) {
                        compareResults.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                }, 300);
            }
                } catch (error) {
                    console.error('Compare error', error);
            const errorMsg = error.response?.data?.message || 'Lỗi khi so sánh sản phẩm';
            message.error(errorMsg);
            setComparisonError(errorMsg);
                    setCompareHTML('');
            setIsComparisonActive(false);
                } finally {
                    setLoadingCompare(false);
                }
    };

    // Clear comparison results when changing products or leaving compare mode
    useEffect(() => {
        if (compareIds.length !== 2) {
                setCompareHTML('');
            setIsComparisonActive(false);
            }
    }, [compareIds]);

    const applyResponse = (res) => {
        if (!res || !res.metadata) {
            setDataProduct([]);
            setTotal(0);
            return;
        }
        // Support both new (object) and old (array) response shapes
        if (Array.isArray(res.metadata)) {
            const start = (page - 1) * limit;
            const items = res.metadata.slice(start, start + limit);
            setDataProduct(items);
            setTotal(res.metadata.length);
            setCategoryName(items[0]?.category?.nameCategory || '');
        } else {
            const items = res.metadata.items || [];
            setDataProduct(items);
            setTotal(res.metadata.total || items.length || 0);
            setCategoryName(items[0]?.category?.nameCategory || '');
        }
    };

    const handlePriceRange = async (range) => {
        try {
            setLoading(true);
            const res = await requestFilterProduct({ priceRange: range, categoryId: id, page: 1, limit });
            setPage(1);
            applyResponse(res);
        } catch (error) {
            console.error('Error filtering products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (value) => {
        try {
            setLoading(true);
            const pricedes = value === 'jack' ? 'desc' : 'asc';
            const res = await requestFilterProduct({ pricedes, categoryId: id, page: 1, limit });
            setPage(1);
            applyResponse(res);
        } catch (error) {
            console.error('Error sorting products:', error);
        } finally {
            setLoading(false);
        }
    };

    const ref = useRef();

    useEffect(() => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
        setCompareIds([]);
        setCompareHTML('');
        setIsComparisonActive(false);
        setComparisonError(null);
        setPage(1);
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await requestFilterProduct({ categoryId: id, page, limit });
                applyResponse(res);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, page, limit]); // reload when category or page changes

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: document.querySelector(`.${cx('inner')}`).offsetTop - 100, behavior: 'smooth' });
    };

    const renderProductCard = (item) => {
        const isSelected = compareIds.includes(item._id);
        return (
            <div 
                key={item._id} 
                className={cx('compare-wrapper', { selected: isSelected && compareMode })}
            >
                {compareMode && (
                    <input
                        type="checkbox"
                        className={cx('compare-checkbox')}
                        checked={isSelected}
                        onChange={() => handleCompareToggle(item._id)}
                        title="Chọn để so sánh"
                    />
                )}
                <CardBody item={item} />
            </div>
        );
    };

    return (
        <div className={cx('wrapper')} ref={ref}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('inner')}>
                    <div className={cx('fillter')}>
                        <div>
                            <button 
                                className={!loading && dataProduct.length > 0 && dataProduct[0]?.priceRange === undefined ? cx('active') : ''}
                                onClick={() => handlePriceRange()}
                            >
                                Mặc định
                            </button>
                            <button 
                                className={!loading && dataProduct.length > 0 && dataProduct[0]?.priceRange === 'under20' ? cx('active') : ''}
                                onClick={() => handlePriceRange('under20')}
                            >
                                Dưới 20 triệu
                            </button>
                            <button 
                                className={!loading && dataProduct.length > 0 && dataProduct[0]?.priceRange === '20to40' ? cx('active') : ''}
                                onClick={() => handlePriceRange('20to40')}
                            >
                                20 - 40 triệu
                            </button>
                            <button 
                                className={!loading && dataProduct.length > 0 && dataProduct[0]?.priceRange === 'above40' ? cx('active') : ''}
                                onClick={() => handlePriceRange('above40')}
                            >
                                Trên 40 triệu
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', alignItems:'center' }}>
                            <Select
                                defaultValue="lucy"
                                style={{ width: 250 }}
                                className={cx('custom-select')}
                                onChange={handleChange}
                                dropdownStyle={{ borderRadius: '16px' }}
                                options={[
                                    { 
                                        value: 'jack', 
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <SortDescendingOutlined style={{ fontSize: '14px', marginRight: '8px', color: '#d4af37' }} />
                                                <span>Giá từ cao đến thấp</span>
                                            </div>
                                        ) 
                                    },
                                    { 
                                        value: 'lucy', 
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <SortAscendingOutlined style={{ fontSize: '14px', marginRight: '8px', color: '#d4af37' }} />
                                                <span>Giá từ thấp đến cao</span>
                                            </div>
                                        ) 
                                    },
                                ]}
                            />

                            <button 
                                onClick={handleToggleCompareMode} 
                                className={cx('compare-toggle-btn', { active: compareMode })}
                            >
                                {compareMode ? 'Đóng so sánh' : 'So sánh'}
                            </button>
                        </div>
                    </div>

                    {/* Comparison Result */}
                    {loadingCompare && (
                        <div className={cx('compare-loading')}>
                            <Spin 
                                indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} 
                                tip="Hệ thống TechifyAI đang phân tích sản phẩm..."
                            />
                            <p>Hệ thống AI đang so sánh và tư vấn lựa chọn phù hợp nhất cho bạn...</p>
                            <div className={cx('loading-pulse')}>
                                <SearchOutlined style={{ fontSize: 24 }} />
                                <ArrowDownOutlined style={{ fontSize: 16, margin: '0 10px' }} />
                                <CheckCircleOutlined style={{ fontSize: 24 }} />
                            </div>
                        </div>
                    )}

                    {comparisonError && (
                        <Result
                            status="error"
                            title="Không thể so sánh sản phẩm"
                            subTitle={comparisonError}
                            extra={[
                                <Button 
                                    type="primary" 
                                    key="try-again"
                                    icon={<SyncOutlined />}
                                    onClick={fetchCompare}
                                >
                                    Thử lại
                                </Button>,
                            ]}
                        />
                    )}

                    {compareHTML && (
                        <div
                            className={cx('compare-result')}
                            dangerouslySetInnerHTML={{ __html: compareHTML }}
                        />
                    )}

                    {loading ? (
                        <div className={cx('loading-container')}>
                            <Spin size="large" />
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    ) : (
                    <div className={cx('product-list')}>
                            {dataProduct.length > 0 ? (
                                dataProduct.map((item) => renderProductCard(item))
                            ) : (
                                <div className={cx('empty-state')}>
                                    <p>Không có sản phẩm nào trong danh mục này</p>
                                </div>
                            )}
                        </div>
                    )}
                    {!loading && total > limit && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                            <Pagination current={page} pageSize={limit} total={total} onChange={handlePageChange} showSizeChanger={false} />
                        </div>
                    )}
                </div>
            </main>

            <footer>
                <Footer />
            </footer>

            {/* Floating Comparison Panel - Only show when in compare mode AND comparison is not active */}
            {compareMode && !isComparisonActive && (
                <div className={cx('compare-panel')}>
                    <div className={cx('counter')}>{compareIds.length}</div>
                    <span>{compareIds.length === 0 
                        ? 'Chọn sản phẩm để so sánh' 
                        : compareIds.length === 1 
                        ? 'Chọn thêm 1 sản phẩm nữa' 
                        : 'Đã chọn đủ 2 sản phẩm'}
                    </span>
                    <button 
                        disabled={compareIds.length !== 2} 
                        onClick={fetchCompare}
                    >
                        So sánh ngay
                    </button>
                    <button className={cx('close-btn')} onClick={handleToggleCompareMode}>
                        <CloseOutlined />
                    </button>
                </div>
            )}
        </div>
    );
}

export default Category;


