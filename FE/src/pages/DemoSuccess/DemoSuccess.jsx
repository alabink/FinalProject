import React from 'react';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import UpdateNotificationExample from '../../Components/ProgressSuccess/UpdateNotificationExample';

function DemoSuccess() {
    return (
        <div>
            <Header />
            <main style={{ 
                minHeight: '80vh', 
                paddingTop: '100px',
                paddingBottom: '50px',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 20px'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '30px',
                        color: '#1f2937',
                        textAlign: 'center'
                    }}>
                        Demo Các Loại Thông Báo
                    </h1>
                    <UpdateNotificationExample />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default DemoSuccess; 