import React, { useEffect } from 'react';
import styles from './WarrantyPolicy.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import { motion } from 'framer-motion';
import { SafetyCertificateOutlined, ClockCircleOutlined, EnvironmentOutlined, ToolOutlined } from '@ant-design/icons';

const WarrantyPolicy = () => {
  // Elegant animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    }
  };
  
  // Gold particle effect
  useEffect(() => {
    const particleContainer = document.getElementById('warranty-particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('warranty-particles-js', {
        particles: {
          number: { value: 60, density: { enable: true, value_area: 800 } },
          color: { value: "#d4af37" },
          opacity: { value: 0.3, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, color: "#d4af37", opacity: 0.2 }
        }
      });
    }
  }, []);

  // Warranty package data
  const warrantyPackages = [
    {
      id: 'premium',
      title: 'Premium Warranty',
      description: 'Gia hạn thêm 12 tháng bảo hành chính hãng với đầy đủ quyền lợi',
      benefits: ['Bảo hành chính hãng', 'Hỗ trợ kỹ thuật ưu tiên', 'Miễn phí vận chuyển']
    },
    {
      id: 'elite',
      title: 'Elite Warranty',
      description: 'Dịch vụ bảo hành cao cấp với đặc quyền tận nơi trong 24 giờ',
      benefits: ['Bảo hành tận nơi', 'Xử lý trong 24 giờ', 'Thiết bị thay thế tạm thời']
    },
    {
      id: 'platinum',
      title: 'Platinum Protection',
      description: 'Bảo vệ toàn diện cho thiết bị khỏi mọi rủi ro bao gồm rơi vỡ',
      benefits: ['Bảo vệ rơi vỡ, va đập', 'Bảo vệ ngấm nước', 'Hỗ trợ khẩn cấp 24/7']
    }
  ];

  // Quy trình bảo hành
  const warrantyProcess = [
    'Khách hàng liên hệ Techify qua đường dây nóng đặc biệt hoặc đến trực tiếp showroom',
    'Chuyên viên kỹ thuật cao cấp kiểm tra và phân tích tình trạng sản phẩm',
    'Tiếp nhận bảo hành với quy trình xử lý ưu tiên đối với khách hàng VIP',
    'Sản phẩm được sửa chữa hoặc thay thế với linh kiện chính hãng 100%',
    'Hoàn thiện bảo hành và giao sản phẩm tận nơi với dịch vụ white-glove'
  ];

  return (
    <PageLayout title="Chính sách bảo hành | Đảm bảo chất lượng vượt trội">
      <div className={styles.warrantyContainer}>
        {/* Luxury Hero Section */}
        <div className={styles.luxuryHeroWrapper}>
          <div id="warranty-particles-js" className={styles.particles}></div>
          <motion.div 
            className={styles.luxuryHeroSection}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className={styles.luxuryDecorLine}></div>
            <div className={styles.heroContent}>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1.3, ease: "easeOut" }}
              >
                <span className={styles.elegantText}>Chính Sách Bảo Hành</span>
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Đồng hành cùng sự hoàn hảo</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Cam kết bảo vệ toàn diện cho mỗi sản phẩm công nghệ cao cấp tại Techify
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
          <motion.section className={styles.luxuryIntroSection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <p className={styles.luxuryIntroParagraph}>
              Techify mang đến chính sách bảo hành vượt trội, được thiết kế riêng cho từng dòng sản phẩm cao cấp. Không chỉ dừng lại ở việc sửa chữa thông thường, chúng tôi cam kết bảo vệ trọn vẹn giá trị đầu tư của bạn với dịch vụ tận tâm cùng đội ngũ chuyên gia kỹ thuật được đào tạo và chứng nhận bởi các thương hiệu hàng đầu thế giới.
            </p>
          </motion.section>

          {/* Premium Warranty Duration Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Thời hạn bảo hành đặc quyền
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Mỗi sản phẩm tại Techify đều được hưởng thời gian bảo hành vượt trội so với tiêu chuẩn thị trường, đảm bảo sự yên tâm tuyệt đối cho khách hàng trong suốt quá trình sử dụng:
              </p>
              
              <div className={styles.luxuryWarrantyDuration}>
                <div className={styles.durationCard}>
                  <div className={styles.durationIcon}>
                    <ClockCircleOutlined />
                  </div>
                  <h3>Flagship Devices</h3>
                  <span className={styles.durationPeriod}>24 tháng</span>
                  <p>iPhone, Samsung Galaxy S/Note, Macbook Pro, Surface Pro</p>
                </div>
                
                <div className={styles.durationCard}>
                  <div className={styles.durationIcon}>
                    <ClockCircleOutlined />
                  </div>
                  <h3>High-end Devices</h3>
                  <span className={styles.durationPeriod}>18 tháng</span>
                  <p>iPad, Samsung Tab, Laptop cao cấp, Máy ảnh DSLR</p>
                </div>
                
                <div className={styles.durationCard}>
                  <div className={styles.durationIcon}>
                    <ClockCircleOutlined />
                  </div>
                  <h3>Audio Premium</h3>
                  <span className={styles.durationPeriod}>24 tháng</span>
                  <p>AirPods Pro, Bose, Sony WH-1000XM, B&O, JBL</p>
                </div>
                
                <div className={styles.durationCard}>
                  <div className={styles.durationIcon}>
                    <ClockCircleOutlined />
                  </div>
                  <h3>Accessories</h3>
                  <span className={styles.durationPeriod}>12 tháng</span>
                  <p>Sạc, cáp, adapter, sạc dự phòng cao cấp</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Warranty Conditions */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Điều kiện bảo hành
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Chính sách bảo hành của Techify được xây dựng trên nền tảng minh bạch và công bằng, bảo vệ quyền lợi tối đa cho khách hàng. Sản phẩm sẽ được bảo hành miễn phí khi đáp ứng các điều kiện sau:
              </p>

              <div className={styles.luxuryConditionCards}>
                <div className={styles.conditionCard}>
                  <SafetyCertificateOutlined className={styles.conditionIcon} />
                  <div className={styles.conditionContent}>
                    <h3>Thời hạn hiệu lực</h3>
                    <p>Sản phẩm đang trong thời gian bảo hành theo quy định của từng dòng sản phẩm</p>
                  </div>
                </div>

                <div className={styles.conditionCard}>
                  <SafetyCertificateOutlined className={styles.conditionIcon} />
                  <div className={styles.conditionContent}>
                    <h3>Tài liệu xác thực</h3>
                    <p>Có đầy đủ hóa đơn điện tử và phiếu bảo hành điện tử của Techify</p>
                  </div>
                </div>

                <div className={styles.conditionCard}>
                  <SafetyCertificateOutlined className={styles.conditionIcon} />
                  <div className={styles.conditionContent}>
                    <h3>Tem bảo hành nguyên vẹn</h3>
                    <p>Sản phẩm còn nguyên tem bảo hành, số serial, mã IMEI không bị tháo mở</p>
                  </div>
                </div>

                <div className={styles.conditionCard}>
                  <SafetyCertificateOutlined className={styles.conditionIcon} />
                  <div className={styles.conditionContent}>
                    <h3>Lỗi từ nhà sản xuất</h3>
                    <p>Lỗi được xác nhận là do nhà sản xuất, không phải do tác động bên ngoài</p>
                  </div>
                </div>
              </div>

              <div className={styles.luxuryAlertBox}>
                <div className={styles.alertIconWrapper}>✦</div>
                <div className={styles.alertContent}>
                  <h4>Lưu ý đặc biệt</h4>
                  <ul className={styles.luxuryList}>
                    <li>Kiểm tra kỹ sản phẩm trước khi thanh toán để đảm bảo quyền lợi tối đa</li>
              <li>Giữ nguyên tem bảo hành, hộp sản phẩm trong suốt thời gian bảo hành</li>
                    <li>Sao lưu dữ liệu quan trọng trước khi gửi thiết bị để bảo hành</li>
                    <li>Đối với sản phẩm cao cấp, chỉ sử dụng phụ kiện chính hãng được khuyến nghị</li>
            </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Warranty Exclusions */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Các trường hợp ngoại lệ
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Để đảm bảo tính minh bạch trong chính sách bảo hành, chúng tôi liệt kê rõ các trường hợp không thuộc phạm vi bảo hành miễn phí:
              </p>

              <div className={styles.luxuryExclusionsWrapper}>
                <div className={styles.luxuryExclusionColumn}>
                  <ul className={styles.luxuryList}>
                    <li>Sản phẩm đã quá thời hạn bảo hành theo quy định</li>
                    <li>Tem, nhãn bảo hành, số serial, mã IMEI bị mờ, rách, tẩy xóa</li>
                    <li>Sản phẩm bị biến dạng, trầy xước, bể vỡ do tác động vật lý</li>
                    <li>Thiết bị có dấu hiệu tiếp xúc với chất lỏng, độ ẩm cao</li>
                  </ul>
                </div>
                <div className={styles.luxuryExclusionColumn}>
                  <ul className={styles.luxuryList}>
                    <li>Sản phẩm bị hư hỏng do thiên tai, hỏa hoạn, điện áp không ổn định</li>
                    <li>Sản phẩm có dấu hiệu sửa chữa bởi đơn vị không được ủy quyền</li>
                    <li>Lỗi phần mềm do người dùng cài đặt hoặc do virus</li>
                    <li>Sử dụng sai hướng dẫn của nhà sản xuất</li>
            </ul>
                </div>
              </div>

              <div className={styles.luxuryNoteBox}>
                <div className={styles.noteIconWrapper}>✦</div>
                <div className={styles.noteContent}>
                  <h4>Giải pháp thay thế</h4>
                  <p>Đối với các trường hợp không thuộc phạm vi bảo hành, Techify cung cấp dịch vụ sửa chữa với chi phí ưu đãi và cam kết sử dụng linh kiện chính hãng 100%. Khách hàng VIP được hưởng chính sách ưu đãi đặc biệt ngay cả khi sản phẩm không thuộc diện bảo hành miễn phí.</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Warranty Process */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Quy trình bảo hành tinh tế
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Techify đã xây dựng quy trình bảo hành chuyên nghiệp và hiệu quả, đảm bảo trải nghiệm tối ưu cho khách hàng:
              </p>

              <div className={styles.luxuryProcessSteps}>
                {warrantyProcess.map((desc, idx) => (
                  <div key={idx} className={styles.luxuryProcessStep}>
                    <div className={styles.processNumberWrapper}>
                      <span>{idx + 1}</span>
                    </div>
                    <div className={styles.processContent}>
                    <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.luxuryTimeframes}>
                <h3 className={styles.timeframesHeading}>Khung thời gian bảo hành tiêu chuẩn</h3>
                <div className={styles.timeframesGrid}>
                  <div className={styles.timeframeItem}>
                    <div className={styles.timeframeDuration}>3-5 ngày</div>
                    <div className={styles.timeframeDesc}>Đối với các lỗi nhỏ và thông thường</div>
                  </div>
                  <div className={styles.timeframeItem}>
                    <div className={styles.timeframeDuration}>5-7 ngày</div>
                    <div className={styles.timeframeDesc}>Đối với các lỗi phức tạp cần phân tích chuyên sâu</div>
                  </div>
                  <div className={styles.timeframeItem}>
                    <div className={styles.timeframeDuration}>7-15 ngày</div>
                    <div className={styles.timeframeDesc}>Đối với các trường hợp cần linh kiện đặc biệt</div>
                  </div>
                </div>
                <p className={styles.vipNote}>
                  <span className={styles.vipTag}>VIP</span> 
                  Khách hàng VIP và Elite được ưu tiên xử lý trong 24-48 giờ, kèm thiết bị thay thế tạm thời
                </p>
              </div>
            </div>
          </motion.section>

          {/* Premium Warranty Packages */}
          <motion.section className={styles.luxuryPackageSection} variants={itemVariants}>
            <div className={styles.packagePatternOverlay}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Gói bảo hành cao cấp
            </h2>
            <p className={styles.packageDescription}>
              Nâng tầm trải nghiệm sử dụng với các gói bảo hành cao cấp, được thiết kế riêng cho từng nhu cầu
            </p>

            <div className={styles.luxuryPackageGrid}>
              {warrantyPackages.map((pkg, index) => (
                <div key={pkg.id} className={styles.luxuryPackageCard}>
                  <div className={styles.packageDecor}></div>
                  <div className={styles.packageHeader}>
                    <h3>{pkg.title}</h3>
                    <span className={styles.packageBadge}>{index === 1 ? 'BEST SELLER' : index === 2 ? 'ULTIMATE' : 'POPULAR'}</span>
                  </div>
                  <p className={styles.packageDesc}>{pkg.description}</p>
                  <ul className={styles.packageBenefits}>
                    {pkg.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <span className={styles.benefitCheckmark}>✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className={styles.packageContactNote}>
              Để tìm hiểu thêm chi tiết về các gói bảo hành cao cấp và lựa chọn phù hợp nhất với nhu cầu của bạn, vui lòng liên hệ với chuyên viên tư vấn của Techify.
            </p>
          </motion.section>

          {/* Service Centers */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Trung tâm bảo hành cao cấp
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Mạng lưới trung tâm bảo hành của Techify được trang bị công nghệ tiên tiến cùng đội ngũ kỹ thuật viên được đào tạo và chứng nhận bởi các thương hiệu hàng đầu:
              </p>

              <div className={styles.luxuryServiceCenter}>
                <div className={styles.serviceCenterHeader}>
                  <div className={styles.serviceHeaderIcon}>
                    <EnvironmentOutlined />
                  </div>
                  <h3>Trung tâm bảo hành chính</h3>
                </div>
                <div className={styles.serviceCenterBody}>
                  <div className={styles.serviceCenterItem}>
                    <div className={styles.serviceCenterLabel}>Địa chỉ</div>
                    <div className={styles.serviceCenterValue}>Tầng 5, Tòa nhà Premier, 5 Đinh Tiên Hoàng, P.Lý Thái Tổ, Q.Hoàn Kiếm, Hà Nội</div>
                  </div>
                  <div className={styles.serviceCenterItem}>
                    <div className={styles.serviceCenterLabel}>Hotline bảo hành</div>
                    <div className={styles.serviceCenterValue}>1800 8899</div>
                  </div>
                  <div className={styles.serviceCenterItem}>
                    <div className={styles.serviceCenterLabel}>Email hỗ trợ</div>
                    <div className={styles.serviceCenterValue}>warranty@techify.asia</div>
                  </div>
                  <div className={styles.serviceCenterItem}>
                    <div className={styles.serviceCenterLabel}>Giờ làm việc</div>
                    <div className={styles.serviceCenterValue}>Thứ Hai - Thứ Bảy: 8:00 - 20:00, Chủ nhật: 9:00 - 18:00</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Support Section */}
          <motion.section className={styles.luxurySupportSection} variants={itemVariants}>
            <div className={styles.supportDecorLeft}></div>
            <div className={styles.supportDecorRight}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Hỗ trợ đặc quyền
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Đội ngũ chuyên viên kỹ thuật Techify luôn sẵn sàng hỗ trợ mọi vấn đề về sản phẩm của bạn
            </p>
            <div className={styles.luxuryContactInfo}>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Tư vấn kỹ thuật</h3>
                  <p>1800 7755</p>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Email hỗ trợ</h3>
                  <p>support@techify.asia</p>
                  <span>Phản hồi trong 2 giờ</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Hẹn lịch kiểm tra</h3>
                  <p>Đặt lịch online</p>
                  <span>Ưu tiên khách VIP</span>
                </div>
              </div>
            </div>
            <motion.button 
              className={styles.luxuryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              
            >
              <span className={styles.buttonText}>LIÊN HỆ CHÚNG TÔI</span>
              <span className={styles.buttonIcon}>→</span>
            </motion.button>
          </motion.section>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default WarrantyPolicy; 