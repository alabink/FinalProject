import React, { useState } from 'react';
import styles from './Contact.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import appleLogo from '../../../assets/images/apple.png';
import samsungLogo from '../../../assets/images/samsung.png';
import xiaomiLogo from '../../../assets/images/xiaomi.png';
import oppoLogo from '../../../assets/images/oppo.png';
import sonyLogo from '../../../assets/images/sony.png';
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  PhoneOutlined, 
  MailOutlined,
  UserOutlined,
  GlobalOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  AimOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulating form submission
    console.log('Form submitted:', formData);
    // In a real application, here you would send the data to your backend
    setSubmitted(true);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  return (
    <PageLayout title="Liên hệ hợp tác">
      <motion.div 
        className={styles.contactContainer}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1 variants={fadeInUp}>Liên hệ hợp tác</motion.h1>
        
        <div className={styles.contactContent}>
          <motion.div 
            className={styles.contactInfo}
            variants={fadeInUp}
          >
            <div className={styles.infoBlock}>
              <h3><EnvironmentOutlined /> Trụ sở chính</h3>
              <p>Số 5 Đinh Tiên Hoàng, Phường Lý Thái Tổ, Quận Hoàn Kiếm</p>
              <p>Thành phố Hà Nội, Việt Nam</p>
            </div>
            
            <div className={styles.infoBlock}>
              <h3><ClockCircleOutlined /> Thời gian làm việc</h3>
              <p>Thứ Hai - Thứ Sáu: 8:00 - 18:00</p>
              <p>Thứ Bảy: 8:00 - 12:00</p>
              <p>Chủ Nhật: Nghỉ</p>
            </div>
            
            <div className={styles.infoBlock}>
              <h3><PhoneOutlined /> Liên hệ</h3>
              <p><MailOutlined /> Email: techify.asia@gmail.com</p>
              <p><PhoneOutlined /> Điện thoại: 0123456789</p>
              <p><PhoneOutlined /> Hotline: 1900 100Có</p>
            </div>
            
            <div className={styles.mapContainer}>
              <h3><AimOutlined /> Bản đồ</h3>
              <div className={styles.map}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0946877789437!2d105.84796277597682!3d21.029395786003467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab961e887533%3A0xbe51d8c56f6a355!2zNSDEkGluaCBUacOqbiBIb8OgbmcsIEjDoG5nIELhuqFjLCBIb8OgbiBLaeG6v20sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1690187774149!5m2!1svi!2s"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, borderRadius: '20px' }}
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ Techify"
                ></iframe>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.contactForm}
            variants={fadeInUp}
          >
            <h2><TeamOutlined /> Gửi thông tin liên hệ</h2>
            
            {submitted ? (
              <div className={styles.successMessage}>
                <CheckCircleOutlined className={styles.successIcon} />
                <p>Cảm ơn bạn đã liên hệ với chúng tôi!</p>
                <p>Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                <button onClick={() => setSubmitted(false)} className={styles.resetBtn}>
                  <SendOutlined /> Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name"><UserOutlined /> Họ và tên *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email"><MailOutlined /> Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@email.com"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="phone"><PhoneOutlined /> Số điện thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0123 456 789"
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject"><SafetyCertificateOutlined /> Tiêu đề *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Tiêu đề tin nhắn của bạn"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message"><TeamOutlined /> Nội dung *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  />
                </div>
                
                <button type="submit" className={styles.submitBtn}>
                  <SendOutlined /> Gửi tin nhắn
                </button>
              </form>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.partnerSection}
          variants={fadeInUp}
        >
          <h2><ThunderboltOutlined /> Đối tác của chúng tôi</h2>
          <p>Techify tự hào hợp tác với các thương hiệu công nghệ hàng đầu trên toàn cầu:</p>
          <div className={styles.partnerLogos}>
            <img src={appleLogo} alt="Apple" className={styles.logo} />
            <img src={samsungLogo} alt="Samsung" className={styles.logo} />
            <img src={xiaomiLogo} alt="Xiaomi" className={styles.logo} />
            <img src={oppoLogo} alt="Oppo" className={styles.logo} />
            <img src={sonyLogo} alt="Sony" className={styles.logo} />
          </div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default Contact; 