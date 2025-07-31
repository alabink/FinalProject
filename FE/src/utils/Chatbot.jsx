import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.scss';
import { requestAskQuestion } from '../Config/request';
import {
    RobotOutlined,
    CloseOutlined,
    SendOutlined,
    UserOutlined,
    ThunderboltOutlined,
    ShoppingCartOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
    const { dataUser } = useStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        // Khôi phục lịch sử chat từ localStorage nếu có
        const savedMessages = localStorage.getItem(`chat_history_${dataUser?._id}`);
        return savedMessages ? JSON.parse(savedMessages) : [
            {
                text: 'Xin chào! Tôi là TechifyAI - trợ lý thông minh của bạn. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn công nghệ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì hôm nay? 🚀',
                sender: 'bot',
                timestamp: new Date().toISOString()
            },
        ];
    });
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Lưu lịch sử chat vào localStorage mỗi khi có thay đổi
    useEffect(() => {
        if (dataUser?._id) {
            localStorage.setItem(`chat_history_${dataUser._id}`, JSON.stringify(messages));
        }
    }, [messages, dataUser?._id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputMessage.trim() && !isLoading) {
            const userMessage = inputMessage.trim();
            const timestamp = new Date().toISOString();

            setMessages((prev) => [...prev, {
                text: userMessage,
                sender: 'user',
                timestamp
            }]);
            setInputMessage('');
            setIsLoading(true);

            try {
                const response = await requestAskQuestion({
                    question: userMessage,
                    userId: dataUser?._id || 'guest' // Gửi userId để backend có thể theo dõi lịch sử chat
                });

                setMessages((prev) => [...prev, {
                    text: response,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                }]);
            } catch (error) {
                setMessages((prev) => [
                    ...prev,
                    {
                        text: '🤖 Xin lỗi, hệ thống TechifyAI tạm thời gặp sự cố. Vui lòng thử lại sau nhé!',
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Xóa lịch sử chat
    const clearChatHistory = () => {
        setMessages([{
            text: 'Xin chào! Tôi là TechifyAI - trợ lý thông minh của bạn. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn công nghệ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì hôm nay? 🚀',
            sender: 'bot',
            timestamp: new Date().toISOString()
        }]);
        if (dataUser?._id) {
            localStorage.removeItem(`chat_history_${dataUser._id}`);
        }
    };

    // Hàm render message content
    const renderMessageContent = (message) => {
        // Kiểm tra xem có phải JSON response không
        if (typeof message.text === 'object' && message.text.type === 'product_info') {
            return (
                <div className={styles.productResponse}>
                    <div className={styles.productMessage}>
                        {message.text.message}
                    </div>
                    <div className={styles.productGrid}>
                        {message.text.products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className={styles.productCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className={styles.productImage}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-product.jpg';
                                        }}
                                    />
                                </div>

                                <div className={styles.productInfo}>
                                    <h4 className={styles.productName}>{product.name}</h4>
                                    <div className={styles.productPrice}>
                                        {product.priceDiscount ? (
                                            <>
                                                <span className={styles.discountPrice}>
                                                    {product.priceDiscount.toLocaleString('vi-VN')}đ
                                                </span>
                                                <span className={styles.originalPrice}>
                                                    {product.price.toLocaleString('vi-VN')}đ
                                                </span>
                                            </>
                                        ) : (
                                            <span className={styles.price}>
                                                {product.price.toLocaleString('vi-VN')}đ
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.productActions}>
                                        <button
                                            className={styles.viewButton}
                                            onClick={() => {
                                                navigate(`/product/${product.slug}`);
                                                setIsOpen(false);
                                            }}
                                        >
                                            <EyeOutlined /> Xem chi tiết
                                        </button>
                                        {/* <button
                                            className={styles.cartButton}
                                            onClick={() => {
                                                // Thêm vào giỏ hàng logic ở đây
                                                console.log('Add to cart:', product.id);
                                            }}
                                        >
                                            <ShoppingCartOutlined /> Thêm vào giỏ
                                        </button> */}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        }

        // Render text bình thường
        return <div className={styles.messageText}>{message.text}</div>;
    };

    return (
        <>
            <motion.button
                className={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Đóng TechifyAI" : "Mở TechifyAI"}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: [
                        "0 0 20px rgba(102, 126, 234, 0.3)",
                        "0 0 30px rgba(102, 126, 234, 0.5)",
                        "0 0 20px rgba(102, 126, 234, 0.3)"
                    ]
                }}
                transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
            >
                <RobotOutlined className={styles.chatIcon} />
                <div className={styles.chatButtonGlow} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatbotContainer}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className={styles.chatHeader}>
                            <div className={styles.headerContent}>
                                <div className={styles.aiAvatar}>
                                    <RobotOutlined />
                                    <div className={styles.aiStatus} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h2>TechifyAI</h2>
                                    <span className={styles.subtitle}>
                                        <ThunderboltOutlined /> Trợ lý thông minh
                                    </span>
                                </div>
                            </div>
                            <div className={styles.headerActions}>
                                <motion.button
                                    className={styles.clearButton}
                                    onClick={clearChatHistory}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Xóa lịch sử chat"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" />
                                    </svg>
                                </motion.button>
                                <motion.button
                                    className={styles.closeButton}
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Đóng chat"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <CloseOutlined />
                                </motion.button>
                            </div>
                        </div>

                        <div className={styles.messageList}>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage
                                        }`}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className={styles.messageAvatar}>
                                        {message.sender === 'user' ? (
                                            dataUser?.avatar ? (
                                                <img
                                                    src={`http://localhost:3000/uploads/avatars/${dataUser.avatar}`}
                                                    alt={dataUser.fullName || 'User'}
                                                    className={styles.userAvatarImage}
                                                />
                                            ) : (
                                                <UserOutlined />
                                            )
                                        ) : (
                                            <RobotOutlined />
                                        )}
                                    </div>
                                    <div className={styles.messageContent}>
                                        {renderMessageContent(message)}
                                        <div className={styles.messageTime}>
                                            {message.sender === 'bot' ? 'TechifyAI' : (dataUser?.fullName || 'Bạn')} • {
                                                new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: '2-digit',
                                                    month: '2-digit'
                                                })
                                            }
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    className={`${styles.message} ${styles.botMessage}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className={styles.messageAvatar}>
                                        <RobotOutlined />
                                    </div>
                                    <div className={styles.messageContent}>
                                        <div className={styles.typingIndicator}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <div className={styles.messageTime}>
                                            TechifyAI đang soạn tin...
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSubmit} className={styles.inputForm}>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Hỏi TechifyAI bất cứ điều gì..."
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                                <motion.button
                                    type="submit"
                                    className={styles.sendButton}
                                    disabled={isLoading || !inputMessage.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <SendOutlined />
                                </motion.button>
                            </div>
                            <div className={styles.quickActions}>
                                <span className={styles.quickLabel}>Gợi ý:</span>
                                <button type="button" className={styles.quickAction} onClick={() => setInputMessage('Tư vấn điện thoại chơi game')}>
                                    🎮 Gaming phone
                                </button>
                                <button type="button" className={styles.quickAction} onClick={() => setInputMessage('Điện thoại chụp ảnh đẹp')}>
                                    📸 Camera tốt
                                </button>
                                <button type="button" className={styles.quickAction} onClick={() => setInputMessage('So sánh các điện thoại')}>
                                    🔍 So sánh
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
