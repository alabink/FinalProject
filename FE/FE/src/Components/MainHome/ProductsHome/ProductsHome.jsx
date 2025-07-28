import classNames from 'classnames/bind';
import styles from './ProductsHome.module.scss';
import CardBody from '../../CardBody/CardBody';
import { Link } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { AppstoreOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const cx = classNames.bind(styles);

function ProductsHome() {
    const { dataCategory } = useStore();

    // Get random products for each category (max 8 per category)
    const categoriesWithRandomProducts = useMemo(() => {
        return dataCategory.map(category => {
            // Clone the category object
            const newCategory = { ...category };
            
            // If the category has more than 8 products, randomize and limit to 8
            if (newCategory.products && newCategory.products.length > 8) {
                // Create a shuffled copy of the products array
                const shuffledProducts = [...newCategory.products]
                    .sort(() => 0.5 - Math.random());
                
                // Take only the first 8 products
                newCategory.products = shuffledProducts.slice(0, 8);
            }
            
            return newCategory;
        });
    }, [dataCategory]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                {categoriesWithRandomProducts.map((category) => (
                    <motion.div
                        key={category._id}
                        className={cx('category-section')}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className={cx('category-header')}>
                            <h2>
                                <AppstoreOutlined className={cx('category-icon')} />
                                {category.nameCategory}
                            </h2>
                            <Link to={`/category/${category._id}`} className={cx('view-all')}>
                                Xem tất cả
                            </Link>
                        </div>

                        <motion.div 
                            className={cx('products-grid')}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {category.products.map((product) => (
                                <motion.div
                                    key={product._id}
                                    variants={itemVariants}
                                    className={cx('product-item')}
                                >
                                    <CardBody item={product} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default ProductsHome;
