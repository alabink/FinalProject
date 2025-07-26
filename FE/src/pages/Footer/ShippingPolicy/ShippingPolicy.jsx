import React, { useEffect } from 'react';
import styles from './ShippingPolicy.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import { motion } from 'framer-motion';
import { FaCity, FaRoad, FaGlobeAsia, FaTruck, FaBolt, FaCalendarAlt, FaBoxOpen, FaShippingFast, FaMapMarkedAlt } from 'react-icons/fa';

const ShippingPolicy = () => {
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
    const particleContainer = document.getElementById('shipping-particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('shipping-particles-js', {
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

  // Data arrays with icons
  const deliveryZones = [
    {
      id: 'urban',
      title: 'Khu vực nội thành',
      icon: <FaCity />,
      description: 'Phục vụ tất cả các quận nội thành của Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Hải Phòng và Cần Thơ với dịch vụ giao hàng siêu tốc.',
      services: [
        {
          name: 'Luxury Express',
          time: '2-4 giờ',
          price: 'Miễn phí (Đơn hàng từ 5 triệu đồng)',
        },
        {
          name: 'Giao hàng nhanh',
          time: '12-24 giờ',
          price: 'Miễn phí (Đơn hàng từ 2 triệu đồng)',
        },
        {
          name: 'Giao hàng tiêu chuẩn',
          time: '24-48 giờ',
          price: 'Miễn phí (Mọi đơn hàng)',
        }
      ]
    },
    {
      id: 'suburban',
      title: 'Khu vực ngoại thành & lân cận',
      icon: <FaRoad />,
      description: 'Phục vụ tất cả các khu vực ngoại thành và các tỉnh lân cận của thành phố lớn với dịch vụ giao hàng ưu tiên.',
      services: [
        {
          name: 'Giao hàng nhanh',
          time: '24-48 giờ',
          price: 'Miễn phí (Đơn hàng từ 3 triệu đồng)',
        },
        {
          name: 'Giao hàng tiêu chuẩn',
          time: '2-3 ngày',
          price: 'Miễn phí (Đơn hàng từ 1 triệu đồng)',
        }
      ]
    },
    {
      id: 'province',
      title: 'Khu vực tỉnh thành khác',
      icon: <FaGlobeAsia />,
      description: 'Phục vụ tất cả 63 tỉnh thành trên toàn quốc với cam kết thời gian giao hàng chính xác.',
      services: [
        {
          name: 'Giao hàng ưu tiên',
          time: '3-4 ngày',
          price: 'Miễn phí (Đơn hàng từ 5 triệu đồng)',
        },
        {
          name: 'Giao hàng tiêu chuẩn',
          time: '5-7 ngày',
          price: 'Miễn phí (Đơn hàng từ 2 triệu đồng)',
        }
      ]
    }
  ];

  const deliveryTypes = [
    {
      id: 'standard',
      title: 'Giao hàng tiêu chuẩn',
      icon: <FaTruck />,
      features: [
        'Giao hàng trong giờ hành chính: 8:00 - 18:00',
        'Áp dụng cho tất cả các đơn hàng',
        'Dịch vụ kiểm tra hàng khi nhận',
        'Giao hàng tận nơi theo địa chỉ khách hàng cung cấp'
      ]
    },
    {
      id: 'express',
      title: 'Giao hàng nhanh',
      icon: <FaBolt />,
      features: [
        'Giao hàng trong vòng 2-24 giờ (tùy khu vực)',
        'Chỉ áp dụng cho khu vực nội thành và một số khu vực lân cận',
        'Ưu tiên xử lý đơn hàng ngay lập tức',
        'Dịch vụ giao hàng 7 ngày trong tuần'
      ]
    },
    {
      id: 'scheduled',
      title: 'Giao hàng theo lịch hẹn',
      icon: <FaCalendarAlt />,
      features: [
        'Khách hàng có thể chọn ngày và khung giờ giao hàng chính xác',
        'Dịch vụ thông báo trước 30 phút khi giao hàng',
        'Linh hoạt thay đổi lịch hẹn trước 4 giờ',
        'Dịch vụ giao hàng sau giờ hành chính (18:00 - 21:00)'
      ]
    },
    {
      id: 'white-glove',
      title: 'Dịch vụ White Glove',
      icon: <FaShippingFast />,
      features: [
        'Dịch vụ trải nghiệm sản phẩm tại nhà',
        'Tư vấn sử dụng sản phẩm trực tiếp',
        'Hỗ trợ thiết lập và cài đặt sản phẩm',
        'Đóng gói và xử lý bao bì sau khi hoàn tất'
      ]
    }
  ];

  const processSteps = [
    {
      icon: <FaBoxOpen />,
      title: 'Xử lý đơn hàng',
      description: 'Sau khi đặt hàng thành công, đơn hàng của bạn sẽ được kiểm tra và xác nhận trong vòng 30 phút. Sản phẩm được đóng gói cẩn thận, đảm bảo an toàn tuyệt đối.'
    },
    {
      icon: <FaMapMarkedAlt />,
      title: 'Lên kế hoạch vận chuyển',
      description: 'Đội ngũ hậu cần sẽ lên lịch giao hàng chi tiết và chọn phương thức vận chuyển tối ưu nhất dựa trên vị trí và yêu cầu của khách hàng.'
    },
    {
      icon: <FaShippingFast />,
      title: 'Vận chuyển & Theo dõi',
      description: 'Đơn hàng được vận chuyển bởi đội ngũ giao hàng chuyên nghiệp với hệ thống theo dõi thời gian thực. Bạn sẽ nhận được thông báo cập nhật tại mỗi điểm giao nhận.'
    },
    {
      icon: <FaTruck />,
      title: 'Giao hàng',
      description: 'Nhân viên giao hàng sẽ liên hệ trước khi đến, hỗ trợ kiểm tra sản phẩm và hoàn tất quá trình giao nhận. Đảm bảo trải nghiệm giao hàng hoàn hảo.'
    }
  ];

  return (
    <PageLayout title="Chính sách vận chuyển | Techify Premium Delivery">
      <div className={styles.shippingPolicyContainer}>
        {/* Luxury Hero Section */}
        <div className={styles.luxuryHeroWrapper}>
          <div id="shipping-particles-js" className={styles.particles}></div>
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
                <span className={styles.elegantText}>Chính Sách Vận Chuyển</span>
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Đẳng cấp trong từng hành trình</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Trải nghiệm dịch vụ giao hàng cao cấp, an toàn và chính xác đến từng chi tiết
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
              Tại Techify, chúng tôi hiểu rằng hành trình sản phẩm đến tay bạn là một phần quan trọng trong trải nghiệm mua sắm. Chính sách vận chuyển của chúng tôi được thiết kế nhằm đảm bảo mỗi sản phẩm đều được giao đến tận tay khách hàng một cách nhanh chóng, an toàn và đẳng cấp. Với đội ngũ chuyên nghiệp cùng quy trình được chuẩn hóa, chúng tôi cam kết mang đến dịch vụ vận chuyển vượt trội xứng tầm với những sản phẩm công nghệ cao cấp mà bạn lựa chọn.
            </p>
          </motion.section>

          {/* Phạm vi giao hàng */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Phạm vi giao hàng
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Techify tự hào cung cấp dịch vụ vận chuyển toàn diện đến tất cả 63 tỉnh thành trên khắp Việt Nam. Với mạng lưới đối tác logistics rộng khắp và đội ngũ vận chuyển riêng tại các thành phố lớn, chúng tôi cam kết đảm bảo sản phẩm đến tay bạn trong thời gian ngắn nhất và với trải nghiệm giao nhận đẳng cấp.
              </p>

              <div className={styles.luxuryZoneGrid}>
                {deliveryZones.map((zone) => (
                  <div key={zone.id} className={`${styles.luxuryZoneCard} ${styles[zone.id]}`}>
                    <div className={styles.zoneIcon}>{zone.icon}</div>
                    <h3>{zone.title}</h3>
                    <p>{zone.description}</p>
                    <div className={styles.zoneServices}>
                      {zone.services.map((service, idx) => (
                        <div key={idx} className={styles.serviceItem}>
                          <div className={styles.serviceName}>{service.name}</div>
                          <div className={styles.serviceDetails}>
                            <span className={styles.serviceTime}>{service.time}</span>
                            <span className={styles.servicePrice}>{service.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

              <div className={styles.luxuryNoteBox}>
                <div className={styles.noteIconWrapper}>✦</div>
                <div className={styles.noteContent}>
                  <h4>Ghi chú đặc biệt</h4>
                  <p>
                    Thời gian giao hàng có thể thay đổi tùy thuộc vào điều kiện thời tiết và các yếu tố khách quan khác. Trong trường hợp này, đội ngũ chăm sóc khách hàng của Techify sẽ chủ động thông báo và hỗ trợ khách hàng để đảm bảo trải nghiệm mua sắm tốt nhất.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Phương thức vận chuyển */}
          <motion.section className={styles.luxuryDeliverySection} variants={itemVariants}>
            <div className={styles.deliveryPatternOverlay}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Phương thức vận chuyển
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Techify cung cấp đa dạng phương thức vận chuyển, đáp ứng mọi nhu cầu và mong muốn của khách hàng
            </p>

            <div className={styles.luxuryDeliveryGrid}>
              {deliveryTypes.map((type) => (
                <div key={type.id} className={styles.luxuryDeliveryCard}>
                  <div className={styles.deliveryDecor}></div>
                  <div className={styles.deliveryIcon}>{type.icon}</div>
                  <h3>{type.title}</h3>
                  <ul className={styles.deliveryFeatures}>
                    {type.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className={styles.featureCheckmark}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Phí vận chuyển */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Phí vận chuyển
            </h2>
            <div className={styles.luxurySectionContent}>
              <div className={styles.luxuryShippingFee}>
                <div className={styles.feeTableWrapper}>
                  <table className={styles.feeTable}>
                    <thead>
                      <tr>
                        <th>Giá trị đơn hàng</th>
                        <th>Nội thành</th>
                        <th>Ngoại thành & lân cận</th>
                        <th>Tỉnh thành khác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Dưới 1 triệu đồng</td>
                        <td>Miễn phí</td>
                        <td>30.000đ</td>
                        <td>50.000đ</td>
                      </tr>
                      <tr>
                        <td>Từ 1 - 2 triệu đồng</td>
                        <td>Miễn phí</td>
                        <td>Miễn phí</td>
                        <td>30.000đ</td>
                      </tr>
                      <tr>
                        <td>Từ 2 - 5 triệu đồng</td>
                        <td>Miễn phí</td>
                        <td>Miễn phí</td>
                        <td>Miễn phí</td>
                      </tr>
                      <tr>
                        <td>Trên 5 triệu đồng</td>
                        <td colSpan="3" className={styles.highlightCell}>Miễn phí toàn quốc - Giao hàng ưu tiên</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.luxuryShippingNotes}>
                <div className={styles.notesHeader}>
                  <h3>Ghi chú về phí vận chuyển</h3>
                </div>
                <ul className={styles.luxuryNotesList}>
                  <li>
                    <span className={styles.noteIcon}>✦</span>
                    <span className={styles.noteText}>Phí vận chuyển có thể thay đổi nếu đơn hàng có sản phẩm kích thước lớn hoặc cần vận chuyển đặc biệt.</span>
                  </li>
                  <li>
                    <span className={styles.noteIcon}>✦</span>
                    <span className={styles.noteText}>Với dịch vụ White Glove, phụ thu thêm 100.000đ cho khu vực nội thành và 200.000đ cho khu vực khác.</span>
                  </li>
                  <li>
                    <span className={styles.noteIcon}>✦</span>
                    <span className={styles.noteText}>Khách hàng VIP được miễn phí toàn bộ chi phí vận chuyển và được nâng cấp lên dịch vụ giao hàng ưu tiên.</span>
                  </li>
                  <li>
                    <span className={styles.noteIcon}>✦</span>
                    <span className={styles.noteText}>Phí vận chuyển chính xác sẽ được hiển thị trong quá trình thanh toán dựa trên địa chỉ giao hàng và sản phẩm.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Quy trình giao nhận */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Quy trình giao nhận
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Techify áp dụng quy trình giao nhận tiêu chuẩn quốc tế nhằm đảm bảo trải nghiệm khách hàng tối ưu từ lúc đặt hàng đến khi nhận được sản phẩm:
              </p>

              <div className={styles.luxuryProcessFlow}>
                {processSteps.map((step, idx) => (
                  <div key={idx} className={styles.processStep}>
                    <div className={styles.processNumber}>
                      <span>{idx + 1}</span>
                    </div>
                    <div className={styles.processIcon}>{step.icon}</div>
                    <div className={styles.processContent}>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.luxuryHighlightBox}>
                <h3>Cam kết chất lượng dịch vụ</h3>
                <p>
                  Techify cam kết mang đến trải nghiệm giao hàng hoàn hảo với chính sách "Đúng hẹn hoặc hoàn tiền". Nếu đơn hàng của bạn không được giao đúng thời hạn cam kết (trừ trường hợp bất khả kháng), chúng tôi sẽ hoàn lại phí vận chuyển và tặng voucher 200.000đ cho đơn hàng tiếp theo.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Theo dõi đơn hàng */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Theo dõi đơn hàng
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Hệ thống theo dõi đơn hàng tiên tiến của Techify cho phép khách hàng dễ dàng cập nhật tình trạng sản phẩm mọi lúc, mọi nơi:
              </p>

              <div className={styles.luxuryTrackingOptions}>
                <div className={styles.trackingOption}>
                  <div className={styles.trackingIcon}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 7V12L15 15" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Theo dõi thời gian thực</h3>
                  <p>Cập nhật vị trí đơn hàng theo thời gian thực với công nghệ GPS tiên tiến. Xem chính xác vị trí của sản phẩm và thời gian giao hàng dự kiến.</p>
                </div>

                <div className={styles.trackingOption}>
                  <div className={styles.trackingIcon}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8V6C16 4.93913 15.5786 3.92172 14.8284 3.17157C14.0783 2.42143 13.0609 2 12 2C10.9391 2 9.92172 2.42143 9.17157 3.17157C8.42143 3.92172 8 4.93913 8 6V8M3 11V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V11H3Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11V8C7 6.67392 7.52678 5.40215 8.46447 4.46447C9.40215 3.52678 10.6739 3 12 3C13.3261 3 14.5979 3.52678 15.5355 4.46447C16.4732 5.40215 17 6.67392 17 8V11" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Thông báo tự động</h3>
                  <p>Nhận thông báo qua SMS, email hoặc ứng dụng về mọi cập nhật trạng thái đơn hàng. Được thông báo trước 30 phút khi shipper đến giao hàng.</p>
                </div>

                <div className={styles.trackingOption}>
                  <div className={styles.trackingIcon}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Quản lý đơn hàng</h3>
                  <p>Truy cập trang quản lý đơn hàng cá nhân để xem lịch sử, trạng thái và chi tiết giao hàng. Dễ dàng liên hệ với nhân viên giao hàng khi cần thiết.</p>
                </div>
              </div>

              <div className={styles.trackingCTA}>
                <p>Theo dõi đơn hàng của bạn bằng cách đăng nhập vào tài khoản hoặc truy cập trang theo dõi đơn hàng với mã đơn hàng và số điện thoại.</p>
                <div className={styles.trackingButtons}>
                  <motion.button 
                    className={`${styles.trackingButton} ${styles.primary}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    
                  >
                    Đăng nhập để theo dõi
                  </motion.button>
                  <motion.button 
                    className={`${styles.trackingButton} ${styles.secondary}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    
                  >
                    Theo dõi không cần đăng nhập
                  </motion.button>
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
              Hỗ trợ khách hàng
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Đội ngũ chuyên viên hỗ trợ vận chuyển của Techify luôn sẵn sàng phục vụ mọi yêu cầu của bạn
            </p>
            <div className={styles.luxuryContactInfo}>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Hotline vận chuyển</h3>
                  <p>1800 9988</p>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Email hỗ trợ</h3>
                  <p>delivery@techify.asia</p>
                  <span>Phản hồi trong 2 giờ</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Chat trực tuyến</h3>
                  <p>Delivery Support</p>
                  <span>Trực tuyến 24/7</span>
                </div>
              </div>
            </div>
            <motion.button 
              className={styles.luxuryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => window.location.href = '/contact'}
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

export default ShippingPolicy; 