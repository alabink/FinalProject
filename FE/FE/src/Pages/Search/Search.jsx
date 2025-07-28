import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Empty, Row, Col, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { requestSearchProduct } from '../../Config/request';
import SearchResultCard from './SearchResultCard';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { motion } from 'framer-motion';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';

const cx = classNames.bind(styles);

function Search() {
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 16;

    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        if (searchQuery.trim()) {
            fetchSearchResults();
        } else {
            setSearchResults([]);
            setTotal(0);
        }
    }, [searchQuery]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const response = await requestSearchProduct(searchQuery.trim());
            
            // Kiểm tra response structure
            if (response && response.metadata && Array.isArray(response.metadata)) {
                const results = response.metadata;
                setSearchResults(results);
                setTotal(results.length);
                setCurrentPage(1); // Reset to first page on new search
            } else {
                setSearchResults([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const paginatedResults = searchResults.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <div className={cx('search-wrapper')}>
            <Header />
            
            <motion.div 
                className={cx('search-page')}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className={cx('search-header')}>
                    <div className={cx('search-header-content')}>
                        <motion.div 
                            className={cx('search-icon')}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <SearchOutlined />
                        </motion.div>
                        <motion.div 
                            className={cx('search-info')}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <h1>Kết quả tìm kiếm</h1>
                            {searchQuery && (
                                <p>
                                    Tìm kiếm cho: <span className={cx('search-query')}>"{searchQuery}"</span>
                                </p>
                            )}
                        </motion.div>
                    </div>
                    
                    <motion.div 
                        className={cx('search-stats')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {!loading && (
                            <div className={cx('stats-container')}>
                                <span className={cx('results-count')}>
                                    {total > 0 ? `Tìm thấy ${total} sản phẩm` : 'Không tìm thấy sản phẩm nào'}
                                </span>
                                {total > 0 && (
                                    <span className={cx('page-info')}>
                                        Trang {currentPage} / {Math.ceil(total / pageSize)}
                                    </span>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className={cx('search-content')}>
                    {loading ? (
                        <motion.div 
                            className={cx('loading-container')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Spin size="large" />
                            <p>Đang tìm kiếm sản phẩm...</p>
                        </motion.div>
                    ) : (
                        <>
                            {paginatedResults.length > 0 ? (
                                <motion.div 
                                    className={cx('results-grid')}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Row gutter={[24, 32]}>
                                        {paginatedResults.map((product, index) => (
                                            <Col key={product._id} xs={24} sm={12} md={12} lg={8}>
                                                <SearchResultCard 
                                                    product={product} 
                                                    index={index}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    className={cx('empty-results')}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className={cx('empty-description')}>
                                                <h3>Không tìm thấy sản phẩm nào phù hợp</h3>
                                                <p>Hãy thử tìm kiếm với từ khóa khác hoặc sử dụng gợi ý bên dưới</p>
                                                <div className={cx('search-suggestions')}>
                                                    <h4>💡 Gợi ý tìm kiếm:</h4>
                                                    <div className={cx('suggestion-grid')}>
                                                        <div className={cx('suggestion-item')}>
                                                            <strong>Theo thương hiệu:</strong>
                                                            <p>iPhone, Samsung, Xiaomi, Oppo, Vivo</p>
                                                        </div>
                                                        <div className={cx('suggestion-item')}>
                                                            <strong>Theo danh mục:</strong>
                                                            <p>Điện thoại, Laptop, Tai nghe, Đồng hồ</p>
                                                        </div>
                                                        <div className={cx('suggestion-item')}>
                                                            <strong>Theo tính năng:</strong>
                                                            <p>Camera, Gaming, Pin khủng, Sạc nhanh</p>
                                                        </div>
                                                        <div className={cx('suggestion-item')}>
                                                            <strong>Theo giá:</strong>
                                                            <p>Dưới 5 triệu, Từ 10-20 triệu</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    />
                                </motion.div>
                            )}

                            {total > pageSize && (
                                <motion.div 
                                    className={cx('pagination-container')}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Pagination
                                        current={currentPage}
                                        total={total}
                                        pageSize={pageSize}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                        showQuickJumper={true}
                                        showTotal={(total, range) => 
                                            `Hiển thị ${range[0]}-${range[1]} trong tổng ${total} sản phẩm`
                                        }
                                        itemRender={(page, type, originalElement) => {
                                            if (type === 'prev') {
                                                return <span>‹ Trước</span>;
                                            }
                                            if (type === 'next') {
                                                return <span>Tiếp ›</span>;
                                            }
                                            return originalElement;
                                        }}
                                    />
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>

            <Footer />
        </div>
    );
}

export default Search; 