import App from '../App';
import LoginUser from '../Pages/LoginUser/LoginUser';
import RegisterUser from '../Pages/RegisterUser/RegisterUser';
import DetailProduct from '../Pages/DetailProduct/DetailProduct';
import Category from '../Pages/Category/Category';
import InfoUser from '../Pages/InfoUser/index';
import Cart from '../Pages/Cart/Cart';
import Wishlist from '../Pages/Wishlist/Wishlist';
import MainLayout from '../Pages/Admin/MainLayout';
import Payments from '../Pages/Payments/Payments';
import ForgotPassword from '../Pages/ForgotPassword/ForgotPassword';
import Search from '../Pages/Search/Search';
import DemoSuccess from '../Pages/DemoSuccess/DemoSuccess';
import ProductComparison from '../Pages/ProductComparison/ProductComparison';

// Footer Pages
import About from '../Pages/Footer/About/About';
import PurchaseGuide from '../Pages/Footer/PurchaseGuide/PurchaseGuide';
import PaymentGuide from '../Pages/Footer/PaymentGuide/PaymentGuide';
import Contact from '../Pages/Footer/Contact/Contact';
import WarrantyPolicy from '../Pages/Footer/WarrantyPolicy/WarrantyPolicy';
import ReturnPolicy from '../Pages/Footer/ReturnPolicy/ReturnPolicy';
import ShippingPolicy from '../Pages/Footer/ShippingPolicy/ShippingPolicy';
import PrivacyPolicy from '../Pages/Footer/PrivacyPolicy/PrivacyPolicy';

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
