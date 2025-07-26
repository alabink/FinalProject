import './App.css';
import Header from './Components/Header/Header';
import MainHome from './Components/MainHome/MainHome';
import Footer from '../Components/Footer/Footer';

import Chatbot from '../utils/chatbot';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        document.title = 'Techify - Thế giới đồ công nghệ';
        
        // Add home-page class to body for this page
        document.body.classList.add('home-page');
        
        // Cleanup function to remove class when component unmounts
        return () => {
            document.body.classList.remove('home-page');
        };
    }, []);

    return (
        <div className="App">
            <header>
                <Header />
            </header>
            <main>
                <MainHome />
            </main>

            <Chatbot />

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
