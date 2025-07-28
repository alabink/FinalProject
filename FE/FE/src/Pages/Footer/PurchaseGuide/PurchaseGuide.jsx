import React, { useEffect } from 'react';
import styles from './PurchaseGuide.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import { motion } from 'framer-motion';
import { ShoppingOutlined, SearchOutlined, ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const PurchaseGuide = () => {
  // Animation variants with elegant timing
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
    const particleContainer = document.getElementById('purchase-particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('purchase-particles-js', {
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

  return (
    <PageLayout title="Hướng dẫn mua hàng | Quy trình đẳng cấp tại Techify">
      <div className={styles.purchaseGuideContainer}>
        {/* Elegant parallax hero section */}
        <div className={styles.luxuryHeroWrapper}>
          <div id="purchase-particles-js" className={styles.particles}></div>
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
                <span className={styles.elegantText}>Hướng Dẫn Mua Hàng</span>
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Trải nghiệm mua sắm đẳng cấp</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Quy trình tinh tế, cá nhân hóa và an toàn tại Techify
              </motion.p>
              
              <div className={styles.luxuryOrnament}></div>
          </div>
        </motion.div>
        </div>

        <motion.div
          className={styles.luxuryStepsContainer}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.luxuryStep} variants={itemVariants}>
            <div className={styles.stepDecor}></div>
            <div className={styles.stepNumberWrapper}>
            <div className={styles.stepNumber}>1</div>
            </div>
            <div className={styles.stepIcon}>
              <SearchOutlined />
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Tìm kiếm sản phẩm
              </h2>
              <p className={styles.luxuryParagraph}>
                Khám phá bộ sưu tập sản phẩm độc quyền của Techify thông qua các tùy chọn tìm kiếm cao cấp:
              </p>
              <ul className={styles.luxuryList}>
                <li>Sử dụng thanh tìm kiếm thông minh với gợi ý sản phẩm</li>
                <li>Duyệt qua bộ lọc danh mục chuyên biệt theo thương hiệu, tính năng và giá</li>
                <li>Trải nghiệm AI tư vấn sản phẩm dựa trên nhu cầu cá nhân</li>
                <li>Khám phá bộ sưu tập giới hạn và hàng mới về trên trang chủ</li>
              </ul>

              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <div className={styles.luxuryImage}>
                <div className={styles.imagePlaceholder}>
                    <span>Tìm kiếm sản phẩm cao cấp</span>
                  </div>
                </div>
              </div>

              <div className={styles.luxuryTipBox}>
                <div className={styles.tipIcon}>✦</div>
                <div className={styles.tipContent}>
                  <h4>Gợi ý tinh tế</h4>
                  <p>Sử dụng công cụ so sánh sản phẩm độc quyền của chúng tôi để đánh giá chi tiết các tính năng và đặc điểm kỹ thuật giữa các lựa chọn cao cấp.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.luxuryStep} variants={itemVariants}>
            <div className={styles.stepDecor}></div>
            <div className={styles.stepNumberWrapper}>
            <div className={styles.stepNumber}>2</div>
            </div>
            <div className={styles.stepIcon}>
              <ShoppingOutlined />
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Trải nghiệm chi tiết sản phẩm
              </h2>
              <p className={styles.luxuryParagraph}>
                Mỗi sản phẩm tại Techify đều được trình bày với sự chú trọng đặc biệt đến từng chi tiết:
              </p>
              <ul className={styles.luxuryList}>
                <li>Hình ảnh chất lượng cao với góc nhìn 360° và phóng to chi tiết</li>
                <li>Video trải nghiệm thực tế từ chuyên gia công nghệ</li>
                <li>Thông số kỹ thuật toàn diện với so sánh thị trường</li>
                <li>Đánh giá được xác thực từ khách hàng tinh hoa</li>
                <li>Tùy chọn cá nhân hóa và nâng cấp cao cấp</li>
              </ul>

              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <div className={styles.luxuryImage}>
                <div className={styles.imagePlaceholder}>
                    <span>Chi tiết sản phẩm đẳng cấp</span>
                  </div>
                </div>
              </div>

              <div className={styles.luxuryTipBox}>
                <div className={styles.tipIcon}>✦</div>
                <div className={styles.tipContent}>
                  <h4>Trải nghiệm cao cấp</h4>
                  <p>Đặt lịch tư vấn trực tiếp với chuyên gia công nghệ của chúng tôi để được hướng dẫn chi tiết về sản phẩm bạn quan tâm thông qua video call riêng tư.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.luxuryStep} variants={itemVariants}>
            <div className={styles.stepDecor}></div>
            <div className={styles.stepNumberWrapper}>
            <div className={styles.stepNumber}>3</div>
            </div>
            <div className={styles.stepIcon}>
              <ShoppingCartOutlined />
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Cá nhân hóa lựa chọn của bạn
              </h2>
              <p className={styles.luxuryParagraph}>
                Khi bạn đã tìm được sản phẩm hoàn hảo, hãy cá nhân hóa trải nghiệm mua sắm của mình:
              </p>
              <ul className={styles.luxuryList}>
                <li>Lựa chọn số lượng với tùy chọn giảm giá theo số lượng</li>
                <li>Tùy chỉnh cấu hình sản phẩm theo nhu cầu riêng biệt</li>
                <li>Bổ sung dịch vụ cao cấp: bảo hành mở rộng, cài đặt tận nơi</li>
                <li>Lựa chọn phụ kiện đi kèm được đề xuất tương thích</li>
                <li>Tùy chọn gói quà tặng cao cấp với thiệp cá nhân hóa</li>
              </ul>

              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <div className={styles.luxuryImage}>
                <div className={styles.imagePlaceholder}>
                    <span>Cá nhân hóa sản phẩm</span>
                  </div>
                </div>
              </div>

              <div className={styles.luxuryNoteBox}>
                <div className={styles.noteIcon}>✦</div>
                <div className={styles.noteContent}>
                  <p>Tất cả sản phẩm trong giỏ hàng của bạn đều được lưu trữ an toàn trong hệ thống. Đội ngũ tư vấn cao cấp của chúng tôi sẽ liên hệ để xác nhận chi tiết đơn hàng nếu bạn chưa hoàn tất thanh toán trong vòng 24 giờ.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.luxuryStep} variants={itemVariants}>
            <div className={styles.stepDecor}></div>
            <div className={styles.stepNumberWrapper}>
            <div className={styles.stepNumber}>4</div>
            </div>
            <div className={styles.stepIcon}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Xác nhận lựa chọn
              </h2>
              <p className={styles.luxuryParagraph}>
                Xem lại giỏ hàng cao cấp của bạn với đầy đủ thông tin chi tiết:
              </p>
              <ul className={styles.luxuryList}>
                <li>Tổng quan trực quan về các sản phẩm đã chọn</li>
                <li>Điều chỉnh số lượng và cấu hình dễ dàng</li>
                <li>Áp dụng mã ưu đãi độc quyền từ thành viên VIP</li>
                <li>Tính toán chi phí chi tiết bao gồm thuế và vận chuyển</li>
                <li>Xem ước tính thời gian giao hàng theo địa chỉ</li>
              </ul>

              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <div className={styles.luxuryImage}>
                <div className={styles.imagePlaceholder}>
                    <span>Xác nhận lựa chọn</span>
                  </div>
                </div>
              </div>

              <div className={styles.luxuryTipBox}>
                <div className={styles.tipIcon}>✦</div>
                <div className={styles.tipContent}>
                  <h4>Đặc quyền thành viên</h4>
                  <p>Thành viên VIP của Techify được hưởng các ưu đãi độc quyền như miễn phí vận chuyển, quà tặng kèm theo và quyền tiếp cận sớm các sản phẩm giới hạn.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.luxuryStep} variants={itemVariants}>
            <div className={styles.stepDecor}></div>
            <div className={styles.stepNumberWrapper}>
            <div className={styles.stepNumber}>5</div>
            </div>
            <div className={styles.stepIcon}>
              <CreditCardOutlined />
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Trải nghiệm thanh toán cao cấp
              </h2>
              <p className={styles.luxuryParagraph}>
                Quy trình thanh toán an toàn, bảo mật và tinh tế:
              </p>
              <ul className={styles.luxuryList}>
                <li>Đăng nhập bằng tài khoản hoặc tạo tài khoản VIP mới</li>
                <li>Xác nhận hoặc cập nhật thông tin giao hàng chính xác</li>
                <li>Lựa chọn phương thức vận chuyển với tùy chọn giao hàng ưu tiên</li>
                <li>Chọn phương thức thanh toán an toàn và đa dạng</li>
                <li>Xác nhận đơn hàng với bảo đảm giá trị và chất lượng</li>
              </ul>

              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <div className={styles.luxuryImage}>
                <div className={styles.imagePlaceholder}>
                    <span>Thanh toán an toàn</span>
                  </div>
                </div>
              </div>

              <div className={styles.luxuryPaymentMethods}>
                <h3>Phương thức thanh toán cao cấp</h3>
                <div className={styles.paymentOptions}>
                  <div className={styles.paymentOption}>
                    <div className={styles.optionIcon}>✦</div>
                    <div className={styles.optionName}>Thẻ cao cấp</div>
                    <p>Visa Infinite, World Elite, Centurion</p>
                  </div>
                  <div className={styles.paymentOption}>
                    <div className={styles.optionIcon}>✦</div>
                    <div className={styles.optionName}>Chuyển khoản</div>
                    <p>Xử lý nhanh chóng 24/7</p>
                  </div>
                  <div className={styles.paymentOption}>
                    <div className={styles.optionIcon}>✦</div>
                    <div className={styles.optionName}>Trả góp 0%</div>
                    <p>Đối tác ngân hàng hàng đầu</p>
                  </div>
                  <div className={styles.paymentOption}>
                    <div className={styles.optionIcon}>✦</div>
                    <div className={styles.optionName}>Thanh toán khi nhận</div>
                    <p>Với đội ngũ giao hàng riêng</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.luxuryStep} variants={itemVariants}>
            <div className={styles.stepDecor}></div>
            <div className={styles.stepNumberWrapper}>
            <div className={styles.stepNumber}>6</div>
            </div>
            <div className={styles.stepIcon}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                Dịch vụ sau bán hàng đẳng cấp
              </h2>
              <p className={styles.luxuryParagraph}>
                Trải nghiệm dịch vụ khách hàng vượt trội sau khi đặt hàng thành công:
              </p>
              <ul className={styles.luxuryList}>
                <li>Nhận email xác nhận đơn hàng thiết kế tinh tế với đầy đủ chi tiết</li>
                <li>Theo dõi đơn hàng theo thời gian thực với hệ thống GPS</li>
                <li>Nhận thông báo cá nhân hóa về trạng thái đơn hàng</li>
                <li>Tư vấn viên cao cấp liên hệ trực tiếp xác nhận chi tiết giao hàng</li>
                <li>Giao hàng tận nơi với đội ngũ chuyên nghiệp, trang phục đồng phục</li>
              </ul>

              <div className={styles.luxuryImageWrapper}>
                <div className={styles.imageAccent}></div>
                <div className={styles.luxuryCompleteImage}>
                <div className={styles.imagePlaceholder}>
                    <span>Dịch vụ sau bán hàng</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.luxurySupportSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className={styles.supportDecorLeft}></div>
          <div className={styles.supportDecorRight}></div>
          <h2 className={styles.luxuryHeadingCentered}>
            <span className={styles.luxuryAccentCenter}></span>
            Đội ngũ tư vấn cao cấp
          </h2>
          <p className={styles.luxuryDescriptionCentered}>
            Dịch vụ khách hàng được cá nhân hóa với đội ngũ tư vấn viên tinh hoa, sẵn sàng hỗ trợ mọi nhu cầu của bạn
          </p>
          <div className={styles.luxuryContactInfo}>
            <div className={styles.luxuryContactItem}>
              <div className={styles.contactIcon}>✦</div>
              <div className={styles.contactText}>
                <h3>Đường dây ưu tiên</h3>
                <p>1800 8899</p>
                <span>Phục vụ 24/7</span>
              </div>
            </div>
            <div className={styles.luxuryContactItem}>
              <div className={styles.contactIcon}>✦</div>
              <div className={styles.contactText}>
                <h3>Email VIP</h3>
                <p>vip@techify.asia</p>
                <span>Phản hồi trong 2 giờ</span>
              </div>
            </div>
            <div className={styles.luxuryContactItem}>
              <div className={styles.contactIcon}>✦</div>
              <div className={styles.contactText}>
                <h3>Tư vấn riêng</h3>
                <p>Đặt lịch hẹn</p>
                <span>Trực tiếp hoặc video call</span>
              </div>
            </div>
          </div>
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
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PurchaseGuide; 