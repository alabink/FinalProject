import React, { useEffect } from 'react';
import styles from './PaymentGuide.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import { motion } from 'framer-motion';
import { CreditCardOutlined, BankOutlined, DollarOutlined, SafetyOutlined, WalletOutlined } from '@ant-design/icons';

const PaymentGuide = () => {
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
    const particleContainer = document.getElementById('payment-particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('payment-particles-js', {
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

  // Payment methods data
  const paymentMethods = [
    {
      id: 'premium_card',
      title: 'Thẻ cao cấp quốc tế',
      description: 'Thanh toán bằng thẻ tín dụng và ghi nợ cao cấp từ các ngân hàng hàng đầu thế giới',
      icon: <CreditCardOutlined />
    },
    {
      id: 'bank_transfer',
      title: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản trực tiếp từ tài khoản ngân hàng của bạn đến tài khoản doanh nghiệp của Techify',
      icon: <BankOutlined />
    },
    {
      id: 'cash_delivery',
      title: 'Thanh toán khi nhận hàng',
      description: 'Trải nghiệm thanh toán linh hoạt với dịch vụ giao hàng cao cấp và kiểm tra sản phẩm tại nhà',
      icon: <DollarOutlined />
    },
    {
      id: 'digital_wallet',
      title: 'Ví điện tử cao cấp',
      description: 'Thanh toán nhanh chóng và bảo mật thông qua các nền tảng ví điện tử hàng đầu',
      icon: <WalletOutlined />
    }
  ];

  // Premium card options
  const premiumCards = [
    { name: 'Visa Infinite', description: 'Dành cho khách hàng thượng lưu' },
    { name: 'Mastercard World Elite', description: 'Đặc quyền toàn cầu' },
    { name: 'American Express Platinum', description: 'Trải nghiệm không giới hạn' },
    { name: 'JCB Ultimate', description: 'Thanh toán đẳng cấp' }
  ];

  return (
    <PageLayout title="Hướng dẫn thanh toán | Trải nghiệm thanh toán đẳng cấp">
      <div className={styles.paymentGuideContainer}>
        {/* Luxury Hero Section */}
        <div className={styles.luxuryHeroWrapper}>
          <div id="payment-particles-js" className={styles.particles}></div>
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
                <span className={styles.elegantText}>Hướng Dẫn Thanh Toán</span>
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Trải nghiệm thanh toán tinh tế</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Đa dạng phương thức thanh toán cao cấp, an toàn tuyệt đối cho giới thượng lưu
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
              Techify tự hào cung cấp hệ thống thanh toán đẳng cấp quốc tế với đa dạng phương thức, đảm bảo trải nghiệm mua sắm liền mạch và bảo mật tuyệt đối. Mỗi giao dịch đều được mã hóa bằng công nghệ tiên tiến nhất, mang đến sự an tâm tuyệt đối cho khách hàng thượng lưu.
            </p>
          </motion.section>
          
          {/* Payment Methods Grid */}
          <motion.section className={styles.luxuryMethodsGrid} variants={itemVariants}>
            {paymentMethods.map((method) => (
              <motion.div 
                key={method.id}
                className={styles.luxuryMethodCard}
                whileHover={{ y: -15, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className={styles.cardDecor}></div>
                <div className={styles.methodIconWrapper}>
                  <span className={styles.methodIcon}>{method.icon}</span>
                </div>
                <h3>{method.title}</h3>
                <p>{method.description}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* Credit Card Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Thẻ tín dụng & ghi nợ cao cấp
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Techify hợp tác với các tổ chức tài chính hàng đầu thế giới để mang đến trải nghiệm thanh toán thẻ tín dụng tinh tế và an toàn tuyệt đối. Mọi giao dịch đều được bảo mật theo tiêu chuẩn PCI DSS quốc tế với công nghệ mã hóa 256-bit.
              </p>
              
              <div className={styles.luxuryProcessSteps}>
                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>01</span></div>
                  <h4>Lựa chọn thanh toán bằng thẻ</h4>
                  <p>Tại bước thanh toán, chọn phương thức "Thẻ tín dụng/ghi nợ quốc tế" và chọn loại thẻ</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>02</span></div>
                  <h4>Nhập thông tin thẻ</h4>
                  <p>Điền thông tin thẻ của bạn vào cổng thanh toán bảo mật theo tiêu chuẩn quốc tế</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>03</span></div>
                  <h4>Xác thực thanh toán</h4>
                  <p>Hoàn tất giao dịch qua xác thực hai lớp (3D Secure) từ ngân hàng phát hành thẻ</p>
                </div>
              </div>

              <div className={styles.luxuryCardShowcase}>
                {premiumCards.map((card, index) => (
                  <div key={index} className={styles.premiumCardItem}>
                    <div className={styles.cardShine}></div>
                    <h4>{card.name}</h4>
                    <p>{card.description}</p>
              </div>
                ))}
              </div>

              <div className={styles.luxuryInfoBox}>
                <div className={styles.infoIconWrapper}>✦</div>
                <div className={styles.infoContent}>
                  <h4>Đặc quyền thanh toán</h4>
                  <p>Khách hàng sử dụng thẻ cao cấp Visa Infinite, Mastercard World Elite và American Express Platinum được hưởng ưu đãi đặc biệt: miễn phí vận chuyển toàn cầu, tích điểm gấp đôi, và chính sách bảo hành VIP.</p>
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* Bank Transfer Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Chuyển khoản ngân hàng
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Phương thức thanh toán chuyên nghiệp dành cho khách hàng doanh nghiệp và cá nhân ưa chuộng sự chủ động. Techify cung cấp tài khoản ngân hàng chuyên biệt với đội ngũ tài chính xác nhận giao dịch trong thời gian tối thiểu.
              </p>
              
              <div className={styles.luxuryProcessSteps}>
                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>01</span></div>
                  <h4>Chọn phương thức chuyển khoản</h4>
                  <p>Tại bước thanh toán, chọn "Chuyển khoản ngân hàng" và xem thông tin tài khoản</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>02</span></div>
                  <h4>Thực hiện chuyển khoản</h4>
                  <p>Sử dụng ứng dụng ngân hàng hoặc internet banking để chuyển khoản với nội dung đơn hàng</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>03</span></div>
                  <h4>Xác nhận giao dịch</h4>
                  <p>Hệ thống tự động xác nhận và kích hoạt đơn hàng ngay khi nhận được thanh toán</p>
                </div>
              </div>
              
              <div className={styles.luxuryBankAccount}>
                <div className={styles.bankAccountHeader}>
                  <div className={styles.bankLogoPlaceholder}>
                    <span>TECHIFY BANK</span>
              </div>
                  <div className={styles.bankDecor}></div>
                </div>
                <div className={styles.bankAccountDetails}>
                  <div className={styles.accountRow}>
                    <span className={styles.accountLabel}>Tên ngân hàng:</span>
                    <span className={styles.accountValue}>TECHIFY INTERNATIONAL BANK</span>
                  </div>
                  <div className={styles.accountRow}>
                    <span className={styles.accountLabel}>Số tài khoản:</span>
                    <span className={styles.accountValue}>8888 9999 7777</span>
                  </div>
                  <div className={styles.accountRow}>
                    <span className={styles.accountLabel}>Chủ tài khoản:</span>
                    <span className={styles.accountValue}>CÔNG TY CỔ PHẦN TECHIFY</span>
                  </div>
                  <div className={styles.accountRow}>
                    <span className={styles.accountLabel}>Nội dung:</span>
                    <span className={styles.accountValue}>[Mã đơn hàng] - [Họ tên]</span>
                  </div>
                  <div className={styles.accountRow}>
                    <span className={styles.accountLabel}>Swift Code:</span>
                    <span className={styles.accountValue}>TECHVNVX</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* Cash on Delivery Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Thanh toán khi nhận hàng
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Trải nghiệm thanh toán truyền thống được nâng tầm với dịch vụ giao hàng cao cấp của Techify. Đội ngũ giao hàng được tuyển chọn kỹ lưỡng, đào tạo chuyên nghiệp và trang bị đồng phục tinh tế, sẵn sàng mang đến trải nghiệm nhận hàng đẳng cấp tại địa điểm của bạn.
              </p>

              <div className={styles.luxuryProcessSteps}>
                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>01</span></div>
                  <h4>Chọn thanh toán khi nhận hàng</h4>
                  <p>Tại bước thanh toán, chọn phương thức "Thanh toán khi nhận hàng" (COD)</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>02</span></div>
                  <h4>Nhận thông báo giao hàng</h4>
                  <p>Được thông báo lịch giao hàng chính xác và theo dõi vị trí đơn hàng theo thời gian thực</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>03</span></div>
                  <h4>Kiểm tra và thanh toán</h4>
                  <p>Kiểm tra sản phẩm với nhân viên giao hàng trước khi thanh toán bằng tiền mặt hoặc quẹt thẻ</p>
                </div>
              </div>

              <div className={styles.luxuryInfoBox}>
                <div className={styles.infoIconWrapper}>✦</div>
                <div className={styles.infoContent}>
                  <h4>Dịch vụ giao hàng cao cấp</h4>
                  <p>Techify cung cấp dịch vụ giao hàng premium với nhân viên mặc đồng phục chuyên nghiệp, xe vận chuyển riêng và quy trình kiểm tra sản phẩm tiêu chuẩn. Đối với sản phẩm cao cấp, chúng tôi áp dụng dịch vụ "White Gloves" với găng tay trắng và quy trình bàn giao đặc biệt.</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* E-Wallet Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Ví điện tử cao cấp
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Thanh toán nhanh chóng và tiện lợi thông qua các nền tảng ví điện tử hàng đầu với tính năng bảo mật vượt trội. Techify tích hợp trực tiếp với các ví điện tử phổ biến để đảm bảo giao dịch diễn ra liền mạch và an toàn tuyệt đối.
              </p>

              <div className={styles.luxuryProcessSteps}>
                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>01</span></div>
                  <h4>Chọn ví điện tử</h4>
                  <p>Chọn phương thức thanh toán "Ví điện tử" và lựa chọn nhà cung cấp ví phù hợp</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>02</span></div>
                  <h4>Quét mã hoặc đăng nhập</h4>
                  <p>Quét mã QR hoặc đăng nhập vào tài khoản ví điện tử của bạn để xác nhận thanh toán</p>
                </div>

                <div className={styles.luxuryStep}>
                  <div className={styles.stepNumberWrapper}><span>03</span></div>
                  <h4>Xác nhận thanh toán</h4>
                  <p>Xác nhận giao dịch bằng mật khẩu, vân tay hoặc nhận diện khuôn mặt</p>
                </div>
              </div>

              <div className={styles.luxuryWalletGrid}>
                <div className={styles.walletOption}>
                  <div className={styles.walletLogo}><span>MoMo</span></div>
                  <p>Thanh toán nhanh chóng, tích hợp nhiều khuyến mãi độc quyền</p>
                </div>
                <div className={styles.walletOption}>
                  <div className={styles.walletLogo}><span>ZaloPay</span></div>
                  <p>Giao dịch an toàn với xác thực đa lớp, hoàn tiền hấp dẫn</p>
                </div>
                <div className={styles.walletOption}>
                  <div className={styles.walletLogo}><span>VNPay</span></div>
                  <p>Hệ sinh thái thanh toán toàn diện, liên kết với nhiều ngân hàng</p>
                </div>
                <div className={styles.walletOption}>
                  <div className={styles.walletLogo}><span>ShopeePay</span></div>
                  <p>Tích hợp ưu đãi mua sắm, tích lũy xu thưởng hấp dẫn</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Security Section */}
          <motion.section className={styles.luxurySecuritySection} variants={itemVariants}>
            <div className={styles.securityPatternOverlay}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Cam kết bảo mật tuyệt đối
            </h2>
            <div className={styles.luxurySecurityItems}>
                  <div className={styles.securityItem}>
                <div className={styles.securityIconWrapper}>
                  <SafetyOutlined className={styles.securityIcon} />
                </div>
                <h3>Mã hóa SSL 256-bit</h3>
                <p>Mọi giao dịch thanh toán đều được bảo vệ bằng công nghệ mã hóa SSL 256-bit tiêu chuẩn quốc tế</p>
                  </div>

                  <div className={styles.securityItem}>
                <div className={styles.securityIconWrapper}>
                  <SafetyOutlined className={styles.securityIcon} />
                </div>
                <h3>Chứng nhận PCI DSS</h3>
                <p>Tuân thủ nghiêm ngặt tiêu chuẩn bảo mật PCI DSS trong xử lý dữ liệu thẻ tín dụng</p>
                  </div>

                  <div className={styles.securityItem}>
                <div className={styles.securityIconWrapper}>
                  <SafetyOutlined className={styles.securityIcon} />
                </div>
                <h3>Xác thực đa yếu tố</h3>
                <p>Bảo vệ giao dịch với xác thực đa lớp thông qua mật khẩu, OTP và sinh trắc học</p>
                  </div>

                  <div className={styles.securityItem}>
                <div className={styles.securityIconWrapper}>
                  <SafetyOutlined className={styles.securityIcon} />
                </div>
                <h3>Giám sát giao dịch 24/7</h3>
                <p>Hệ thống giám sát giao dịch theo thời gian thực phát hiện và ngăn chặn gian lận</p>
              </div>
            </div>
          </motion.section>

          {/* Support Section */}
          <motion.section className={styles.luxurySupportSection} variants={itemVariants}>
            <div className={styles.supportDecorLeft}></div>
            <div className={styles.supportDecorRight}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Tư vấn thanh toán cao cấp
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Đội ngũ chuyên viên tư vấn tài chính của Techify luôn sẵn sàng hỗ trợ mọi thắc mắc về thanh toán và tài khoản của bạn
            </p>
            <div className={styles.luxuryContactInfo}>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Đường dây ưu tiên</h3>
                  <p>1800 9988</p>
                  <span>Phục vụ 24/7</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Email hỗ trợ</h3>
                  <p>payment@techify.asia</p>
                  <span>Phản hồi trong 2 giờ</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Hỗ trợ trực tuyến</h3>
                  <p>Live Chat</p>
                  <span>Tư vấn tài chính chuyên nghiệp</span>
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
          </motion.section>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PaymentGuide; 