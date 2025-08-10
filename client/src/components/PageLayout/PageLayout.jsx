import React, { useEffect } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './PageLayout.module.scss';
import { motion } from 'framer-motion';

const PageLayout = ({ children, title }) => {
  // Update page title if provided
  useEffect(() => {
    if (title) {
      document.title = `${title} | Techify`;
    }
  }, [title]);

  // Animation variants for page content
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: 20 }
  };

  return (
    <>
      <Header />
      <main className={styles.pageContent}>
        <motion.div
          className={styles.pageContainer}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={pageVariants}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </>
  );
};

export default PageLayout; 