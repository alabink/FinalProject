import React, { useEffect } from 'react';
import styles from './About.module.scss';
import PageLayout from '../../../components/PageLayout/PageLayout';
import storeImg from '../../../assets/images/techifyoutside.png';
import insideImg from '../../../assets/images/techifyinside.png';
import logoImg from '../../../assets/images/747.png';
import { motion } from 'framer-motion';

const About = () => {
  // Animation variants for content sections with enhanced elegance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };
  
  // Enhanced gold particle effect
  useEffect(() => {
    const particleContainer = document.getElementById('particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#d4af37" },
          opacity: { value: 0.3, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, color: "#d4af37", opacity: 0.2 }
        }
      });
    }
  }, []);

  return (
    <PageLayout title="Giới thiệu về Techify | Cửa hàng công nghệ cao cấp">
      <div className={styles.aboutContainer}>
        {/* Elegant parallax hero section */}
        <div className={styles.parallaxHero}>
          <div id="particles-js" className={styles.particles}></div>
        <motion.div 
            className={styles.luxuryHeroSection}
            initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
        >
            <div className={styles.luxuryDecorLine}></div>
          <div className={styles.heroContent}>
              <div className={styles.brandMark}></div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1.3, ease: "easeOut" }}
              >
                <img src={logoImg} alt="TECHIFY" className={styles.elegantLogo} />
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Công nghệ tiên phong - Trải nghiệm đỉnh cao</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Đón đầu xu hướng công nghệ toàn cầu - Mang đến giải pháp số hoàn hảo
              </motion.p>
              
              <div className={styles.luxuryOrnament}></div>
          </div>
        </motion.div>
        </div>

        <motion.div
          className={styles.luxuryContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* About Us Section with premium design */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <div className={styles.luxurySectionContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Về chúng tôi
              </h2>
              <p className={styles.luxuryParagraph}>
                Techify là đại lý ủy quyền chính thức của Apple, Samsung, Sony và nhiều thương hiệu công nghệ hàng đầu. 
                Chúng tôi cung cấp đa dạng sản phẩm từ smartphone, laptop, máy tính bảng đến thiết bị thông minh và phụ kiện cao cấp. 
                Mỗi sản phẩm tại Techify đều được kiểm duyệt nghiêm ngặt về chất lượng, bảo hành chính hãng và đi kèm dịch vụ hỗ trợ kỹ thuật 24/7 từ đội ngũ chuyên gia công nghệ.
              </p>
            </div>
            <div className={styles.luxuryImageContainer}>
              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <img src={storeImg} alt="Techify Flagship Store" className={styles.luxuryImage} />
              </div>
            </div>
          </motion.section>

          {/* Vision Section with opulent design */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.luxuryImageContainer}>
              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <img src={insideImg} alt="Techify Exclusive Interior" className={styles.luxuryImage} />
              </div>
            </div>
            <div className={styles.luxurySectionContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Tầm nhìn công nghệ
              </h2>
              <p className={styles.luxuryParagraph}>
                Chúng tôi không chỉ phân phối sản phẩm công nghệ mà còn dẫn đầu xu hướng với hệ thống showroom trải nghiệm 
                Apple Authorized Premium Reseller, Samsung Experience Store và Sony Center. Techify tích hợp các công nghệ 
                AR/VR, trí tuệ nhân tạo và IoT vào không gian mua sắm, cho phép khách hàng tương tác trực tiếp với sản phẩm 
                trước khi đưa ra quyết định. Hệ thống tư vấn thông minh AI của chúng tôi phân tích nhu cầu để đề xuất 
                sản phẩm phù hợp nhất với từng khách hàng.
              </p>
            </div>
          </motion.section>

          {/* Premium Mission Section */}
          <motion.section className={styles.luxuryMissionSection} variants={itemVariants}>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Sứ mệnh công nghệ
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Cung cấp hệ sinh thái sản phẩm và dịch vụ công nghệ toàn diện với tiêu chuẩn quốc tế:
            </p>
            <div className={styles.luxuryCards}>
              <motion.div 
                className={styles.luxuryCard}
                whileHover={{ y: -15, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className={styles.cardDecor}></div>
                <div className={styles.luxuryCardIcon}>
                  <span className={styles.iconWrapper}>✦</span>
                </div>
                <h3>Sản phẩm xác thực</h3>
                <p>100% sản phẩm chính hãng với đầy đủ chứng nhận bảo hành toàn cầu và kiểm định chất lượng</p>
              </motion.div>
              
              <motion.div 
                className={styles.luxuryCard}
                whileHover={{ y: -15, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className={styles.cardDecor}></div>
                <div className={styles.luxuryCardIcon}>
                  <span className={styles.iconWrapper}>✦</span>
                </div>
                <h3>Dịch vụ kỹ thuật</h3>
                <p>Đội ngũ kỹ thuật viên được chứng nhận bởi Apple, Samsung và Microsoft với thời gian phản hồi nhanh chóng</p>
              </motion.div>
              
              <motion.div 
                className={styles.luxuryCard}
                whileHover={{ y: -15, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className={styles.cardDecor}></div>
                <div className={styles.luxuryCardIcon}>
                  <span className={styles.iconWrapper}>✦</span>
                </div>
                <h3>Giải pháp doanh nghiệp</h3>
                <p>Hệ thống giải pháp công nghệ toàn diện cho doanh nghiệp từ phần cứng đến phần mềm và bảo mật</p>
              </motion.div>
              
              <motion.div 
                className={styles.luxuryCard}
                whileHover={{ y: -15, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className={styles.cardDecor}></div>
                <div className={styles.luxuryCardIcon}>
                  <span className={styles.iconWrapper}>✦</span>
                </div>
                <h3>Bảo hành cao cấp</h3>
                <p>Chế độ bảo hành mở rộng với dịch vụ sửa chữa tận nơi và thiết bị thay thế trong thời gian bảo hành</p>
              </motion.div>
            </div>
          </motion.section>

          {/* Luxury Values Section */}
          <motion.section className={styles.luxuryValuesSection} variants={itemVariants}>
            <div className={styles.luxuryPatternOverlay}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Giá trị công nghệ cốt lõi
            </h2>
            <div className={styles.luxuryValuesContainer}>
              <div className={styles.luxuryValueItem}>
                <div className={styles.luxuryValueIcon}>
                  <span>01</span>
                </div>
                <h3>Đổi mới liên tục</h3>
                <p>Liên tục cập nhật các công nghệ mới nhất từ AI, IoT đến AR/VR và tích hợp vào hệ thống bán hàng</p>
              </div>
              
              <div className={styles.luxuryValueItem}>
                <div className={styles.luxuryValueIcon}>
                  <span>02</span>
                </div>
                <h3>Trải nghiệm tương tác</h3>
                <p>Không gian trải nghiệm sản phẩm công nghệ với các demo thực tế và tư vấn từ chuyên gia</p>
              </div>
              
              <div className={styles.luxuryValueItem}>
                <div className={styles.luxuryValueIcon}>
                  <span>03</span>
                </div>
                <h3>Hệ sinh thái toàn diện</h3>
                <p>Cung cấp giải pháp công nghệ đồng bộ từ thiết bị di động, máy tính đến nhà thông minh</p>
              </div>
              
              <div className={styles.luxuryValueItem}>
                <div className={styles.luxuryValueIcon}>
                  <span>04</span>
                </div>
                <h3>Tiên phong xu hướng</h3>
                <p>Luôn là đơn vị đầu tiên giới thiệu các sản phẩm và công nghệ mới nhất tại Việt Nam</p>
              </div>
              
              <div className={styles.luxuryValueItem}>
                <div className={styles.luxuryValueIcon}>
                  <span>05</span>
                </div>
                <h3>An toàn & Bảo mật</h3>
                <p>Đảm bảo an ninh thông tin với hệ thống bảo mật đa lớp cho dữ liệu khách hàng và giao dịch</p>
              </div>
            </div>
          </motion.section>

          {/* Elegant Timeline Section */}
          <motion.section className={styles.luxuryHistorySection} variants={itemVariants}>
            <div className={styles.historyDecorLeft}></div>
            <div className={styles.historyDecorRight}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Hành trình phát triển
            </h2>
            <div className={styles.luxuryTimeline}>
              <div className={styles.luxuryTimelineItem}>
                <div className={styles.timelinePoint}>
                  <div className={styles.timelineDot}></div>
                </div>
                <div className={styles.luxuryTimelineContent}>
                  <h3>5/2025</h3>
                  <p>Thành lập Techify với showroom đầu tiên, trở thành đối tác ủy quyền của Apple và Samsung</p>
                </div>
              </div>
              
              <div className={styles.luxuryTimelineItem}>
                <div className={styles.timelinePoint}>
                  <div className={styles.timelineDot}></div>
                </div>
                <div className={styles.luxuryTimelineContent}>
                  <h3>6/2025</h3>
                  <p>Ra mắt Trung tâm Bảo hành & Dịch vụ với đội ngũ kỹ thuật viên được chứng nhận quốc tế</p>
                </div>
              </div>
              
              <div className={styles.luxuryTimelineItem}>
                <div className={styles.timelinePoint}>
                  <div className={styles.timelineDot}></div>
                </div>
                <div className={styles.luxuryTimelineContent}>
                  <h3>7/2025</h3>
                  <p>Triển khai nền tảng thương mại điện tử Techify.asia với công nghệ AR và AI tư vấn</p>
                </div>
              </div>
              
              <div className={styles.luxuryTimelineItem}>
                <div className={styles.timelinePoint}>
                  <div className={styles.timelineDot}></div>
                </div>
                <div className={styles.luxuryTimelineContent}>
                  <h3>8/2025</h3>
                  <p>Mở rộng hệ thống với 10 showroom trên toàn quốc và triển khai giải pháp IoT cho doanh nghiệp</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Luxury CTA Section */}
          <motion.section className={styles.luxuryCTASection} variants={itemVariants}>
            <div className={styles.ctaDecor}></div>
            <h2 className={styles.ctaHeading}>Trải nghiệm công nghệ đỉnh cao</h2>
            <p className={styles.ctaDescription}>
              Khám phá bộ sưu tập sản phẩm công nghệ mới nhất từ Apple, Samsung, Sony và các thương hiệu hàng đầu thế giới
            </p>
            <motion.button 
              className={styles.luxuryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => window.location.href = '/'}
            >
              <span className={styles.buttonText}>KHÁM PHÁ SẢN PHẨM</span>
              <span className={styles.buttonIcon}>→</span>
            </motion.button>
          </motion.section>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default About; 