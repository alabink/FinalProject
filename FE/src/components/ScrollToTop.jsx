import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top on route changes, but with a slight delay to prevent conflicts
        const timeoutId = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto'
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [pathname]);

    return null;
}

export default ScrollToTop; 