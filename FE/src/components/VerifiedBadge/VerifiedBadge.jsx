import React from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './VerifiedBadge.module.scss';

const cx = classNames.bind(styles);

/**
 * VerifiedBadge - A component for displaying admin verification badge consistently across the app
 * @param {Object} props
 * @param {string} props.className - Additional class name (optional)
 * @param {string} props.size - Size of the badge: 'small', 'medium', 'large' (default: 'medium')
 * @param {string} props.tooltipText - Text for the tooltip (default: 'Tài khoản quản trị viên')
 * @returns {JSX.Element} - The verified badge component
 */
function VerifiedBadge({ className, size = 'medium', tooltipText = 'Tài khoản quản trị viên đã được xác minh.' }) {
    return (
        <span 
            className={cx('verified-badge', className, size)} 
            title={tooltipText}
        >
            <CheckCircleFilled className={cx('icon')} />
        </span>
    );
}

export default VerifiedBadge; 