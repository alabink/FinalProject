import classNames from 'classnames/bind';
import styles from './CustomSpinner.module.scss';

const cx = classNames.bind(styles);

function CustomSpinner() {
    return (
        <div className={cx('spinner')}>
            <div className={cx('double-bounce1')}></div>
            <div className={cx('double-bounce2')}></div>
        </div>
    );
}

export default CustomSpinner; 