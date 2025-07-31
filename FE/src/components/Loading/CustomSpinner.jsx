// Import thư viện classNames để bind CSS module
import classNames from 'classnames/bind';

// Import style module
import styles from './CustomSpinner.module.scss';

// Tạo cx function để dễ sử dụng class names từ SCSS
const cx = classNames.bind(styles);

// Component hiển thị spinner loading
function CustomSpinner() {
    return (
        <div className={cx('spinner')}>
            {/* Vòng quay thứ nhất */}
            <div className={cx('double-bounce1')}></div>

            {/* Vòng quay thứ hai */}
            <div className={cx('double-bounce2')}></div>
        </div>
    );
}

// Export component để tái sử dụng
export default CustomSpinner;
