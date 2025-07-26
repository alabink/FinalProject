import React, { useEffect } from 'react';
import styles from './ReturnPolicy.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import { motion } from 'framer-motion';
import { FaRedoAlt, FaExclamationTriangle, FaExchangeAlt, FaUndo, FaMoneyBillWave } from 'react-icons/fa';

const ReturnPolicy = () => {
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
    const particleContainer = document.getElementById('return-particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('return-particles-js', {
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

  // Data arrays
  const returnConditions = [
    {
      id: 'standard',
      title: 'Đổi trả tiêu chuẩn',
      desc: 'Sản phẩm được đổi trả trong vòng 7 ngày kể từ khi nhận hàng, áp dụng với các điều kiện:',
      list: [
        'Sản phẩm còn nguyên vẹn, đầy đủ tem nhãn và hộp sản phẩm',
        'Không có dấu hiệu đã qua sử dụng, không bị trầy xước',
        'Đầy đủ phụ kiện và quà tặng kèm theo (nếu có)',
        'Có hóa đơn mua hàng hoặc phiếu giao hàng từ Techify'
      ]
    },
    {
      id: 'premium',
      title: 'Đặc quyền Elite Member',
      desc: 'Đặc quyền dành riêng cho khách hàng VIP với các ưu đãi vượt trội:',
      list: [
        'Thời hạn đổi trả lên đến 30 ngày kể từ khi nhận hàng',
        'Hỗ trợ đổi trả tại nhà với dịch vụ concierge',
        'Miễn phí vận chuyển cho các sản phẩm đổi trả',
        'Ưu tiên xử lý trong vòng 24 giờ kể từ khi tiếp nhận'
      ]
    },
    {
      id: 'doa',
      title: 'Đổi trả do lỗi kỹ thuật',
      desc: 'Áp dụng khi sản phẩm gặp lỗi từ nhà sản xuất trong vòng 30 ngày đầu tiên:',
      list: [
        'Sản phẩm không hoạt động đúng chức năng được công bố',
        'Lỗi phần cứng được xác nhận bởi chuyên viên kỹ thuật Techify',
        'Sản phẩm không đúng với mô tả hoặc tiêu chuẩn chất lượng',
        'Thiếu phụ kiện hoặc linh kiện theo tiêu chuẩn nhà sản xuất'
      ]
    }
  ];

  const returnProcessSteps = [
    {
      title: 'Yêu cầu đổi trả',
      desc: 'Liên hệ Techify qua đường dây nóng VIP 1800 8899 hoặc email premium@techify.asia để khởi tạo yêu cầu đổi trả sản phẩm.'
    },
    {
      title: 'Xác minh thông tin',
      desc: 'Chuyên viên chăm sóc khách hàng sẽ tiếp nhận thông tin đơn hàng, lý do đổi trả và hướng dẫn quy trình chi tiết.'
    },
    {
      title: 'Kiểm tra sản phẩm',
      desc: 'Đội ngũ kỹ thuật cao cấp của Techify sẽ kiểm tra kỹ lưỡng sản phẩm để đánh giá tình trạng và xác nhận điều kiện đổi trả.'
    },
    {
      title: 'Xác nhận phương thức',
      desc: 'Dựa trên kết quả kiểm tra, Techify sẽ xác nhận phương thức đổi trả phù hợp: đổi sản phẩm mới cùng loại, đổi sang sản phẩm khác hoặc hoàn tiền.'
    },
    {
      title: 'Hoàn tất đổi trả',
      desc: 'Quy trình đổi trả được hoàn tất với sản phẩm mới được giao tận nơi hoặc hoàn tiền vào phương thức thanh toán ban đầu.'
    }
  ];

  const exclusionItems = [
    'Sản phẩm đã được cá nhân hóa theo yêu cầu khách hàng',
    'Sản phẩm đã bị can thiệp, sửa chữa bởi bên thứ ba không được ủy quyền',
    'Phần mềm, ứng dụng đã kích hoạt hoặc tải về',
    'Sản phẩm bị hư hỏng do sử dụng không đúng cách hoặc không tuân theo hướng dẫn',
    'Sản phẩm bị hư hỏng do tai nạn, rơi vỡ, va đập hoặc ngấm nước',
    'Các sản phẩm trong danh mục không được đổi trả như tai nghe đã mở seal, thẻ cào đã kích hoạt',
    'Sản phẩm đã quá thời hạn đổi trả theo quy định'
  ];

  const returnOptions = [
    {
      id: 'exchange',
      title: 'Đổi sản phẩm cùng loại',
      icon: <FaExchangeAlt />,
      content: 'Khách hàng sẽ nhận được sản phẩm mới, nguyên seal cùng model. Áp dụng khi sản phẩm bị lỗi từ nhà sản xuất trong thời gian bảo hành hoặc không đạt tiêu chuẩn chất lượng Techify.'
    },
    {
      id: 'different',
      title: 'Đổi sang sản phẩm khác',
      icon: <FaUndo />,
      content: 'Khách hàng có thể lựa chọn đổi sang sản phẩm khác có giá trị tương đương hoặc cao hơn (thanh toán phần chênh lệch nếu có). Áp dụng trong vòng 7 ngày với sản phẩm không lỗi, và 30 ngày với sản phẩm lỗi kỹ thuật.'
    },
    {
      id: 'refund',
      title: 'Hoàn tiền',
      icon: <FaMoneyBillWave />,
      content: 'Techify sẽ hoàn tiền 100% giá trị sản phẩm qua phương thức thanh toán ban đầu hoặc chuyển khoản ngân hàng. Thời gian hoàn tiền từ 3-7 ngày làm việc tùy theo phương thức thanh toán và ngân hàng.'
    }
  ];

  return (
    <PageLayout title="Chính sách đổi trả | Techify Premium Experience">
      <div className={styles.returnPolicyContainer}>
        {/* Luxury Hero Section */}
        <div className={styles.luxuryHeroWrapper}>
          <div id="return-particles-js" className={styles.particles}></div>
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
                <span className={styles.elegantText}>Chính Sách Đổi Trả</span>
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Tôn trọng sự lựa chọn hoàn hảo</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Trải nghiệm mua sắm đẳng cấp với chính sách đổi trả ưu việt, linh hoạt và tận tâm
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
              Tại Techify, chúng tôi hiểu rằng sự hài lòng tuyệt đối của khách hàng là ưu tiên hàng đầu. Chính sách đổi trả của chúng tôi được thiết kế riêng biệt nhằm đảm bảo mọi trải nghiệm mua sắm đều trọn vẹn và xứng đáng. Chúng tôi cam kết mang đến sự linh hoạt tối đa và quy trình xử lý tinh tế, giúp bạn an tâm với mọi quyết định mua sắm tại Techify.
            </p>
          </motion.section>
          
          {/* Return Conditions */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Điều kiện đổi trả đặc quyền
            </h2>
            <div className={styles.luxurySectionContent}>
              <div className={styles.luxuryConditionCards}>
                {returnConditions.map((condition, index) => (
                  <div key={condition.id} className={`${styles.luxuryConditionCard} ${styles[condition.id]}`}>
                    <div className={styles.conditionHeader}>
                      <div className={styles.conditionBadge}>{index === 1 ? 'VIP' : index === 2 ? 'PREMIUM' : 'TIÊU CHUẨN'}</div>
                      <h3>{condition.title}</h3>
                    </div>
                    <p>{condition.desc}</p>
                    <ul className={styles.luxuryConditionList}>
                      {condition.list.map((item, i) => (
                        <li key={i}>
                          <span className={styles.checkmark}>✦</span>
                          {item}
                        </li>
                      ))}
                  </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Return Process */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Quy trình đổi trả tinh tế
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Techify cam kết mang đến quy trình đổi trả nhanh chóng, minh bạch và chuyên nghiệp. Mỗi bước trong quy trình được thiết kế để đảm bảo trải nghiệm thuận tiện nhất cho khách hàng:
              </p>

              <div className={styles.luxuryProcessSteps}>
                {returnProcessSteps.map((step, idx) => (
                  <div key={idx} className={styles.luxuryProcessStep}>
                    <div className={styles.processNumberWrapper}>
                      <span>{idx + 1}</span>
                    </div>
                    <div className={styles.processContent}>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.luxuryTimelineNote}>
                <div className={styles.luxuryNoteIcon}>✦</div>
                <p>
                  <strong>Elite Members:</strong> Đối với khách hàng VIP, Techify cung cấp dịch vụ concierge đặc biệt hỗ trợ toàn bộ quy trình đổi trả, từ tiếp nhận yêu cầu đến giao nhận sản phẩm tận nơi, đảm bảo trải nghiệm đẳng cấp và thuận tiện tối đa.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Return Options */}
          <motion.section className={styles.luxuryReturnOptionsSection} variants={itemVariants}>
            <div className={styles.optionsPatternOverlay}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Phương thức đổi trả
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Techify mang đến đa dạng phương thức đổi trả, đáp ứng mọi nhu cầu của khách hàng
            </p>

            <div className={styles.luxuryReturnOptionCards}>
              {returnOptions.map((option) => (
                <div key={option.id} className={styles.luxuryOptionCard}>
                  <div className={styles.optionDecor}></div>
                  <div className={styles.optionIcon}>{option.icon}</div>
                  <h3>{option.title}</h3>
                  <p>{option.content}</p>
                </div>
              ))}
            </div>
          </motion.section>
          
          {/* Exclusions */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Các trường hợp ngoại lệ
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Để đảm bảo tính minh bạch và công bằng trong chính sách đổi trả, Techify không áp dụng đổi trả trong những trường hợp sau:
              </p>

              <div className={styles.luxuryExclusionWrapper}>
                <ul className={styles.luxuryExclusionList}>
                  {exclusionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
            </ul>
              </div>
          
              <div className={styles.luxuryAlertBox}>
                <div className={styles.alertIconWrapper}>✦</div>
                <div className={styles.alertContent}>
                  <h4>Lưu ý đặc biệt</h4>
                  <p>
                    Để đảm bảo quyền lợi tối đa, quý khách vui lòng kiểm tra kỹ sản phẩm ngay khi nhận hàng và giữ lại đầy đủ hóa đơn, hộp sản phẩm và phụ kiện đi kèm trong suốt thời gian đổi trả. Đối với sản phẩm giá trị cao, Techify khuyến nghị kích hoạt bảo hiểm sản phẩm để được bảo vệ toàn diện.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* Shipping Costs */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Chi phí đổi trả
            </h2>
            <div className={styles.luxurySectionContent}>
              <div className={styles.luxuryShippingCostGrid}>
                <div className={styles.luxuryShippingCostCard}>
                  <div className={styles.shippingCostHeader}>
                    <h3>Lỗi từ nhà sản xuất</h3>
                  </div>
                  <div className={styles.shippingCostBody}>
                    <p><span className={styles.costLabel}>Phí vận chuyển:</span> <span className={styles.costValue}>Miễn phí</span></p>
                    <p><span className={styles.costLabel}>Thời gian xử lý:</span> <span className={styles.costValue}>1-3 ngày làm việc</span></p>
                    <p><span className={styles.costLabel}>Phương thức vận chuyển:</span> <span className={styles.costValue}>Techify Express</span></p>
                  </div>
                </div>

                <div className={styles.luxuryShippingCostCard}>
                  <div className={styles.shippingCostHeader}>
                    <h3>Đổi trả theo nhu cầu</h3>
                  </div>
                  <div className={styles.shippingCostBody}>
                    <p><span className={styles.costLabel}>Phí vận chuyển:</span> <span className={styles.costValue}>Theo biểu phí chuẩn</span></p>
                    <p><span className={styles.costLabel}>Thời gian xử lý:</span> <span className={styles.costValue}>3-5 ngày làm việc</span></p>
                    <p><span className={styles.costLabel}>Phương thức vận chuyển:</span> <span className={styles.costValue}>Tiêu chuẩn</span></p>
                  </div>
                </div>

                <div className={styles.luxuryShippingCostCard}>
                  <div className={styles.shippingCostHeader}>
                    <h3>Dành cho Elite Member</h3>
                  </div>
                  <div className={styles.shippingCostBody}>
                    <p><span className={styles.costLabel}>Phí vận chuyển:</span> <span className={styles.costValue}>Miễn phí</span></p>
                    <p><span className={styles.costLabel}>Thời gian xử lý:</span> <span className={styles.costValue}>24 giờ</span></p>
                    <p><span className={styles.costLabel}>Phương thức vận chuyển:</span> <span className={styles.costValue}>Concierge Service</span></p>
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
              Hỗ trợ khách hàng
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Đội ngũ chăm sóc khách hàng đẳng cấp của Techify luôn sẵn sàng hỗ trợ mọi thắc mắc về chính sách đổi trả
            </p>
            <div className={styles.luxuryContactInfo}>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Đường dây nóng</h3>
                  <p>1800 8899</p>
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
                  <h3>Hỗ trợ trực tuyến</h3>
                  <p>Live Chat</p>
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

export default ReturnPolicy; 