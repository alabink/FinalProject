import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Spin } from 'antd';
import CustomSpinner from './Components/Loading/CustomSpinner';

import { publicRoutes } from './Routes/index';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Provider } from './store/Provider';
import ScrollToTop from './Components/ScrollToTop';

// Set global loading indicator
Spin.setDefaultIndicator(<CustomSpinner />);

// Ensure smooth navigation by setting scroll restoration to manual
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Component wrapper để có thể sử dụng useLocation
function AppWrapper() {
    const location = useLocation();
    
    return (
        <Routes>
            {publicRoutes.map((route, index) => {
                return (
                    <Route 
                        key={index} 
                        path={route.path} 
                        element={
                            <div key={location.pathname}>
                                {route.component}
                            </div>
                        } 
                    />
                );
            })}
        </Routes>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider>
            <Router>
                <ScrollToTop />
                <AppWrapper />
            </Router>
        </Provider>
    </StrictMode>,
);
