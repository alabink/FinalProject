import App from '../App';
import LoginUser from '../../Pages/LoginUser/LoginUser';
import RegisterUser from '../../Pages/RegisterUser/RegisterUser';
import InfoUser from '../../Pages/InfoUser/index';
import Cart from '../../Pages/Cart/Cart';
import Wishlist from '../../Pages/Wishlist/Wishlist';
import ForgotPassword from '../../Pages/ForgotPassword/ForgotPassword';

// Footer Pages
import About from '../../Pages/Footer/About/About';
import PurchaseGuide from '../../Pages/Footer/PurchaseGuide/PurchaseGuide';
import PaymentGuide from '../../Pages/Footer/PaymentGuide/PaymentGuide';
import Contact from '../../Pages/Footer/Contact/Contact';
import WarrantyPolicy from '../../Pages/Footer/WarrantyPolicy/WarrantyPolicy';
import ReturnPolicy from '../../Pages/Footer/ReturnPolicy/ReturnPolicy';
import ShippingPolicy from '../../Pages/Footer/ShippingPolicy/ShippingPolicy';
import PrivacyPolicy from '../../Pages/Footer/PrivacyPolicy/PrivacyPolicy';

const publicRoutes = [
    { path: '/', component: <App /> },
    { path: '/login', component: <LoginUser /> },
    { path: '/register', component: <RegisterUser /> },
    { path: '/info-user/:id', component: <InfoUser /> },
    { path: '/cart', component: <Cart /> },
    { path: '/wishlist', component: <Wishlist /> },
    { path: '/forgot-password', component: <ForgotPassword /> },
];

export { publicRoutes };