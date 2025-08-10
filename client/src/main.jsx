import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Spin } from 'antd';
import CustomSpinner from './components/Loading/CustomSpinner';

import { publicRoutes } from './Routes/index';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Provider } from './store/Provider';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './utils/Chatbot'; // Import Chatbot

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
        <>
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
            
            {/* Chatbot sẽ xuất hiện ở tất cả các trang */}
            <Chatbot />
        </>
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