import React, { useEffect } from 'react';
import styles from './PrivacyPolicy.module.scss';
import PageLayout from '../../../Components/PageLayout/PageLayout';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserLock, FaFileAlt, FaCookieBite, FaUserShield } from 'react-icons/fa';

const PrivacyPolicy = () => {
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
    const particleContainer = document.getElementById('privacy-particles-js');
    if (particleContainer && window.particlesJS) {
      window.particlesJS('privacy-particles-js', {
        particles: {
          number: { value: 50, density: { enable: true, value_area: 800 } },
          color: { value: "#d4af37" },
          opacity: { value: 0.3, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, color: "#d4af37", opacity: 0.2 }
        }
      });
    }
  }, []);

  // Data for privacy sections
  const privacySections = [
    {
      id: "collection",
      title: "Thông tin chúng tôi thu thập",
      icon: <FaFileAlt />,
      content: (
        <>
          <div className={styles.luxurySectionContent}>
            <div className={styles.sectionSubHeading}>
              <span className={styles.sectionAccent}></span>
              <h3>Thông tin cá nhân</h3>
          </div>
            <p className={styles.luxuryParagraph}>
              Khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi, chúng tôi có thể thu thập các thông tin sau để đảm bảo trải nghiệm tối ưu và phù hợp nhất:
            </p>
            <ul className={styles.luxuryList}>
                    <li>Họ tên</li>
                    <li>Địa chỉ email</li>
                    <li>Số điện thoại</li>
                    <li>Địa chỉ giao hàng/thanh toán</li>
              <li>Thông tin thanh toán (được mã hóa và bảo mật)</li>
                    <li>Ngày sinh (nếu cung cấp)</li>
                    <li>Các thông tin khác bạn tự nguyện cung cấp</li>
                  </ul>

            <div className={styles.sectionSubHeading}>
              <span className={styles.sectionAccent}></span>
              <h3>Thông tin tự động</h3>
            </div>
            <p className={styles.luxuryParagraph}>
              Chúng tôi tự động thu thập một số thông tin khi bạn truy cập trang web nhằm cung cấp trải nghiệm đồng nhất và cá nhân hóa:
            </p>
            <ul className={styles.luxuryList}>
                    <li>Địa chỉ IP và thông tin thiết bị</li>
                    <li>Trình duyệt web và hệ điều hành</li>
                    <li>Dữ liệu nhật ký (log data)</li>
                    <li>Cookie và công nghệ theo dõi tương tự</li>
                    <li>Hành vi duyệt web và tương tác trên trang</li>
                    <li>Lịch sử tìm kiếm và mua hàng</li>
                  </ul>
          </div>
                </>
              )
            },
            {
      id: "purpose",
      title: "Mục đích sử dụng thông tin",
      icon: <FaCookieBite />,
              content: (
                <>
          <div className={styles.luxurySectionContent}>
            <p className={styles.luxuryParagraph}>
              Techify cam kết chỉ sử dụng thông tin cá nhân của bạn cho các mục đích cụ thể, đồng thời đảm bảo quyền lợi và trải nghiệm tốt nhất:
            </p>
            <ul className={styles.luxuryList}>
                    <li>Xử lý và giao hàng cho đơn hàng của bạn</li>
              <li>Cung cấp hỗ trợ khách hàng chuyên nghiệp và kịp thời</li>
              <li>Quản lý tài khoản và đảm bảo bảo mật thông tin</li>
                    <li>Gửi thông báo quan trọng về tài khoản hoặc đơn hàng</li>
                    <li>Gửi thông tin tiếp thị và quảng cáo (nếu bạn đồng ý)</li>
              <li>Cải thiện trải nghiệm người dùng và hoàn thiện sản phẩm/dịch vụ</li>
              <li>Phân tích xu hướng và thống kê để phục vụ bạn tốt hơn</li>
              <li>Phát hiện và ngăn chặn gian lận, đảm bảo an toàn giao dịch</li>
              <li>Tuân thủ nghĩa vụ pháp lý và quy định của pháp luật</li>
                  </ul>
            <div className={styles.luxuryNoteBox}>
              <div className={styles.noteIconWrapper}>✦</div>
              <div className={styles.noteContent}>
                <h4>Cam kết bảo mật</h4>
                <p>
                  Chúng tôi cam kết không bán, trao đổi hay chuyển giao thông tin cá nhân của bạn cho bên thứ ba nào mà không có sự đồng ý rõ ràng từ bạn, trừ khi cần thiết để cung cấp các dịch vụ bạn yêu cầu hoặc theo yêu cầu của pháp luật.
                </p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: "protection",
      title: "Bảo vệ thông tin",
      icon: <FaShieldAlt />,
      content: (
        <>
          <div className={styles.luxurySectionContent}>
            <p className={styles.luxuryParagraph}>
              Techify áp dụng nhiều biện pháp bảo mật tiên tiến nhằm đảm bảo an toàn tuyệt đối cho thông tin cá nhân của bạn:
            </p>
            <div className={styles.luxurySecurityGrid}>
              <div className={styles.securityItem}>
                <div className={styles.securityIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 12H18" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V2" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22V18" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 12H2" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Mã hóa SSL</h4>
                <p>Toàn bộ dữ liệu được mã hóa 256-bit SSL trong quá trình truyền tải</p>
              </div>
              <div className={styles.securityItem}>
                <div className={styles.securityIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.2399 7.76001L14.1199 14.12L7.75991 16.24L9.87991 9.88001L16.2399 7.76001Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Cơ sở dữ liệu bảo mật</h4>
                <p>Hệ thống máy chủ an toàn với nhiều lớp bảo vệ và kiểm soát truy cập</p>
              </div>
              <div className={styles.securityItem}>
                <div className={styles.securityIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11V15" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Xác thực đa yếu tố</h4>
                <p>Thêm một lớp bảo mật cho tài khoản người dùng và giao dịch quan trọng</p>
              </div>
              <div className={styles.securityItem}>
                <div className={styles.securityIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H8" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11V17" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 14H15" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Giám sát liên tục</h4>
                <p>Hệ thống theo dõi và phát hiện bất thường 24/7/365</p>
              </div>
            </div>
            <div className={styles.luxuryHighlightBox}>
              <h4>Đánh giá bảo mật thường xuyên</h4>
              <p>
                Chúng tôi tiến hành đánh giá bảo mật và thử nghiệm xâm nhập định kỳ do các chuyên gia bảo mật hàng đầu thực hiện, đảm bảo hệ thống luôn được cập nhật và bảo vệ trước các mối đe dọa mới nhất.
              </p>
            </div>
          </div>
                </>
              )
            }
  ];

  // Data for user rights cards
  const userRights = [
    {
      icon: <FaUserLock />,
      title: "Quyền truy cập",
      description: "Bạn có thể yêu cầu truy cập vào thông tin cá nhân mà Techify đang lưu giữ thông qua trang cài đặt tài khoản hoặc liên hệ trực tiếp với đội ngũ bảo mật của chúng tôi."
    },
    {
      icon: <FaFileAlt />,
      title: "Quyền chỉnh sửa",
      description: "Bạn có toàn quyền yêu cầu cập nhật hoặc sửa đổi bất kỳ thông tin cá nhân nào không chính xác thông qua hệ thống quản lý tài khoản của chúng tôi."
    },
    {
      icon: <FaUserShield />,
      title: "Quyền xóa",
      description: "Trong một số trường hợp, bạn có thể yêu cầu xóa thông tin cá nhân của mình (tuân theo các nghĩa vụ pháp lý và quyền lợi chính đáng của chúng tôi)."
    },
    {
      icon: <FaShieldAlt />,
      title: "Quyền phản đối",
      description: "Bạn có quyền phản đối việc xử lý dữ liệu cá nhân vì mục đích tiếp thị hoặc dựa trên các lợi ích hợp pháp của chúng tôi."
    }
  ];

  // Data lifecycle steps
  const lifecycleSteps = [
    {
      title: "Thu thập",
      content: "Thu thập dữ liệu thông qua các kênh tương tác và giao dịch, đảm bảo tính minh bạch và sự đồng thuận."
    },
    {
      title: "Lưu trữ",
      content: "Dữ liệu được mã hóa và lưu trữ an toàn trên các máy chủ được bảo mật cao cấp, với nhiều lớp bảo vệ."
    },
    {
      title: "Sử dụng",
      content: "Thông tin được sử dụng có chọn lọc cho các mục đích đã được khai báo và chỉ bởi nhân viên được ủy quyền."
    },
    {
      title: "Bảo vệ",
      content: "Áp dụng các biện pháp kỹ thuật và tổ chức toàn diện để ngăn chặn truy cập trái phép và vi phạm dữ liệu."
    },
    {
      title: "Tiêu hủy",
      content: "Dữ liệu được xóa hoặc ẩn danh khi không còn cần thiết, tuân theo chính sách lưu giữ dữ liệu nghiêm ngặt."
    }
  ];

  return (
    <PageLayout title="Chính sách bảo mật | Techify Elite Security">
      <div className={styles.privacyPolicyContainer}>
        {/* Luxury Hero Section */}
        <div className={styles.luxuryHeroWrapper}>
          <div id="privacy-particles-js" className={styles.particles}></div>
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
                <span className={styles.elegantText}>Chính Sách Bảo Mật</span>
                <span className={styles.luxuryDivider}></span>
                <span className={styles.luxuryTagline}>Bảo vệ quyền riêng tư đẳng cấp</span>
              </motion.h1>
              
              <motion.p 
                className={styles.luxuryDescription}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              >
                Cam kết bảo vệ thông tin cá nhân với chuẩn mực bảo mật cao nhất
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
              Tại Techify, sự riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Chính sách bảo mật này thể hiện cam kết vững chắc của chúng tôi trong việc bảo vệ thông tin cá nhân với tiêu chuẩn cao nhất. Chúng tôi áp dụng các biện pháp bảo mật tiên tiến và quy trình nghiêm ngặt để đảm bảo dữ liệu của bạn luôn được bảo vệ tối đa. Bằng việc sử dụng dịch vụ của Techify, bạn tin tưởng chúng tôi với thông tin của mình - một trách nhiệm mà chúng tôi không bao giờ coi nhẹ.
            </p>
          </motion.section>

          {/* Privacy sections */}
          {privacySections.map((section) => (
            <motion.section key={section.id} className={styles.luxurySection} variants={itemVariants}>
              <div className={styles.sectionDecor}></div>
              <h2 className={styles.luxuryHeading}>
                <span className={styles.luxuryAccent}></span>
                <span className={styles.headingIcon}>{section.icon}</span>
                {section.title}
              </h2>
              {section.content}
            </motion.section>
          ))}

          {/* User Rights Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              <span className={styles.headingIcon}><FaUserShield /></span>
              Quyền của bạn
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Chúng tôi tôn trọng và cam kết bảo vệ các quyền của người dùng theo quy định của pháp luật về bảo vệ dữ liệu cá nhân. Techify đảm bảo bạn có thể thực hiện đầy đủ các quyền sau:
              </p>

              <div className={styles.luxuryRightsGrid}>
                {userRights.map((right, idx) => (
                  <div key={idx} className={styles.luxuryRightCard}>
                    <div className={styles.rightIconWrapper}>
                      {right.icon}
                    </div>
                    <h3>{right.title}</h3>
                    <p>{right.description}</p>
                    <div className={styles.cardGlow}></div>
                  </div>
                ))}
              </div>

              <div className={styles.luxuryNoteBox}>
                <div className={styles.noteIconWrapper}>✦</div>
                <div className={styles.noteContent}>
                  <h4>Thực hiện quyền của bạn</h4>
                  <p>
                    Để thực hiện bất kỳ quyền nào của mình, bạn có thể liên hệ với Techify qua email <span className={styles.emailHighlight}>privacy@techify.asia</span> hoặc thông qua mục "Cài đặt quyền riêng tư" trong tài khoản của bạn.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Lifecycle Section */}
          <motion.section className={styles.luxurySection} variants={itemVariants}>
            <div className={styles.sectionDecor}></div>
            <h2 className={styles.luxuryHeading}>
              <span className={styles.luxuryAccent}></span>
              Vòng đời dữ liệu
            </h2>
            <div className={styles.luxurySectionContent}>
              <p className={styles.luxuryParagraph}>
                Chúng tôi xử lý thông tin cá nhân của bạn qua một quy trình chặt chẽ và minh bạch, đảm bảo an toàn ở mỗi giai đoạn:
              </p>

              <div className={styles.luxuryLifecycle}>
                {lifecycleSteps.map((step, idx) => (
                  <div key={idx} className={styles.lifecycleStep}>
                    <div className={styles.stepNumber}>
                      <span>{idx + 1}</span>
                    </div>
                    <div className={styles.stepContent}>
                      <h3>{step.title}</h3>
                      <p>{step.content}</p>
                    </div>
                </div>
              ))}
              </div>
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section className={styles.luxurySupportSection} variants={itemVariants}>
            <div className={styles.supportDecorLeft}></div>
            <div className={styles.supportDecorRight}></div>
            <h2 className={styles.luxuryHeadingCentered}>
              <span className={styles.luxuryAccentCenter}></span>
              Liên hệ về bảo mật
            </h2>
            <p className={styles.luxuryDescriptionCentered}>
              Đội ngũ bảo mật chuyên nghiệp của Techify luôn sẵn sàng hỗ trợ mọi câu hỏi về quyền riêng tư
            </p>
            <div className={styles.luxuryContactInfo}>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Email bảo mật</h3>
                  <p>privacy@techify.asia</p>
                  <span>Phản hồi trong vòng 24 giờ</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Hotline bảo mật</h3>
                  <p>1800 8686</p>
                  <span>8:00 - 20:00 mỗi ngày</span>
                </div>
              </div>
              <div className={styles.luxuryContactItem}>
                <div className={styles.contactIcon}>✦</div>
                <div className={styles.contactText}>
                  <h3>Cổng bảo mật</h3>
                  <p>security.techify.asia</p>
                  <span>Báo cáo sự cố bảo mật</span>
                </div>
              </div>
            </div>
            <div className={styles.updatedDate}>
              <p>Chính sách này được cập nhật lần cuối vào ngày 01/06/2023</p>
            </div>
            <motion.button 
              className={styles.luxuryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className={styles.buttonText}>LIÊN HỆ ĐỘI BẢO MẬT</span>
              <span className={styles.buttonIcon}>→</span>
            </motion.button>
          </motion.section>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;