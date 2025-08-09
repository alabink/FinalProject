import './App.css';
import Header from './components/Header/Header';
import MainHome from './components/MainHome/MainHome';
import Footer from './components/Footer/Footer';

import Chatbot from './utils/Chatbot';
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

    console.log("App component rendered");
    

    return (
        <div className="App">
            <header>
                <Header />
            </header>
            <main>
                <MainHome />
            </main>

            {/* <Chatbot /> */}

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
