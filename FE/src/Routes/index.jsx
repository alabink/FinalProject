import App from '../App';
import LoginUser from '../pages/LoginUser/LoginUser';
import RegisterUser from '../pages/RegisterUser/RegisterUser';
import DetailProduct from '../pages/DetailProduct/DetailProduct';
import Category from '../pages/Category/Category';
import InfoUser from '../pages/InfoUser/index';
import Cart from '../pages/Cart/Cart';
import Wishlist from '../pages/Wishlist/Wishlist';
import MainLayout from '../pages/Admin/MainLayout';
import Payments from '../pages/Payments/Payments';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Search from '../pages/Search/Search';
import DemoSuccess from '../pages/DemoSuccess/DemoSuccess';
import ProductComparison from '../pages/ProductComparison/ProductComparison';

// Footer Pages
import About from '../pages/Footer/About/About';
import PurchaseGuide from '../pages/Footer/PurchaseGuide/PurchaseGuide';
import PaymentGuide from '../pages/Footer/PaymentGuide/PaymentGuide';
import Contact from '../pages/Footer/Contact/Contact';
import WarrantyPolicy from '../pages/Footer/WarrantyPolicy/WarrantyPolicy';
import ReturnPolicy from '../pages/Footer/ReturnPolicy/ReturnPolicy';
import ShippingPolicy from '../pages/Footer/ShippingPolicy/ShippingPolicy';
import PrivacyPolicy from '../pages/Footer/PrivacyPolicy/PrivacyPolicy';

const publicRoutes = [
    { path: '/', component: <App /> },
    { path: '/login', component: <LoginUser /> },
    { path: '/register', component: <RegisterUser /> },
    { path: '/product/:id', component: <DetailProduct /> },
    { path: '/category/:id', component: <Category /> },
    { path: '/info-user/:id', component: <InfoUser /> },
    { path: '/cart', component: <Cart /> },
    { path: '/wishlist', component: <Wishlist /> },
    { path: '/admin', component: <MainLayout /> },
    { path: '/payment/:id', component: <Payments /> },
    { path: '/forgot-password', component: <ForgotPassword /> },
    { path: '/search', component: <Search /> },
    { path: '/demo-success', component: <DemoSuccess /> },
    { path: '/compare', component: <ProductComparison /> },
    
    // Footer Routes
    { path: '/about', component: <About /> },
    { path: '/purchase-guide', component: <PurchaseGuide /> },
    { path: '/payment-guide', component: <PaymentGuide /> },
    { path: '/contact', component: <Contact /> },
    { path: '/warranty-policy', component: <WarrantyPolicy /> },
    { path: '/return-policy', component: <ReturnPolicy /> },
    { path: '/shipping-policy', component: <ShippingPolicy /> },
    { path: '/privacy-policy', component: <PrivacyPolicy /> },
];

export { publicRoutes };
